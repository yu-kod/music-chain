import { useLocation, useNavigate, Link } from "react-router-dom";
import type { Node as NodeType, Connection } from "../api/client";
import YouTubeEmbed from "../components/YouTubeEmbed";
import NodeCard from "../components/NodeCard";

interface ResultState {
  isFirst: boolean;
  fromNode: NodeType;
  toNode: NodeType;
  connections: Connection[];
}

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ResultState | null;

  if (!state) {
    return (
      <div className="text-center mt-24">
        <p className="text-muted">データがありません</p>
        <Link to="/" className="btn btn-outline mt-16" style={{ display: "inline-flex" }}>
          ホームに戻る
        </Link>
      </div>
    );
  }

  const { isFirst, fromNode, toNode, connections } = state;

  const tweetText = isFirst
    ? `「${fromNode.title}」と「${toNode.title}」を最初につなぎました！\n#MusicChain`
    : `「${fromNode.title}」と「${toNode.title}」をつなぎました！\n#MusicChain`;
  const tweetUrl = `https://music-chain.yu-web.site/node/${toNode.id}`;
  const twitterHref = `https://x.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(tweetUrl)}`;

  return (
    <>
      {isFirst ? (
        <div className="text-center mb-16">
          <span className="badge badge-first">あなたが最初につなぎました！</span>
        </div>
      ) : (
        <p className="text-center text-muted text-sm mb-16">
          つながりを投稿しました
        </p>
      )}

      <p className="text-sm text-muted mb-8">つないだ曲</p>
      <YouTubeEmbed videoId={toNode.id} />
      <div className="card">
        <div style={{ fontWeight: 700 }}>{toNode.title}</div>
        <div className="text-sm text-muted">{toNode.channel_name}</div>
      </div>

      {connections.length > 0 && (
        <>
          <hr className="divider" />
          <p className="text-sm text-muted mb-8">
            この曲につながっている曲（{connections.length}件）
          </p>
          {connections.map((c) => (
            <NodeCard key={c.id} node={c} />
          ))}
        </>
      )}

      <hr className="divider" />
      <a
        className="btn btn-tweet"
        href={twitterHref}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: "none", marginBottom: 8 }}
      >
        Xでシェア
      </a>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          className="btn btn-outline"
          onClick={() => navigate("/connect")}
        >
          もう1曲つなぐ
        </button>
        <Link to="/" className="btn" style={{ textDecoration: "none" }}>
          ホームへ
        </Link>
      </div>
    </>
  );
}
