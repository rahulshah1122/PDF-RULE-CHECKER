from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import PyPDF2
import os

# Configure PERPLEXITY_API_KEY in .env

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Limit in production!
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/check-pdf/")
async def check_pdf(
    file: UploadFile = File(...),
    rule1: str = Form(...),
    rule2: str = Form(...),
    rule3: str = Form(...)
):
    pdf_reader = PyPDF2.PdfReader(file.file)
    text = "\n".join([page.extract_text() or "" for page in pdf_reader.pages])
    rules = [rule1, rule2, rule3]

    prompt = f"""You are a helpful assistant that checks PDF documents for rule compliance.
Document:
{text}

Rules to check:
1. {rules[0]}
2. {rules[1]}
3. {rules[2]}

For each rule, reply in JSON with keys: rule, status (pass/fail), evidence, reasoning, confidence (0-100). Output an array of 3 objects.
"""

    # Perplexity API 
    perplexity_key = os.getenv("PERPLEXITY_API_KEY")
    perplexity_url = os.getenv("PERPLEXITY_API_URL", "https://api.perplexity.ai/chat/completions")
    if not perplexity_key:
        return JSONResponse(content={"error": "Perplexity not configured. Set PERPLEXITY_API_KEY in .env."}, status_code=501)
    
    # Debug: log key presence
    print(f"[DEBUG] Using Perplexity key: {perplexity_key[:20]}... (len={len(perplexity_key)})")
    print(f"[DEBUG] Endpoint: {perplexity_url}")
    
    import httpx, json, traceback
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(
                perplexity_url,
                json={
                    "model": "sonar-pro",
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 2000,
                },
                headers={
                    "Authorization": f"Bearer {perplexity_key}",
                    "Content-Type": "application/json",
                },
            )
        resp.raise_for_status()
        data = resp.json()
        
        # Parse Perplexity response (format: {choices: [{message: {content: "..."}}]})
        if "choices" in data and len(data["choices"]) > 0:
            content = data["choices"][0]["message"]["content"]
            # Parse the JSON array from the response
            import re
            json_match = re.search(r"\[.*\]", content, re.DOTALL)
            if json_match:
                json_str = json_match.group()
                try:
                    results = json.loads(json_str)
                    return JSONResponse(content={"results": results})
                except json.JSONDecodeError as je:
                    print(f"[DEBUG] JSON parse error: {je}")
                    print(f"[DEBUG] JSON string (first 500 chars): {json_str[:500]}")
                    # Try to clean up extra data by finding the closing bracket properly
                    bracket_count = 0
                    for i, char in enumerate(json_str):
                        if char == '[':
                            bracket_count += 1
                        elif char == ']':
                            bracket_count -= 1
                            if bracket_count == 0:
                                json_str_clean = json_str[:i+1]
                                try:
                                    results = json.loads(json_str_clean)
                                    return JSONResponse(content={"results": results})
                                except:
                                    break
                    return JSONResponse(content={"error": "Failed to parse JSON from response", "detail": json_str[:200]}, status_code=502)
        
        return JSONResponse(content={"error": "Unexpected Perplexity response format", "detail": str(data)}, status_code=502)
    except httpx.HTTPStatusError as e:
        detail = f"HTTP {e.response.status_code}: {e.response.text}"
        print(f"[ERROR] Perplexity API error: {detail}")
        return JSONResponse(content={"error": "Perplexity API error", "detail": detail}, status_code=502)
    except Exception as e:
        print(f"[ERROR] Perplexity request failed: {traceback.format_exc()}")
        return JSONResponse(content={"error": "Perplexity request failed", "detail": str(e)}, status_code=502)
