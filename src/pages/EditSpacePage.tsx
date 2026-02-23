import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, Navigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSpaceDetail, useAmenities, useUpdateSpace } from '@/hooks/useSpaces';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Loader2, ChevronLeft, Trash2 } from 'lucide-react';
import SpaceReservationsList from '@/components/SpaceReservationsList';

const spaceTypes = [
  { value: 'MEETING_ROOM', label: 'Sala de Reunião' },
  { value: 'OFFICE', label: 'Escritório' },
  { value: 'CLINIC', label: 'Consultório' },
  { value: 'COWORKING', label: 'Coworking' },
  { value: 'STUDIO', label: 'Estúdio' },
  { value: 'TRAINING_ROOM', label: 'Sala de Treinamento' },
];

const brStates = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'];

export default function EditSpacePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: space, isLoading } = useSpaceDetail(id);
  const { data: amenities } = useAmenities();
  const updateSpace = useUpdateSpace();

  const [tab, setTab] = useState<'details' | 'reservations'>(
    searchParams.get('tab') === 'reservas' ? 'reservations' : 'details'
  );

  const [form, setForm] = useState({
    title: '', description: '', type: 'MEETING_ROOM', capacity: 1,
    area_m2: '', base_price_cents: '', cleaning_fee_cents: '',
    rules: '', cancellation_policy: '',
    venue_name: '', address_line: '', city: '', state: 'SP', zip_code: '',
  });
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<{ id: string; url: string }[]>([]);
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!space) return;
    setForm({
      title: space.title,
      description: space.description,
      type: space.type,
      capacity: space.capacity,
      area_m2: space.area_m2 ? String(space.area_m2) : '',
      base_price_cents: String(space.base_price_cents / 100),
      cleaning_fee_cents: String(space.cleaning_fee_cents / 100),
      rules: space.rules || '',
      cancellation_policy: space.cancellation_policy || '',
      venue_name: space.venue.name,
      address_line: space.venue.address_line,
      city: space.venue.city,
      state: space.venue.state,
      zip_code: space.venue.zip_code || '',
    });
    setSelectedAmenities(space.amenities.map((a) => a.amenity_id));
    setExistingPhotos(space.photos.sort((a, b) => a.sort_order - b.sort_order).map((p) => ({ id: p.id, url: p.url })));
  }, [space]);

  // Se o usuário trocar o query param manualmente
  useEffect(() => {
    if (searchParams.get('tab') === 'reservas') setTab('reservations');
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/entrar" replace />;
  }

  if (!space || space.owner_id !== user.id) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center px-4 py-20">
        <h2 className="mb-4 text-2xl font-bold">Espaço não encontrado</h2>
        <Link to="/meus-espacos"><Button>Voltar</Button></Link>
      </div>
    );
  }

  const handleChange = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleAmenity = (id: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const removeExistingPhoto = async (photoId: string) => {
    await supabase.from('space_photos').delete().eq('id', photoId);
    setExistingPhotos((prev) => prev.filter((p) => p.id !== photoId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Upload new photos
      const newPhotoUrls: string[] = [];
      for (const photo of newPhotos) {
        const ext = photo.name.split('.').pop();
        const path = `spaces/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage.from('uploads').upload(path, photo);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(path);
        newPhotoUrls.push(urlData.publicUrl);
      }

      await updateSpace.mutateAsync({
        spaceId: space.id,
        venueId: space.venue_id,
        venue: {
          name: form.venue_name,
          address_line: form.address_line,
          city: form.city,
          state: form.state,
          zip_code: form.zip_code || null,
        },
        space: {
          title: form.title,
          description: form.description,
          type: form.type as any,
          capacity: form.capacity,
          area_m2: form.area_m2 ? Number(form.area_m2) : null,
          base_price_cents: Math.round(Number(form.base_price_cents) * 100),
          cleaning_fee_cents: form.cleaning_fee_cents ? Math.round(Number(form.cleaning_fee_cents) * 100) : 0,
          rules: form.rules || null,
          cancellation_policy: form.cancellation_policy || null,
        },
        amenity_ids: selectedAmenities,
        new_photo_urls: newPhotoUrls,
        existing_photo_count: existingPhotos.length,
      });

      toast({ title: 'Espaço atualizado com sucesso!' });
      navigate('/meus-espacos');
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <Link to="/meus-espacos" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Meus espaços
      </Link>
      <h1 className="text-3xl font-bold mb-8">Editar Espaço</h1>

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <TabsList className="mb-6">
          <TabsTrigger value="details">Detalhes</TabsTrigger>
          <TabsTrigger value="reservations">Reservas</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Informações do espaço</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Título *</Label>
              <Input value={form.title} onChange={(e) => handleChange('title', e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label>Descrição *</Label>
              <Textarea value={form.description} onChange={(e) => handleChange('description', e.target.value)} rows={4} />
            </div>
            <div>
              <Label>Tipo *</Label>
              <select value={form.type} onChange={(e) => handleChange('type', e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {spaceTypes.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
              </select>
            </div>
            <div>
              <Label>Capacidade *</Label>
              <Input type="number" min={1} value={form.capacity} onChange={(e) => handleChange('capacity', parseInt(e.target.value) || 1)} />
            </div>
            <div>
              <Label>Área (m²)</Label>
              <Input type="number" min={0} value={form.area_m2} onChange={(e) => handleChange('area_m2', e.target.value)} />
            </div>
            <div>
              <Label>Preço por hora (R$) *</Label>
              <Input type="number" min={0} step="0.01" value={form.base_price_cents} onChange={(e) => handleChange('base_price_cents', e.target.value)} />
            </div>
            <div>
              <Label>Taxa de limpeza (R$)</Label>
              <Input type="number" min={0} step="0.01" value={form.cleaning_fee_cents} onChange={(e) => handleChange('cleaning_fee_cents', e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Regras</Label>
            <Textarea value={form.rules} onChange={(e) => handleChange('rules', e.target.value)} rows={2} />
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Endereço</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Nome do local *</Label>
              <Input value={form.venue_name} onChange={(e) => handleChange('venue_name', e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label>Endereço *</Label>
              <Input value={form.address_line} onChange={(e) => handleChange('address_line', e.target.value)} />
            </div>
            <div>
              <Label>Cidade *</Label>
              <Input value={form.city} onChange={(e) => handleChange('city', e.target.value)} />
            </div>
            <div>
              <Label>Estado *</Label>
              <select value={form.state} onChange={(e) => handleChange('state', e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {brStates.map((s) => (<option key={s} value={s}>{s}</option>))}
              </select>
            </div>
            <div>
              <Label>CEP</Label>
              <Input value={form.zip_code} onChange={(e) => handleChange('zip_code', e.target.value)} />
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Comodidades</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {amenities?.map((a) => (
              <label key={a.id} className="flex items-center gap-2 cursor-pointer rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors">
                <Checkbox checked={selectedAmenities.includes(a.id)} onCheckedChange={() => toggleAmenity(a.id)} />
                <span className="text-sm">{a.label}</span>
              </label>
            ))}
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Fotos</h2>
          {existingPhotos.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {existingPhotos.map((p) => (
                <div key={p.id} className="relative group">
                  <img src={p.url} alt="" className="h-24 w-24 rounded-lg object-cover" />
                  <button type="button" onClick={() => removeExistingPhoto(p.id)}
                    className="absolute -top-2 -right-2 hidden group-hover:flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-6 text-sm text-muted-foreground hover:border-primary hover:text-foreground transition-colors">
            <Upload className="h-5 w-5" />
            {newPhotos.length > 0 ? `${newPhotos.length} nova(s) foto(s)` : 'Adicionar fotos'}
            <input type="file" accept="image/*" multiple onChange={(e) => e.target.files && setNewPhotos(Array.from(e.target.files).slice(0, 5))} className="hidden" />
          </label>
          {newPhotos.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {newPhotos.map((p, i) => (
                <img key={i} src={URL.createObjectURL(p)} alt="" className="h-20 w-20 rounded-lg object-cover" />
              ))}
            </div>
          )}
        </Card>

        <div className="flex gap-3">
          <Button type="submit" size="lg" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar alterações
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={() => navigate('/meus-espacos')}>
            Cancelar
          </Button>
        </div>
          </form>
        </TabsContent>

        <TabsContent value="reservations">
          <SpaceReservationsList spaceId={space.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
