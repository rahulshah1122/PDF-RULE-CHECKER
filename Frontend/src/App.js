import React, { useState } from "react";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [rules, setRules] = useState(["", "", ""]);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => setFile(e.target.files[0]);
  const handleRuleChange = (index, value) => {
    const newRules = [...rules];
    newRules[index] = value;
    setRules(newRules);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
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
        setError(err.error || 'Server error from backend');
        setResults([]);
        return;
      }
      const json = await resp.json();
      setResults(json.results || []);
    } catch (err) {
      console.error(err);
      setError('Could not reach backend. Please start the backend and try again.');
      setResults([]);
    }
  };

  const dismissError = () => setError(null);

  return (
    <div style={{ maxWidth: 1000, margin: "auto", padding: 12 }}>
      <h2>PDF Rule Checker</h2>
      {error && (
        <div className="error-banner">
          <div className="error-message">{error}</div>
          <button type="button" className="error-dismiss" onClick={dismissError}>Dismiss</button>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <input style={{ width: '100%' }} type="file" accept="application/pdf" onChange={handleFileChange} required />
      <h3>Enter Rules</h3>
        {rules.map((r, i) => (
          <input
            key={i}
            type="text"
            placeholder={`Rule #${i + 1}`}
            value={r}
            onChange={e => handleRuleChange(i, e.target.value)}
            required
            style={{ display: "block", margin: "8px 0", width: '100%', padding: '8px' }}
          />
        ))}
        <button type="submit" style={{ marginTop: 8, padding: '10px 16px' }}>Check Document</button>
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
            {results.map((r, idx) => {
              const st = (r.status || "").toString().toLowerCase();
              const statusClass = st === "pass" ? "status-pass" : st === "fail" ? "status-fail" : "";
              return (
                <tr key={idx}>
                  <td>{r.rule}</td>
                  <td className={statusClass}>{r.status}</td>
                  <td>{r.evidence}</td>
                  <td>{r.reasoning}</td>
                  <td>{r.confidence}</td>
                </tr>
              );
            })}
          </tbody>
      </table>
    </div>
  );
};
export default App;
