import { useQuery } from '@tanstack/react-query';
import { fetchTeamDetail } from '../api/footballData';

export function useTeam(teamId: number, clubShort: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['team', teamId, clubShort],
    queryFn: () => fetchTeamDetail(teamId, clubShort),
    staleTime: 7 * 24 * 60 * 60 * 1000, // 7 days
    enabled: enabled && !!teamId,
  });
}
