import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

type TenantProfile = {
  user_id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
} | null;

type PaymentInfo = {
  reservation_id: string;
  status: string;
  proof_url: string | null;
} | null;

export function useCreateReservation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: {
      space_id: string;
      start_at: string;
      end_at: string;
      subtotal_cents: number;
      platform_fee_cents: number;
      total_cents: number;
      attendees_count?: number;
      notes?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('reservations')
        .insert({
          space_id: input.space_id,
          tenant_user_id: user.id,
          start_at: input.start_at,
          end_at: input.end_at,
          subtotal_cents: input.subtotal_cents,
          platform_fee_cents: input.platform_fee_cents,
          total_cents: input.total_cents,
          attendees_count: input.attendees_count || 1,
          notes: input.notes || null,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
  });
}

export function useMyReservations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['reservations', 'mine', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          space:spaces(
            id, title, type, base_price_cents,
            venue:venues(city, state, address_line),
            photos:space_photos(url, sort_order)
          )
        `)
        .eq('tenant_user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

/**
 * Reservas recebidas (para o dono do espaço).
 * - RLS no Supabase já permite SELECT quando auth.uid() é dono do space_id.
 * - Aqui enriquecemos com perfil do locatário + status de pagamento (se existir).
 */
export function useSpaceReservations(spaceId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['reservations', 'space', spaceId, user?.id],
    enabled: !!user && !!spaceId,
    queryFn: async () => {
      const { data: reservations, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('space_id', spaceId!)
        .order('start_at', { ascending: false })
        .limit(200);
      if (error) throw error;

      if (!reservations || reservations.length === 0) return [];

      const tenantIds = Array.from(new Set(reservations.map((r: any) => r.tenant_user_id).filter(Boolean)));
      const reservationIds = reservations.map((r: any) => r.id);

      // Tenants
      let tenantsById: Record<string, TenantProfile> = {};
      if (tenantIds.length > 0) {
        const { data: tenants, error: tErr } = await supabase
          .from('profiles')
          .select('user_id, name, email, phone')
          .in('user_id', tenantIds);
        if (tErr) throw tErr;
        tenantsById = Object.fromEntries((tenants || []).map((t: any) => [t.user_id, t]));
      }

      // Payments (optional)
      let paymentsByReservationId: Record<string, PaymentInfo> = {};
      if (reservationIds.length > 0) {
        const { data: payments, error: pErr } = await supabase
          .from('payments')
          .select('reservation_id, status, proof_url')
          .in('reservation_id', reservationIds);
        if (pErr) throw pErr;
        paymentsByReservationId = Object.fromEntries((payments || []).map((p: any) => [p.reservation_id, p]));
      }

      return reservations.map((r: any) => ({
        ...r,
        tenant: tenantsById[r.tenant_user_id] || null,
        payment: paymentsByReservationId[r.id] || null,
      }));
    },
  });
}
