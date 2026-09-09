import { useQuery } from '@tanstack/react-query';
import { fetchFixtures } from '../api/footballData';

export function useFixtures(matchday?: number) {
  return useQuery({
    queryKey: ['fixtures', matchday],
    queryFn: () => fetchFixtures(matchday),
    staleTime: 6 * 60 * 60 * 1000, // 6 hours
  });
}
