import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

export default function HomePage() {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    try {
      const result = await api.search(url.trim());
      if (result.found) {
        navigate(`/node/${result.node!.id}`);
      } else {
        navigate(`/connect?seedUrl=${encodeURIComponent(url.trim())}`);
      }
    } catch (err: any) {
      setError(err.message || "検索に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleRandom = async () => {
    setLoading(true);
    setError("");
    try {
      const node = await api.getRandomNode();
      navigate(`/connect/${node.id}`);
    } catch (err: any) {
      setError(err.message || "ノードの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSearch}>
        <label className="label">YouTube URLで曲を検索</label>
        <input
          className="input"
          type="text"
          placeholder="https://www.youtube.com/watch?v=..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button className="btn mt-12" type="submit" disabled={loading}>
          検索する
        </button>
      </form>

      <hr className="divider" />

      <div className="text-center">
        <p className="text-muted text-sm mb-8">
          ランダムな曲に出会って、つなげてみよう
        </p>
        <button
          className="btn btn-outline"
          onClick={handleRandom}
          disabled={loading}
        >
          ランダムにつなぐ
        </button>
      </div>

      {error && <p className="error mt-8">{error}</p>}
    </>
  );
}
