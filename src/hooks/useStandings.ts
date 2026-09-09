import { useQuery } from '@tanstack/react-query';
import { fetchStandings } from '../api/footballData';

export function useStandings() {
  return useQuery({
    queryKey: ['standings'],
    queryFn: fetchStandings,
    staleTime: 6 * 60 * 60 * 1000, // 6 hours
  });
}
