const JAMENDO_CLIENT_ID = '80325e7e';
const BASE_URL = 'https://api.jamendo.com/v3.0';

export type JamendoTrack = {
  id: string;
  title: string;
  artist: string;
  duration: string;
  cover: string;
  audioUrl: string;
  uses: string;
};

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatTrack = (track: any): JamendoTrack => ({
  id: track.id,
  title: track.name,
  artist: track.artist_name,
  duration: formatDuration(track.duration),
  cover: track.image,
  audioUrl: track.audio,
  uses: 'Royalty-free',
});

const fetchTracks = async (params: Record<string, string>): Promise<JamendoTrack[]> => {
  const query = new URLSearchParams({
    client_id: JAMENDO_CLIENT_ID,
    format: 'json',
    limit: '25',
    ...params,
  });
  const res = await fetch(`${BASE_URL}/tracks/?${query.toString()}`);
  const data = await res.json();
  return (data.results ?? []).map(formatTrack);
};

export const searchJamendoTracks = (query: string) =>
  fetchTracks({ search: query, order: 'popularity_total' });

export const fetchTrendingTracks = () =>
  fetchTracks({ order: 'popularity_week' });

export const fetchPopularTracks = () =>
  fetchTracks({ order: 'popularity_total' });

export const fetchRecentTracks = () =>
  fetchTracks({ order: 'releasedate_desc' });