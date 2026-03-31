import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { isValidYoutubeUrl } from "../utils/youtube";

export default function HomePage() {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [registering, setRegistering] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !isValidYoutubeUrl(url.trim())) return;
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
      <form onSubmit={handleSearch}>
        <label className="label">YouTube URLで曲を検索</label>
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
        {url.trim() && !isValidYoutubeUrl(url.trim()) && (
          <p className="error mt-8">YouTube の URL を入力してください</p>
        )}
        <button className="btn mt-12" type="submit" disabled={loading || (!!url.trim() && !isValidYoutubeUrl(url.trim()))}>
          検索する
        </button>
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
