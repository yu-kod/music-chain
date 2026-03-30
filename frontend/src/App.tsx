import { Routes, Route, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ConnectPage from "./pages/ConnectPage";
import ResultPage from "./pages/ResultPage";
import NodeDetailPage from "./pages/NodeDetailPage";

export default function App() {
  return (
    <div className="container">
      <Link to="/" style={{ textDecoration: "none" }}>
        <header className="header">
          <h1>Music Chain</h1>
          <p>みんなで育てる音楽ネットワーク地図</p>
        </header>
      </Link>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/connect" element={<ConnectPage />} />
        <Route path="/connect/:id" element={<ConnectPage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/node/:id" element={<NodeDetailPage />} />
      </Routes>
    </div>
  );
}
