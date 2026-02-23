import { CalendarDays, Loader2, MapPin, Clock, CreditCard } from 'lucide-react';
import { useMyReservations } from '@/hooks/useReservations';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';

const statusLabels: Record<string, string> = {
  PENDING_PAYMENT: 'Aguardando Pagamento',
  PENDING_CONFIRMATION: 'Aguardando Confirmação',
  CONFIRMED: 'Confirmada',
  CHECKED_IN: 'Check-in Realizado',
  COMPLETED: 'Concluída',
  CANCELLED: 'Cancelada',
  REJECTED: 'Rejeitada',
};

const statusColors: Record<string, string> = {
  PENDING_PAYMENT: 'bg-yellow-100 text-yellow-800',
  PENDING_CONFIRMATION: 'bg-orange-100 text-orange-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  CHECKED_IN: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-red-100 text-red-800',
  REJECTED: 'bg-red-100 text-red-800',
};

function formatCents(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function MyReservations() {
  const { data: reservations, isLoading } = useMyReservations();

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Minhas Reservas</h1>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !reservations || reservations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold mb-1">Nenhuma reserva encontrada</h2>
          <p className="text-sm text-muted-foreground mb-4">Suas reservas aparecerão aqui.</p>
          <Link to="/buscar">
            <Button>Explorar espaços</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reservations.map((r: any) => {
            const photo = r.space?.photos?.sort((a: any, b: any) => a.sort_order - b.sort_order)[0]?.url;
            const venue = r.space?.venue;

            return (
              <Card key={r.id} className="overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                  {/* Photo */}
                  <div className="sm:w-48 h-32 sm:h-auto flex-shrink-0">
                    {photo ? (
                      <img src={photo} alt={r.space?.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground text-sm">
                        Sem foto
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex flex-1 flex-col justify-between p-4">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{r.space?.title || 'Espaço'}</h3>
                        <Badge className={statusColors[r.status] || ''}>
                          {statusLabels[r.status] || r.status}
                        </Badge>
                      </div>

                      {venue && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {venue.address_line} - {venue.city}, {venue.state}
                        </p>
                      )}

                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {format(new Date(r.start_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} –{' '}
                        {format(new Date(r.end_at), "HH:mm", { locale: ptBR })}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                      <span className="font-semibold text-lg">{formatCents(r.total_cents)}</span>

                      {r.status === 'PENDING_PAYMENT' && (
                        <Link to={`/reserva/${r.id}/pagamento`}>
                          <Button size="sm" className="gap-1.5">
                            <CreditCard className="h-4 w-4" />
                            Pagar agora
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
