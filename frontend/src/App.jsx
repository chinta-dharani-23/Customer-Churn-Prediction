import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Predict from "./pages/Predict.jsx";
import Batch from "./pages/Batch.jsx";
import Models from "./pages/Models.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="predict" element={<Predict />} />
        <Route path="batch" element={<Batch />} />
        <Route path="models" element={<Models />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
