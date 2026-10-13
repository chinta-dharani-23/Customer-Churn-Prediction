import { useState } from "react";
import { predictBatch } from "../api/client.js";
import { CSV_COLUMNS } from "../constants/options.js";
import RiskBadge from "../components/RiskBadge.jsx";
import { ErrorBox } from "../components/Status.jsx";

function downloadCsv(filename, rows) {
  const csv = rows.map((r) => r.join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function Batch() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("All");

  const upload = async () => {
    if (!file) return;
    setLoading(true); setError(""); setData(null);
    try {
      setData(await predictBatch(file));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const rows = data ? data.results.filter((r) => filter === "All" || r.risk_level === filter) : [];

  return (
    <>
      <h1>Batch upload</h1>
      <p className="muted">
        Upload a CSV with the same columns as the Telco dataset (no Churn column). Results come back ranked by risk.
      </p>

      <div className="card">
        <div className="row">
          <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <button className="btn" onClick={upload} disabled={!file || loading}>
            {loading ? "Scoring..." : "Run predictions"}
          </button>
          <button className="btn btn-ghost" onClick={() => downloadCsv("template.csv", [CSV_COLUMNS])}>
            Download template
          </button>
        </div>
        <ErrorBox message={error} />
      </div>

      {data && (
        <div className="card">
          <div className="row between">
            <h3>{data.count} customers scored</h3>
            <div className="row">
              <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                {["All", "High", "Medium", "Low"].map((o) => <option key={o}>{o}</option>)}
              </select>
              <button
                className="btn btn-ghost"
                onClick={() =>
                  downloadCsv("churn_results.csv", [
                    ["customerID", "churn_probability", "risk_level"],
                    ...data.results.map((r) => [r.customerID, r.churn_probability, r.risk_level]),
                  ])
                }
              >
                Export CSV
              </button>
            </div>
          </div>
          <div className="scroll">
            <table className="table">
              <thead><tr><th>#</th><th>Customer</th><th>Probability</th><th>Risk</th></tr></thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={`${r.customerID}-${i}`}>
                    <td>{i + 1}</td>
                    <td>{r.customerID}</td>
                    <td>{(r.churn_probability * 100).toFixed(1)}%</td>
                    <td><RiskBadge level={r.risk_level} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
