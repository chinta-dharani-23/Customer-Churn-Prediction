import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { getDashboard } from "../api/client.js";
import { useApi } from "../hooks.js";
import StatCard from "../components/StatCard.jsx";
import { Loading, ErrorBox } from "../components/Status.jsx";

const COLORS = { Low: "#22c55e", Medium: "#f59e0b", High: "#ef4444" };

export default function Dashboard() {
  const { data, error, loading } = useApi(getDashboard);

  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} />;

  const risk = Object.entries(data.risk_distribution).map(([name, value]) => ({ name, value }));

  return (
    <>
      <h1>Dashboard</h1>
      <p className="muted">Aggregate view of every prediction logged so far.</p>

      <div className="grid-3">
        <StatCard label="Total predictions" value={data.total_predictions} />
        <StatCard label="Predicted churn rate" value={`${(data.churn_rate * 100).toFixed(1)}%`} />
        <StatCard label="High-risk customers" value={data.risk_distribution.High ?? 0} />
      </div>

      {data.total_predictions === 0 ? (
        <div className="card empty">No predictions yet. Make one on the Predict or Batch Upload page.</div>
      ) : (
        <div className="grid-2">
          <div className="card">
            <h3>Risk distribution</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={risk} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} label>
                  {risk.map((r) => <Cell key={r.name} fill={COLORS[r.name] || "#94a3b8"} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <h3>Predictions over time</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data.predictions_over_time}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </>
  );
}
