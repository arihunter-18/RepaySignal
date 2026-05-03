import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertsApi } from '../api/alerts';

export function useAlerts(state = 'triggered') {
  return useQuery({
    queryKey: ['alerts', state],
    queryFn: () => alertsApi.list(state),
    refetchInterval: state === 'triggered' ? 30_000 : false,
  });
}

export function useMarkActioned() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ alertId, action_taken }: { alertId: string; action_taken: string }) =>
      alertsApi.markActioned(alertId, action_taken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    },
  });
}