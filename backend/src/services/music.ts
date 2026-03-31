export type MusicPlatform = "youtube" | "spotify";

export interface ParsedUrl {
  platform: MusicPlatform;
  rawId: string;
  nodeId: string; // "yt:xxx" or "sp:xxx"
}

export interface TrackInfo {
  title: string;
  channelName: string;
  thumbnailUrl: string;
}

const YOUTUBE_PATTERN =
  /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/;

const SPOTIFY_PATTERN =
  /(?:open\.spotify\.com\/(?:intl-[a-z]{2}\/)?track\/|spotify:track:)([a-zA-Z0-9]{22})/;

export function parseUrl(url: string): ParsedUrl | null {
  const ytMatch = url.match(YOUTUBE_PATTERN);
  if (ytMatch) {
    return { platform: "youtube", rawId: ytMatch[1], nodeId: `yt:${ytMatch[1]}` };
  }

  const spMatch = url.match(SPOTIFY_PATTERN);
  if (spMatch) {
    return { platform: "spotify", rawId: spMatch[1], nodeId: `sp:${spMatch[1]}` };
  }

  return null;
}

export async function fetchTrackInfo(parsed: ParsedUrl): Promise<TrackInfo> {
  if (parsed.platform === "youtube") {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${parsed.rawId}&format=json`;
    const res = await fetch(oembedUrl);
    if (!res.ok) {
      throw new Error(`YouTube oEmbed API error: ${res.status}`);
    }
    const data = (await res.json()) as { title: string; author_name: string };
    return {
      title: data.title,
      channelName: data.author_name,
      thumbnailUrl: `https://img.youtube.com/vi/${parsed.rawId}/mqdefault.jpg`,
    };
  }

  const oembedUrl = `https://open.spotify.com/oembed?url=https://open.spotify.com/track/${parsed.rawId}`;
  const res = await fetch(oembedUrl);
  if (!res.ok) {
    throw new Error(`Spotify oEmbed API error: ${res.status}`);
  }
  const data = (await res.json()) as {
    title: string;
    author_name?: string;
    thumbnail_url?: string;
  };
  return {
    title: data.title,
    channelName: data.author_name ?? "",
    thumbnailUrl: data.thumbnail_url ?? "",
  };
}
