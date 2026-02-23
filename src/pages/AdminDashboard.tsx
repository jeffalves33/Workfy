import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdminReservations, useAdminPayments, useAdminPayouts, useConfirmPayment, useMarkPayoutSent, useAdminAuditLog } from '@/hooks/useAdmin';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, Send, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusColors: Record<string, string> = {
  PENDING_PAYMENT: 'bg-yellow-100 text-yellow-800',
  PENDING_CONFIRMATION: 'bg-orange-100 text-orange-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  CHECKED_IN: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-red-100 text-red-800',
  REJECTED: 'bg-red-100 text-red-800',
  WAITING_PIX: 'bg-yellow-100 text-yellow-800',
  PROOF_SUBMITTED: 'bg-orange-100 text-orange-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  SENT: 'bg-green-100 text-green-800',
};

function formatCents(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [tab, setTab] = useState('reservations');

  // For simplicity, we check admin via query - if queries fail due to RLS, user isn't admin
  if (!loading && !user) return <Navigate to="/entrar" replace />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Painel Administrativo</h1>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="reservations">Reservas</TabsTrigger>
          <TabsTrigger value="payments">Pagamentos</TabsTrigger>
          <TabsTrigger value="payouts">Repasses</TabsTrigger>
          <TabsTrigger value="audit">Auditoria</TabsTrigger>
        </TabsList>

        <TabsContent value="reservations"><ReservationsTab /></TabsContent>
        <TabsContent value="payments"><PaymentsTab /></TabsContent>
        <TabsContent value="payouts"><PayoutsTab /></TabsContent>
        <TabsContent value="audit"><AuditTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function ReservationsTab() {
  const { data, isLoading } = useAdminReservations();

  if (isLoading) return <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />;

  return (
    <div className="space-y-3">
      {data && data.length > 0 ? data.map((r: any) => (
        <Card key={r.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="font-medium">{r.space?.title || r.space_id}</p>
            <p className="text-sm text-muted-foreground">
              {r.tenant?.name || r.tenant_user_id} · {format(new Date(r.start_at), "dd/MM/yyyy HH:mm", { locale: ptBR })} – {format(new Date(r.end_at), "HH:mm", { locale: ptBR })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-semibold">{formatCents(r.total_cents)}</span>
            <Badge className={statusColors[r.status] || ''}>{r.status}</Badge>
          </div>
        </Card>
      )) : <p className="text-center text-muted-foreground py-12">Nenhuma reserva encontrada.</p>}
    </div>
  );
}

function PaymentsTab() {
  const { data, isLoading } = useAdminPayments();
  const confirmPayment = useConfirmPayment();

  if (isLoading) return <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />;

  return (
    <div className="space-y-3">
      {data && data.length > 0 ? data.map((p: any) => (
        <Card key={p.id} className="p-4 space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="font-medium">{p.reservation?.space?.title || p.reservation_id}</p>
              <p className="text-sm text-muted-foreground">
                {p.tenant?.name || 'Locatário'} · {p.method}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold">{p.reservation ? formatCents(p.reservation.total_cents) : '-'}</span>
              <Badge className={statusColors[p.status] || ''}>{p.status}</Badge>
            </div>
          </div>

          {p.proof_url && (
            <a href={p.proof_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
              <ExternalLink className="h-3 w-3" /> Ver comprovante
            </a>
          )}

          {(p.status === 'PROOF_SUBMITTED' || p.status === 'WAITING_PIX') && (
            <div className="flex gap-2">
              <Button size="sm" className="gap-1"
                onClick={() => confirmPayment.mutate({ paymentId: p.id, action: 'confirm' })}
                disabled={confirmPayment.isPending}>
                <CheckCircle className="h-3 w-3" /> Confirmar
              </Button>
              <Button size="sm" variant="destructive" className="gap-1"
                onClick={() => confirmPayment.mutate({ paymentId: p.id, action: 'reject' })}
                disabled={confirmPayment.isPending}>
                <XCircle className="h-3 w-3" /> Rejeitar
              </Button>
            </div>
          )}
        </Card>
      )) : <p className="text-center text-muted-foreground py-12">Nenhum pagamento encontrado.</p>}
    </div>
  );
}

function PayoutsTab() {
  const { data, isLoading } = useAdminPayouts();
  const markSent = useMarkPayoutSent();

  if (isLoading) return <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />;

  return (
    <div className="space-y-3">
      {data && data.length > 0 ? data.map((p: any) => (
        <Card key={p.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="font-medium">{p.host?.name || p.host_user_id}</p>
            <p className="text-sm text-muted-foreground">
              Vencimento: {format(new Date(p.due_at), "dd/MM/yyyy", { locale: ptBR })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-semibold">{formatCents(p.amount_cents)}</span>
            <Badge className={statusColors[p.status] || ''}>{p.status}</Badge>
            {p.status === 'PENDING' && (
              <Button size="sm" className="gap-1" onClick={() => markSent.mutate(p.id)} disabled={markSent.isPending}>
                <Send className="h-3 w-3" /> Marcar enviado
              </Button>
            )}
          </div>
        </Card>
      )) : <p className="text-center text-muted-foreground py-12">Nenhum repasse encontrado.</p>}
    </div>
  );
}

function AuditTab() {
  const { data, isLoading } = useAdminAuditLog();

  if (isLoading) return <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />;

  return (
    <div className="space-y-2">
      {data && data.length > 0 ? data.map((entry) => (
        <Card key={entry.id} className="p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-medium">{entry.entity_type} · {entry.action}</span>
            <span className="text-xs text-muted-foreground">
              {format(new Date(entry.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
            </span>
          </div>
          {entry.entity_id && <p className="text-xs text-muted-foreground mt-1">ID: {entry.entity_id}</p>}
        </Card>
      )) : <p className="text-center text-muted-foreground py-12">Nenhum registro de auditoria.</p>}
    </div>
  );
}
