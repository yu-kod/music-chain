const YOUTUBE_PATTERN =
  /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/;

const SPOTIFY_PATTERN =
  /(?:open\.spotify\.com\/(?:intl-[a-z]{2}\/)?track\/|spotify:track:)([a-zA-Z0-9]{22})/;

const NICONICO_PATTERN =
  /(?:nicovideo\.jp\/watch\/|nico\.ms\/)((?:sm|nm|so)\d+)/;

export function isValidMusicUrl(url: string): boolean {
  return YOUTUBE_PATTERN.test(url) || SPOTIFY_PATTERN.test(url) || NICONICO_PATTERN.test(url);
}
