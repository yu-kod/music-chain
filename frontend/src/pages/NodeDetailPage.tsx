import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, type Node as NodeType, type Connection } from "../api/client";
import YouTubeEmbed from "../components/YouTubeEmbed";
import NodeCard from "../components/NodeCard";

export default function NodeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [node, setNode] = useState<NodeType | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const detail = await api.getNode(id);
        setNode(detail.node);
        setConnections(detail.connections);
      } catch (err: any) {
        setError(err.message || "曲の取得に失敗しました");
      }
    };
    load();
  }, [id]);

  if (error) {
    return <p className="error text-center mt-24">{error}</p>;
  }

  if (!node) {
    return <p className="text-center text-muted mt-24">読み込み中...</p>;
  }

  return (
    <>
      <YouTubeEmbed videoId={node.id} />
      <div className="card">
        <div style={{ fontWeight: 700, fontSize: 18 }}>{node.title}</div>
        <div className="text-sm text-muted mt-8">{node.channel_name}</div>
      </div>

      <button
        className="btn mt-12"
        onClick={() => navigate(`/connect/${node.id}`)}
      >
        この曲につなぐ
      </button>

      {connections.length > 0 && (
        <>
          <hr className="divider" />
          <p className="text-sm text-muted mb-8">
            つながっている曲（{connections.length}件）
          </p>
          {connections.map((c) => (
            <NodeCard key={c.id} node={c} />
          ))}
        </>
      )}

      {connections.length === 0 && (
        <>
          <hr className="divider" />
          <p className="text-center text-muted">
            まだ誰もつないでいません。最初につなぎませんか？
          </p>
        </>
      )}
    </>
  );
}
