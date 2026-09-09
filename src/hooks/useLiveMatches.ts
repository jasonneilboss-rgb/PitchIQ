import { useQuery } from '@tanstack/react-query';
import { fetchLiveMatches } from '../api/footballData';

export function useLiveMatches() {
  return useQuery({
    queryKey: ['live-matches'],
    queryFn: fetchLiveMatches,
    staleTime: 60 * 1000, // 60 seconds
    refetchInterval: 60 * 1000, // poll every 60 seconds
  });
}
