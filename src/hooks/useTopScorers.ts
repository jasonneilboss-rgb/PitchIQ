import { useQuery } from '@tanstack/react-query';
import { fetchTopScorers } from '../api/footballData';

export function useTopScorers() {
  return useQuery({
    queryKey: ['scorers'],
    queryFn: fetchTopScorers,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}
