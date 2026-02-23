import { Loader2, CalendarDays, Clock, User, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { useSpaceReservations } from '@/hooks/useReservations';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const reservationStatusLabels: Record<string, string> = {
  PENDING_PAYMENT: 'Aguardando Pagamento',
  PENDING_CONFIRMATION: 'Aguardando Confirmação',
  CONFIRMED: 'Confirmada',
  CHECKED_IN: 'Check-in Realizado',
  COMPLETED: 'Concluída',
  CANCELLED: 'Cancelada',
  REJECTED: 'Rejeitada',
};

const reservationStatusColors: Record<string, string> = {
  PENDING_PAYMENT: 'bg-yellow-100 text-yellow-800',
  PENDING_CONFIRMATION: 'bg-orange-100 text-orange-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  CHECKED_IN: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-red-100 text-red-800',
  REJECTED: 'bg-red-100 text-red-800',
};

const paymentStatusLabels: Record<string, string> = {
  WAITING_PIX: 'PIX aguardando',
  PROOF_SUBMITTED: 'Comprovante enviado',
  CONFIRMED: 'Pago',
  REJECTED: 'Rejeitado',
  REFUNDED: 'Estornado',
};

const paymentStatusColors: Record<string, string> = {
  WAITING_PIX: 'bg-yellow-100 text-yellow-800',
  PROOF_SUBMITTED: 'bg-orange-100 text-orange-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
};

function formatCents(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function SpaceReservationsList({ spaceId }: { spaceId: string }) {
  const { data: reservations, isLoading } = useSpaceReservations(spaceId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!reservations || reservations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
        <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-semibold mb-1">Nenhuma reserva neste espaço</h2>
        <p className="text-sm text-muted-foreground">Quando alguém reservar, aparecerá aqui.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reservations.map((r: any) => {
        const tenantName = r.tenant?.name || 'Locatário';
        const tenantEmail = r.tenant?.email || '';
        const payment = r.payment;

        return (
          <Card key={r.id} className="p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={reservationStatusColors[r.status] || ''}>
                    {reservationStatusLabels[r.status] || r.status}
                  </Badge>
                  {payment?.status && (
                    <Badge className={paymentStatusColors[payment.status] || ''}>
                      {paymentStatusLabels[payment.status] || payment.status}
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {format(new Date(r.start_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} –{' '}
                  {format(new Date(r.end_at), 'HH:mm', { locale: ptBR })}
                </p>

                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  {tenantName}{tenantEmail ? ` · ${tenantEmail}` : ''}
                </p>
              </div>

              <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2">
                <span className="font-semibold text-lg">{formatCents(r.total_cents)}</span>

                {payment?.proof_url && (
                  <a
                    href={payment.proof_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex"
                  >
                    <Button variant="outline" size="sm" className="gap-1">
                      <ExternalLink className="h-3.5 w-3.5" /> Comprovante
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
