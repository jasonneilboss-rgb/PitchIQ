import { useQuery } from '@tanstack/react-query';
import { fetchHeadToHead } from '../api/footballData';

export function useHeadToHead(matchId: number, homeName: string, awayName: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['h2h', matchId, homeName, awayName],
    queryFn: () => fetchHeadToHead(matchId, homeName, awayName),
    staleTime: Infinity,
    enabled: enabled && !!matchId,
  });
}
