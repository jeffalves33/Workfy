import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useAdminReservations() {
  return useQuery({
    queryKey: ['admin', 'reservations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          space:spaces(id, title, owner_id),
          tenant:profiles!reservations_tenant_user_id_fkey(name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) {
        // Fallback without FK alias
        const { data: d2, error: e2 } = await supabase
          .from('reservations')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);
        if (e2) throw e2;
        return d2;
      }
      return data;
    },
  });
}

export function useAdminPayments() {
  return useQuery({
    queryKey: ['admin', 'payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;

      // Enrich with reservation info
      const enriched = await Promise.all(
        data.map(async (p) => {
          const { data: res } = await supabase
            .from('reservations')
            .select('total_cents, space_id, tenant_user_id, space:spaces(title)')
            .eq('id', p.reservation_id)
            .single();
          const { data: tenant } = res?.tenant_user_id
            ? await supabase.from('profiles').select('name, email').eq('user_id', res.tenant_user_id).single()
            : { data: null };
          return { ...p, reservation: res, tenant };
        })
      );

      return enriched;
    },
  });
}

export function useAdminPayouts() {
  return useQuery({
    queryKey: ['admin', 'payouts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payouts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;

      const enriched = await Promise.all(
        data.map(async (p) => {
          const { data: host } = await supabase.from('profiles').select('name, email').eq('user_id', p.host_user_id).single();
          return { ...p, host };
        })
      );

      return enriched;
    },
  });
}

export function useConfirmPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ paymentId, action }: { paymentId: string; action: 'confirm' | 'reject' }) => {
      const { error } = await supabase
        .from('payments')
        .update({
          status: action === 'confirm' ? 'CONFIRMED' : 'REJECTED',
          confirmed_at: new Date().toISOString(),
        })
        .eq('id', paymentId);
      if (error) throw error;

      // If confirmed, update reservation status
      if (action === 'confirm') {
        const { data: payment } = await supabase.from('payments').select('reservation_id').eq('id', paymentId).single();
        if (payment) {
          await supabase.from('reservations').update({ status: 'CONFIRMED' }).eq('id', payment.reservation_id);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
  });
}

export function useMarkPayoutSent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payoutId: string) => {
      const { error } = await supabase
        .from('payouts')
        .update({ status: 'SENT', sent_at: new Date().toISOString() })
        .eq('id', payoutId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
  });
}

export function useAdminAuditLog() {
  return useQuery({
    queryKey: ['admin', 'audit_log'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });
}
