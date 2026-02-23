import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ChevronLeft, Upload, CheckCircle, Copy, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function formatCents(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function PaymentPage() {
  const { reservationId } = useParams<{ reservationId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  // Fetch reservation details
  const { data: reservation, isLoading } = useQuery({
    queryKey: ['reservation', reservationId],
    enabled: !!reservationId && !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          space:spaces(
            id, title, base_price_cents, cleaning_fee_cents,
            venue:venues(city, state, address_line),
            photos:space_photos(url, sort_order)
          )
        `)
        .eq('id', reservationId!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  // Fetch existing payment
  const { data: payment } = useQuery({
    queryKey: ['payment', reservationId],
    enabled: !!reservationId && !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('reservation_id', reservationId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  // Create payment record
  const createPayment = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .insert({
          reservation_id: reservationId!,
          method: 'PIX_MANUAL',
          status: 'WAITING_PIX',
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment', reservationId] });
    },
  });

  // Upload proof
  const handleUploadProof = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const paymentRecord = payment || (await createPayment.mutateAsync());

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `proofs/${user!.id}/${paymentRecord.id}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(path);

      const { error: updateError } = await supabase
        .from('payments')
        .update({
          proof_url: urlData.publicUrl,
          status: 'PROOF_SUBMITTED',
        })
        .eq('id', paymentRecord.id);
      if (updateError) throw updateError;

      // Update reservation status
      await supabase
        .from('reservations')
        .update({ status: 'PENDING_CONFIRMATION' })
        .eq('id', reservationId!);

      queryClient.invalidateQueries({ queryKey: ['payment', reservationId] });
      queryClient.invalidateQueries({ queryKey: ['reservation', reservationId] });
      queryClient.invalidateQueries({ queryKey: ['reservations'] });

      toast({ title: 'Comprovante enviado!', description: 'Aguarde a confirmação do administrador.' });
    } catch (err: any) {
      toast({ title: 'Erro no upload', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center px-4 py-20">
        <h2 className="mb-4 text-2xl font-bold">Reserva não encontrada</h2>
        <Link to="/perfil/reservas"><Button>Voltar para reservas</Button></Link>
      </div>
    );
  }

  const photo = reservation.space?.photos?.sort((a: any, b: any) => a.sort_order - b.sort_order)[0]?.url;
  const venue = reservation.space?.venue;
  const isProofSubmitted = payment?.status === 'PROOF_SUBMITTED';
  const isConfirmed = payment?.status === 'CONFIRMED';

  // Fake PIX data for manual flow
  const pixKey = 'pagamentos@workfy.com.br';
  const pixCopyPaste = `00020126580014BR.GOV.BCB.PIX0136${reservationId}5204000053039865802BR`;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Link to="/perfil/reservas" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft className="h-4 w-4" /> Voltar para reservas
      </Link>

      <h1 className="text-2xl font-bold mb-6">Pagamento da Reserva</h1>

      {/* Reservation summary */}
      <Card className="mb-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          <div className="sm:w-40 h-28 sm:h-auto flex-shrink-0">
            {photo ? (
              <img src={photo} alt={reservation.space?.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground text-sm">Sem foto</div>
            )}
          </div>
          <div className="p-4 flex-1">
            <h3 className="font-semibold">{reservation.space?.title}</h3>
            {venue && (
              <p className="text-sm text-muted-foreground">{venue.address_line} - {venue.city}, {venue.state}</p>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              {format(new Date(reservation.start_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} – {format(new Date(reservation.end_at), "HH:mm", { locale: ptBR })}
            </p>
          </div>
        </div>
      </Card>

      {/* Price breakdown */}
      <Card className="mb-6 p-5">
        <h2 className="font-semibold mb-3">Resumo do pagamento</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCents(reservation.subtotal_cents)}</span>
          </div>
          <div className="flex justify-between">
            <span>Taxa da plataforma</span>
            <span>{formatCents(reservation.platform_fee_cents)}</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between font-semibold text-base">
            <span>Total</span>
            <span>{formatCents(reservation.total_cents)}</span>
          </div>
        </div>
      </Card>

      {/* Payment status */}
      {isConfirmed ? (
        <Card className="p-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
          <h2 className="text-xl font-semibold mb-1">Pagamento Confirmado!</h2>
          <p className="text-muted-foreground">Sua reserva está confirmada. Aproveite o espaço!</p>
        </Card>
      ) : isProofSubmitted ? (
        <Card className="p-6 text-center">
          <Clock className="h-12 w-12 text-orange-500 mx-auto mb-3" />
          <h2 className="text-xl font-semibold mb-1">Comprovante Enviado</h2>
          <p className="text-muted-foreground mb-4">Seu comprovante está sendo analisado. Você receberá a confirmação em breve.</p>
          {payment?.proof_url && (
            <a href={payment.proof_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
              Ver comprovante enviado
            </a>
          )}
        </Card>
      ) : (
        <Card className="p-5">
          <h2 className="font-semibold mb-4">Pagamento via PIX</h2>

          <div className="space-y-4">
            {/* PIX Key */}
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-1">Chave PIX</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-md bg-muted px-3 py-2 text-sm font-mono">{pixKey}</code>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() => {
                    navigator.clipboard.writeText(pixKey);
                    toast({ title: 'Chave copiada!' });
                  }}
                >
                  <Copy className="h-3.5 w-3.5" /> Copiar
                </Button>
              </div>
            </div>

            {/* Value */}
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-1">Valor a transferir</label>
              <code className="block rounded-md bg-muted px-3 py-2 text-lg font-semibold font-mono">
                {formatCents(reservation.total_cents)}
              </code>
            </div>

            <Separator />

            {/* Upload proof */}
            <div>
              <label className="text-sm font-medium block mb-2">Enviar comprovante</label>
              <p className="text-sm text-muted-foreground mb-3">
                Após realizar o PIX, envie o comprovante para confirmar seu pagamento.
              </p>
              <label className="cursor-pointer">
                <div className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border py-6 hover:border-primary/50 transition-colors">
                  {uploading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      <Upload className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Clique para enviar o comprovante</span>
                    </>
                  )}
                </div>
                <Input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={handleUploadProof}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
