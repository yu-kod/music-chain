import { Routes, Route, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ConnectPage from "./pages/ConnectPage";
import ResultPage from "./pages/ResultPage";
import NodeDetailPage from "./pages/NodeDetailPage";
import PrivacyPage from "./pages/PrivacyPage";
import KofiButton from "./components/KofiButton";

export default function App() {
  return (
    <div className="container">
      <Link to="/" style={{ textDecoration: "none" }}>
        <header className="header">
          <h1>Music Chain</h1>
          <p>好きな曲をつなげて、音楽のつながりを広げよう</p>
        </header>
      </Link>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/connect" element={<ConnectPage />} />
        <Route path="/connect/:id" element={<ConnectPage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/node/:id" element={<NodeDetailPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
      </Routes>
      <KofiButton />
      <footer className="footer">
        <Link to="/privacy">プライバシーポリシー</Link>
        <span className="footer-divider">|</span>
        <a href="https://x.com/yut_720" target="_blank" rel="noopener noreferrer">
          @yut_720
        </a>
      </footer>
    </div>
  );
}
