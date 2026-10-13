import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from "recharts";
import { getModels } from "../api/client.js";
import { useApi } from "../hooks.js";
import { Loading, ErrorBox } from "../components/Status.jsx";

const METRICS = ["accuracy", "precision", "recall", "f1", "roc_auc"];
const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4"];

export default function Models() {
  const { data, error, loading } = useApi(getModels);

  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} />;

  // backend returns { best_model, models: { Name: {accuracy, ..., confusion_matrix} } }
  const names = Object.keys(data.models);
  const chartData = names.map((n) => ({ model: n, ...data.models[n] }));

  return (
    <>
      <h1>Model comparison</h1>
      <p className="muted">Test-set metrics for all four ensemble models. Best model (by F1): <b>{data.best_model}</b></p>

      <div className="card">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="model" />
            <YAxis domain={[0, 1]} />
            <Tooltip />
            <Legend />
            {METRICS.map((m, i) => <Bar key={m} dataKey={m} fill={COLORS[i]} />)}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card scroll">
        <table className="table">
          <thead>
            <tr><th>Model</th>{METRICS.map((m) => <th key={m}>{m}</th>)}<th>cv_f1</th></tr>
          </thead>
          <tbody>
            {names.map((n) => (
              <tr key={n} className={n === data.best_model ? "best" : ""}>
                <td>{n}{n === data.best_model && <span className="badge badge-low"> best</span>}</td>
                {METRICS.map((m) => <td key={m}>{data.models[n][m] ?? "-"}</td>)}
                <td>{data.models[n].cv_f1_mean ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid-2">
        {names.map((n) => {
          const cm = data.models[n].confusion_matrix;
          if (!cm) return null;
          return (
            <div className="card" key={n}>
              <h3>{n} — confusion matrix</h3>
              <table className="cm">
                <thead><tr><th></th><th>Pred: stay</th><th>Pred: churn</th></tr></thead>
                <tbody>
                  <tr><th>Actual: stay</th><td>{cm[0][0]}</td><td>{cm[0][1]}</td></tr>
                  <tr><th>Actual: churn</th><td>{cm[1][0]}</td><td>{cm[1][1]}</td></tr>
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </>
  );
}
