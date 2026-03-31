interface Props {
  nodeId: string;
}

export default function MusicEmbed({ nodeId }: Props) {
  if (nodeId.startsWith("sp:")) {
    const trackId = nodeId.slice(3);
    return (
      <div className="spotify-embed">
        <iframe
          src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          title="Spotify track"
        />
      </div>
    );
  }

  if (nodeId.startsWith("nc:")) {
    const videoId = nodeId.slice(3);
    return (
      <div className="niconico-embed">
        <iframe
          src={`https://embed.nicovideo.jp/watch/${videoId}?persistence=1&oldScript=1&referer=&from=0`}
          allow="autoplay"
          allowFullScreen
          title="niconico video"
        />
      </div>
    );
  }

  // YouTube (yt: prefix or legacy)
  const videoId = nodeId.startsWith("yt:") ? nodeId.slice(3) : nodeId;
  return (
    <div className="youtube-embed">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="YouTube video"
      />
    </div>
  );
}
