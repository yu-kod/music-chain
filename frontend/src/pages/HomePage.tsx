import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { isValidMusicUrl } from "../utils/music";
import SampleMarquee from "../components/SampleMarquee";

export default function HomePage() {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [registering, setRegistering] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !isValidMusicUrl(url.trim())) return;
    setLoading(true);
    setError("");
    setNotFound(false);
    try {
      const result = await api.search(url.trim());
      if (result.found) {
        navigate(`/node/${result.node!.id}`);
      } else {
        setNotFound(true);
      }
    } catch (err: any) {
      setError(err.message || "検索に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setRegistering(true);
    setError("");
    try {
      const result = await api.registerNode(url.trim());
      navigate(`/node/${result.node.id}`);
    } catch (err: any) {
      setError(err.message || "登録に失敗しました");
    } finally {
      setRegistering(false);
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
      <button
        className="btn"
        onClick={handleRandom}
        disabled={loading}
      >
        {loading ? "読み込み中..." : "ランダムにつなぐ"}
      </button>

      <div className="home-or">
        <hr className="home-or-line" />
        <span className="home-or-text">or</span>
        <hr className="home-or-line" />
      </div>

      <form onSubmit={handleSearch}>
        <label className="label">URLで曲を検索（YouTube / Spotify / ニコニコ / SoundCloud）</label>
        <div className="search-row">
          <input
            className="input"
            type="text"
            placeholder="https://www.youtube.com/watch?v=..."
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setNotFound(false);
            }}
          />
          <button
            className="btn-icon"
            type="submit"
            disabled={loading || !url.trim() || !isValidMusicUrl(url.trim())}
          >
            <span className="material-icons">search</span>
          </button>
        </div>
        {url.trim() && !isValidMusicUrl(url.trim()) && (
          <p className="error mt-8">YouTube / Spotify / ニコニコ / SoundCloud の URL を入力してください</p>
        )}
      </form>

      {notFound && (
        <div className="card mt-12 text-center">
          <p className="mb-8">まだ誰もつないでいない曲です</p>
          <button
            className="btn"
            onClick={handleRegister}
            disabled={registering}
          >
            {registering ? "登録中..." : "この曲を登録する"}
          </button>
        </div>
      )}

      {error && <p className="error mt-8">{error}</p>}

      <SampleMarquee />
    </>
  );
}
