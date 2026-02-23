import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Star, Users, CheckCircle2, Shield, Wifi, Monitor, Coffee, Wind, CarFront, Printer, MessageCircle, ChevronLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useSpaceDetail } from '@/hooks/useSpaces';
import { useCreateReservation } from '@/hooks/useReservations';
import { useStartConversation } from '@/hooks/useConversations';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const spaceTypeLabels: Record<string, string> = {
  MEETING_ROOM: 'Sala de Reunião',
  OFFICE: 'Escritório',
  CLINIC: 'Consultório',
  COWORKING: 'Coworking',
  STUDIO: 'Estúdio',
  TRAINING_ROOM: 'Sala de Treinamento',
};

const amenityIcons: Record<string, React.ReactNode> = {
  wifi: <Wifi className="h-4 w-4" />,
  monitor: <Monitor className="h-4 w-4" />,
  coffee: <Coffee className="h-4 w-4" />,
  air_conditioning: <Wind className="h-4 w-4" />,
  parking: <CarFront className="h-4 w-4" />,
  printer: <Printer className="h-4 w-4" />,
};

function formatPrice(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function SpaceDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: space, isLoading, error } = useSpaceDetail(id);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const createReservation = useCreateReservation();
  const startConversation = useStartConversation();

  const [date, setDate] = useState<Date>();
  const [startHour, setStartHour] = useState('09');
  const [endHour, setEndHour] = useState('10');
  const [messageText, setMessageText] = useState('');
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!space || error) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center px-4 py-20">
        <h2 className="mb-4 text-2xl font-bold">Espaço não encontrado</h2>
        <Link to="/buscar"><Button>Voltar para busca</Button></Link>
      </div>
    );
  }

  const hours = parseInt(endHour) - parseInt(startHour);
  const subtotal = hours > 0 ? space.base_price_cents * hours : 0;
  const platformFee = Math.round(subtotal * 0.1); // 10% platform fee
  const total = subtotal + space.cleaning_fee_cents + platformFee;

  const handleReserve = async () => {
    if (!user) {
      navigate('/entrar', { state: { from: `/espaco/${id}` } });
      return;
    }
    if (!date) {
      toast({ title: 'Selecione uma data', variant: 'destructive' });
      return;
    }
    if (hours <= 0) {
      toast({ title: 'Horário inválido', description: 'O horário de fim deve ser posterior ao de início.', variant: 'destructive' });
      return;
    }

    const startAt = new Date(date);
    startAt.setHours(parseInt(startHour), 0, 0, 0);
    const endAt = new Date(date);
    endAt.setHours(parseInt(endHour), 0, 0, 0);

    try {
      const reservation = await createReservation.mutateAsync({
        space_id: space.id,
        start_at: startAt.toISOString(),
        end_at: endAt.toISOString(),
        subtotal_cents: subtotal,
        platform_fee_cents: platformFee,
        total_cents: total,
      });
      toast({ title: 'Reserva criada!', description: 'Agora realize o pagamento via PIX.' });
      navigate(`/reserva/${reservation.id}/pagamento`);
    } catch (err: any) {
      toast({ title: 'Erro ao reservar', description: err.message, variant: 'destructive' });
    }
  };

  const handleSendMessage = async () => {
    if (!user) {
      navigate('/entrar', { state: { from: `/espaco/${id}` } });
      return;
    }
    if (!messageText.trim()) {
      toast({ title: 'Digite uma mensagem', variant: 'destructive' });
      return;
    }

    try {
      const convId = await startConversation.mutateAsync({
        space_id: space.id,
        owner_id: space.owner_id,
        initial_message: messageText.trim(),
      });
      toast({ title: 'Mensagem enviada!', description: 'O anfitrião receberá sua mensagem.' });
      setMessageText('');
      setMessageDialogOpen(false);
      navigate(`/mensagens/${convId}`);
    } catch (err: any) {
      toast({ title: 'Erro ao enviar mensagem', description: err.message, variant: 'destructive' });
    }
  };

  const mainPhoto = space.photos?.sort((a, b) => a.sort_order - b.sort_order)[0]?.url;

  return (
    <div className="container mx-auto px-4 py-6">
      <Link to="/buscar" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft className="h-4 w-4" /> Voltar
      </Link>

      <div className="mb-8 overflow-hidden rounded-2xl">
        {mainPhoto ? (
          <img src={mainPhoto} alt={space.title} className="h-64 w-full object-cover sm:h-80 lg:h-96" />
        ) : (
          <div className="flex h-64 items-center justify-center bg-muted sm:h-80 lg:h-96">
            <span className="text-muted-foreground">Sem foto</span>
          </div>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{spaceTypeLabels[space.type] || space.type}</Badge>
            {space.verification_status === 'VERIFIED' && (
              <Badge className="gap-1"><CheckCircle2 className="h-3 w-3" /> Verificado</Badge>
            )}
          </div>

          <h1 className="mb-2 text-3xl font-bold">{space.title}</h1>

          <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" /> {space.venue.address_line} - {space.venue.city}, {space.venue.state}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" /> Até {space.capacity} pessoas
            </span>
            {space.area_m2 && <span>{Number(space.area_m2)}m²</span>}
          </div>

          <Separator className="my-6" />

          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-lg font-bold text-secondary-foreground">
              {space.ownerProfile?.name?.charAt(0) || '?'}
            </div>
            <div>
              <p className="font-semibold">Anfitrião: {space.ownerProfile?.name || 'Proprietário'}</p>
              <p className="text-sm text-muted-foreground">Membro do Workfy</p>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="mb-6">
            <h2 className="mb-3 text-xl font-semibold">Sobre o espaço</h2>
            <p className="leading-relaxed text-muted-foreground">{space.description}</p>
          </div>

          {space.amenities.length > 0 && (
            <div className="mb-6">
              <h2 className="mb-3 text-xl font-semibold">Comodidades</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {space.amenities.map((sa) => (
                  <div key={sa.amenity_id} className="flex items-center gap-2 rounded-lg border border-border p-3 text-sm">
                    {amenityIcons[sa.amenity.code] || <Shield className="h-4 w-4" />}
                    {sa.amenity.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {space.rules && (
            <div className="mb-6">
              <h2 className="mb-3 text-xl font-semibold">Regras do espaço</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{space.rules}</p>
            </div>
          )}
        </div>

        {/* Booking Sidebar */}
        <div>
          <Card className="sticky top-24 p-6">
            <div className="mb-4 flex items-baseline gap-1">
              <span className="text-2xl font-bold">{formatPrice(space.base_price_cents)}</span>
              <span className="text-muted-foreground">/hora</span>
            </div>

            <div className="mb-4 space-y-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Data</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "dd 'de' MMMM", { locale: ptBR }) : 'Selecione a data'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={date} onSelect={setDate} disabled={(d) => d < new Date()} className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Início</label>
                  <select value={startHour} onChange={(e) => setStartHour(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                    {Array.from({ length: 15 }, (_, i) => i + 7).map((h) => (
                      <option key={h} value={String(h).padStart(2, '0')}>{String(h).padStart(2, '0')}:00</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Fim</label>
                  <select value={endHour} onChange={(e) => setEndHour(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                    {Array.from({ length: 15 }, (_, i) => i + 8).map((h) => (
                      <option key={h} value={String(h).padStart(2, '0')}>{String(h).padStart(2, '0')}:00</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {hours > 0 && (
              <div className="mb-4 space-y-2 rounded-lg bg-muted p-4 text-sm">
                <div className="flex justify-between">
                  <span>{formatPrice(space.base_price_cents)} × {hours}h</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {space.cleaning_fee_cents > 0 && (
                  <div className="flex justify-between">
                    <span>Taxa de limpeza</span>
                    <span>{formatPrice(space.cleaning_fee_cents)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Taxa da plataforma (10%)</span>
                  <span>{formatPrice(platformFee)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            )}

            <Button
              className="mb-3 w-full"
              size="lg"
              onClick={handleReserve}
              disabled={createReservation.isPending}
            >
              {createReservation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {user ? 'Reservar' : 'Entrar para reservar'}
            </Button>

            <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Enviar mensagem
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Enviar mensagem ao anfitrião</DialogTitle>
                </DialogHeader>
                {user ? (
                  <div className="space-y-4">
                    <Textarea
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Olá! Gostaria de saber mais sobre o espaço..."
                      rows={4}
                    />
                    <Button
                      className="w-full"
                      onClick={handleSendMessage}
                      disabled={startConversation.isPending}
                    >
                      {startConversation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Enviar
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="mb-4 text-muted-foreground">Faça login para enviar uma mensagem.</p>
                    <Button onClick={() => navigate('/entrar', { state: { from: `/espaco/${id}` } })}>
                      Entrar
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </Card>
        </div>
      </div>
    </div>
  );
}
