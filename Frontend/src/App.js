import React, { useState } from "react";

function App() {
  const [file, setFile] = useState(null);
  const [rules, setRules] = useState(["", "", ""]);
  const [results, setResults] = useState([]);

  const handleFileChange = (e) => setFile(e.target.files[0]);
  const handleRuleChange = (index, value) => {
    const newRules = [...rules];
    newRules[index] = value;
    setRules(newRules);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("file", file);
    data.append("rule1", rules[0]);
    data.append("rule2", rules[1]);
    data.append("rule3", rules[2]);

    try {
      const resp = await fetch("http://localhost:8000/check-pdf/", {
        method: "POST",
        body: data,
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: 'Server error' }));
        alert(err.error || 'Server error');
        return;
      }
      const json = await resp.json();
      setResults(json.results || []);
    } catch (err) {
      console.error(err);
      alert('Network error: ' + (err.message || err));
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto" }}>
      <h2>PDF Rule Checker</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="application/pdf" onChange={handleFileChange} required />
        <br /><br />
        {rules.map((r, i) => (
          <input
            key={i}
            type="text"
            placeholder={`Rule #${i + 1}`}
            value={r}
            onChange={e => handleRuleChange(i, e.target.value)}
            required
            style={{ display: "block", margin: "8px 0" }}
          />
        ))}
        <button type="submit">Check Document</button>
      </form>
      <hr />
      <h3>Results</h3>
      <table border="1" cellPadding="6">
        <thead>
          <tr>
            <th>Rule</th>
            <th>Status</th>
            <th>Evidence</th>
            <th>Reasoning</th>
            <th>Confidence</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r, idx) => (
            <tr key={idx}>
              <td>{r.rule}</td>
              <td>{r.status}</td>
              <td>{r.evidence}</td>
              <td>{r.reasoning}</td>
              <td>{r.confidence}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default App;
