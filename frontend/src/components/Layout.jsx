import { NavLink, Outlet } from "react-router-dom";

const links = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/predict", label: "Predict" },
  { to: "/batch", label: "Batch Upload" },
  { to: "/models", label: "Models" },
];

export default function Layout() {
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">Churn<span>IQ</span></div>
        <nav>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? "active" : "")}>
              {l.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
