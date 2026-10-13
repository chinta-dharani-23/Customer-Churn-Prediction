import { useState } from "react";
import { FIELDS, DEFAULTS } from "../constants/options.js";
import { predictOne } from "../api/client.js";
import RiskBadge from "../components/RiskBadge.jsx";
import { ErrorBox } from "../components/Status.jsx";

export default function Predict() {
  const [form, setForm] = useState(DEFAULTS);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (f, raw) => {
    let v = raw;
    if (f.type === "number") v = raw === "" ? "" : f.int ? parseInt(raw, 10) : parseFloat(raw);
    if (f.numeric) v = Number(raw);
    setForm((s) => ({ ...s, [f.name]: v }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(""); setResult(null);
    try {
      setResult(await predictOne(form));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1>Predict churn</h1>
      <p className="muted">Enter a single customer's details to get a churn probability and the main drivers.</p>

      <div className="split">
        <form className="card" onSubmit={submit}>
          <div className="form-grid">
            {FIELDS.map((f) => (
              <label key={f.name}>
                <span>{f.label}</span>
                {f.type === "select" ? (
                  <select value={form[f.name]} onChange={(e) => onChange(f, e.target.value)}>
                    {f.options.map((o) =>
                      typeof o === "object"
                        ? <option key={o.v} value={o.v}>{o.l}</option>
                        : <option key={o} value={o}>{o}</option>
                    )}
                  </select>
                ) : (
                  <input
                    type="number" required min={f.min} max={f.max} step={f.step}
                    value={form[f.name]} onChange={(e) => onChange(f, e.target.value)}
                  />
                )}
              </label>
            ))}
          </div>
          <button className="btn" disabled={loading}>{loading ? "Predicting..." : "Predict"}</button>
          <ErrorBox message={error} />
        </form>

        <div className="card result">
          {!result ? (
            <p className="muted">Result will appear here.</p>
          ) : (
            <>
              <div className="gauge">
                <div className="gauge-num">{(result.churn_probability * 100).toFixed(1)}%</div>
                <div className="muted">churn probability</div>
                <RiskBadge level={result.risk_level} />
              </div>
              <p className="verdict">
                {result.churn_prediction ? "Likely to churn" : "Likely to stay"}
              </p>
              <div className="bar"><div className={`bar-fill badge-${result.risk_level.toLowerCase()}`} style={{ width: `${result.churn_probability * 100}%` }} /></div>

              <h3>Top factors</h3>
              {result.top_factors.length === 0 ? (
                <p className="muted">This model doesn't expose feature importances.</p>
              ) : (
                <table className="table">
                  <thead><tr><th>Feature</th><th>Importance</th><th>Encoded value</th></tr></thead>
                  <tbody>
                    {result.top_factors.map((t) => (
                      <tr key={t.feature}><td>{t.feature}</td><td>{t.importance}</td><td>{t.value}</td></tr>
                    ))}
                  </tbody>
                </table>
              )}
              <p className="muted small">Model: {result.model_used}</p>
            </>
          )}
        </div>
      </div>
    </>
  );
}
