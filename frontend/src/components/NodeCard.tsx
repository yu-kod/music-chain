import { useNavigate } from "react-router-dom";
import type { Connection } from "../api/client";

interface Props {
  node: Connection;
}

export default function NodeCard({ node }: Props) {
  const navigate = useNavigate();

  return (
    <div className="node-card" onClick={() => navigate(`/node/${node.id}`)}>
      <img src={node.thumbnail_url} alt={node.title} />
      <div className="node-card-info">
        <div className="node-card-title">{node.title}</div>
        <div className="node-card-channel">{node.channel_name}</div>
        {node.comments.length > 0 && (
          <div className="node-card-comment">
            「{node.comments[0]}」
            {node.comments.length > 1 && (
              <span className="text-muted"> ほか{node.comments.length - 1}件</span>
            )}
          </div>
        )}
        {node.connection_count > 1 && (
          <div className="node-card-count text-sm text-muted">
            {node.connection_count}人がつないだ
          </div>
        )}
      </div>
    </div>
  );
}
