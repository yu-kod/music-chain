import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, type Node as NodeType } from "../api/client";
import YouTubeEmbed from "../components/YouTubeEmbed";
import { isValidYoutubeUrl } from "../utils/youtube";

export default function ConnectPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [fromNode, setFromNode] = useState<NodeType | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [rerolling, setRerolling] = useState(false);
  const [error, setError] = useState("");
  const [showHint, setShowHint] = useState(false);

  const loadNode = useCallback(async (nodeId?: string) => {
    try {
      if (nodeId) {
        const detail = await api.getNode(nodeId);
        setFromNode(detail.node);
      } else {
        const node = await api.getRandomNode();
        setFromNode(node);
      }
    } catch (err: any) {
      setError(err.message || "曲の取得に失敗しました");
    }
  }, []);

  useEffect(() => {
    loadNode(id);
  }, [id, loadNode]);

  const handleReroll = async () => {
    setRerolling(true);
    setError("");
    try {
      const node = await api.getRandomNode();
      setFromNode(node);
    } catch (err: any) {
      setError(err.message || "曲の取得に失敗しました");
    } finally {
      setRerolling(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromNode || !youtubeUrl.trim() || !isValidYoutubeUrl(youtubeUrl.trim())) return;
    if (comment.length > 30) return;

    setLoading(true);
    setError("");
    try {
      const result = await api.createEdge(fromNode.id, youtubeUrl.trim(), comment.trim());
      navigate("/result", {
        state: {
          isFirst: result.isFirst,
          fromNode,
          toNode: result.toNode,
          connections: result.connections,
        },
      });
    } catch (err: any) {
      setError(err.message || "投稿に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  if (!fromNode && !error) {
    return <p className="text-center text-muted mt-24">読み込み中...</p>;
  }

  return (
    <>
      {fromNode && (
        <>
          <div className="hint-row mb-8">
            <p className="text-sm text-muted">この曲につなげよう</p>
            <button
              className="hint-toggle"
              type="button"
              onClick={() => setShowHint((prev) => !prev)}
            >
              <span className="material-icons" style={{ fontSize: 18 }}>help_outline</span>
            </button>
          </div>
          {showHint && (
            <div className="hint-box mb-8">
              <p>こんな曲をつなげてみよう:</p>
              <ul>
                <li>曲調やジャンルが似ている曲</li>
                <li>同じアニメ・ドラマ・CMで使われた曲</li>
                <li>同じ気分のときに聴きたくなる曲</li>
                <li>同じアーティストの別の曲</li>
                <li>理由は何でもOK！</li>
              </ul>
            </div>
          )}
          <YouTubeEmbed videoId={fromNode.id} />
          <div className="card">
            <div style={{ fontWeight: 700 }}>{fromNode.title}</div>
            <div className="text-sm text-muted">{fromNode.channel_name}</div>
          </div>
          <div style={{ display: "flex", gap: 8 }} className="mt-8">
            <button
              className="btn btn-outline"
              onClick={handleReroll}
              disabled={rerolling}
            >
              {rerolling ? "読み込み中..." : "別の曲にする"}
            </button>
            <button
              className="btn btn-outline"
              onClick={() => navigate(`/node/${fromNode.id}`)}
            >
              つながりを見る
            </button>
          </div>
        </>
      )}

      <form onSubmit={handleSubmit} className="mt-16">
        <label className="label">つなぎたい曲のYouTube URL</label>
        <input
          className="input"
          type="text"
          placeholder="https://www.youtube.com/watch?v=..."
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
        />
        {youtubeUrl.trim() && !isValidYoutubeUrl(youtubeUrl.trim()) && (
          <p className="error mt-8">YouTube の URL を入力してください</p>
        )}

        <div className="mt-12">
          <label className="label">つながりの理由（一言コメント）</label>
          <input
            className="input"
            type="text"
            placeholder="例：同じ雰囲気の曲"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={30}
          />
          <div className={`char-count ${comment.length > 30 ? "over" : ""}`}>
            {comment.length}/30
          </div>
        </div>

        <button
          className="btn mt-16"
          type="submit"
          disabled={loading || !youtubeUrl.trim() || !isValidYoutubeUrl(youtubeUrl.trim())}
        >
          {loading ? "投稿中..." : "つなぐ！"}
        </button>
      </form>

      {error && <p className="error mt-8">{error}</p>}

      <hr className="divider" />
      <button className="btn btn-outline" onClick={() => navigate("/")}>
        トップに戻る
      </button>
    </>
  );
}
