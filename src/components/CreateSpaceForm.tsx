import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { useCreateSpace, useAmenities } from '@/hooks/useSpaces';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Loader2 } from 'lucide-react';

const spaceTypes = [
  { value: 'MEETING_ROOM', label: 'Sala de Reunião' },
  { value: 'OFFICE', label: 'Escritório' },
  { value: 'CLINIC', label: 'Consultório' },
  { value: 'COWORKING', label: 'Coworking' },
  { value: 'STUDIO', label: 'Estúdio' },
  { value: 'TRAINING_ROOM', label: 'Sala de Treinamento' },
];

const brStates = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'];

export default function CreateSpaceForm({ onCancel }: { onCancel: () => void }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createSpace = useCreateSpace();
  const { data: amenities } = useAmenities();

  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'MEETING_ROOM',
    capacity: 1,
    area_m2: '',
    base_price_cents: '',
    cleaning_fee_cents: '',
    rules: '',
    cancellation_policy: '',
    venue_name: '',
    address_line: '',
    city: '',
    state: 'SP',
    zip_code: '',
  });
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [photos, setPhotos] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleChange = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleAmenity = (id: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos(Array.from(e.target.files).slice(0, 5));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.venue_name || !form.address_line || !form.city || !form.base_price_cents) {
      toast({ title: 'Preencha todos os campos obrigatórios', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      // Upload photos
      const photoUrls: string[] = [];
      for (const photo of photos) {
        const ext = photo.name.split('.').pop();
        const path = `spaces/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('uploads')
          .upload(path, photo);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(path);
        photoUrls.push(urlData.publicUrl);
      }

      await createSpace.mutateAsync({
        venue: {
          name: form.venue_name,
          address_line: form.address_line,
          city: form.city,
          state: form.state,
          zip_code: form.zip_code || undefined,
        },
        space: {
          title: form.title,
          description: form.description,
          type: form.type,
          capacity: form.capacity,
          area_m2: form.area_m2 ? Number(form.area_m2) : undefined,
          base_price_cents: Math.round(Number(form.base_price_cents) * 100),
          cleaning_fee_cents: form.cleaning_fee_cents ? Math.round(Number(form.cleaning_fee_cents) * 100) : 0,
          rules: form.rules || undefined,
          cancellation_policy: form.cancellation_policy || undefined,
        },
        amenity_ids: selectedAmenities,
        photo_urls: photoUrls,
      });

      toast({ title: 'Espaço criado com sucesso!' });
      onCancel();
    } catch (err: any) {
      toast({ title: 'Erro ao criar espaço', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">Informações do espaço</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Título *</Label>
            <Input value={form.title} onChange={(e) => handleChange('title', e.target.value)} placeholder="Ex: Sala de Reunião Premium" />
          </div>
          <div className="sm:col-span-2">
            <Label>Descrição *</Label>
            <Textarea value={form.description} onChange={(e) => handleChange('description', e.target.value)} placeholder="Descreva seu espaço..." rows={4} />
          </div>
          <div>
            <Label>Tipo *</Label>
            <select
              value={form.type}
              onChange={(e) => handleChange('type', e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {spaceTypes.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Capacidade (pessoas) *</Label>
            <Input type="number" min={1} value={form.capacity} onChange={(e) => handleChange('capacity', parseInt(e.target.value) || 1)} />
          </div>
          <div>
            <Label>Área (m²)</Label>
            <Input type="number" min={0} value={form.area_m2} onChange={(e) => handleChange('area_m2', e.target.value)} />
          </div>
          <div>
            <Label>Preço por hora (R$) *</Label>
            <Input type="number" min={0} step="0.01" value={form.base_price_cents} onChange={(e) => handleChange('base_price_cents', e.target.value)} placeholder="150.00" />
          </div>
          <div>
            <Label>Taxa de limpeza (R$)</Label>
            <Input type="number" min={0} step="0.01" value={form.cleaning_fee_cents} onChange={(e) => handleChange('cleaning_fee_cents', e.target.value)} placeholder="0.00" />
          </div>
        </div>
        <div>
          <Label>Regras do espaço</Label>
          <Textarea value={form.rules} onChange={(e) => handleChange('rules', e.target.value)} placeholder="Regras opcionais..." rows={2} />
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">Endereço</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Nome do local *</Label>
            <Input value={form.venue_name} onChange={(e) => handleChange('venue_name', e.target.value)} placeholder="Ex: Centro Empresarial Paulista" />
          </div>
          <div className="sm:col-span-2">
            <Label>Endereço *</Label>
            <Input value={form.address_line} onChange={(e) => handleChange('address_line', e.target.value)} placeholder="Av. Paulista, 1000" />
          </div>
          <div>
            <Label>Cidade *</Label>
            <Input value={form.city} onChange={(e) => handleChange('city', e.target.value)} placeholder="São Paulo" />
          </div>
          <div>
            <Label>Estado *</Label>
            <select
              value={form.state}
              onChange={(e) => handleChange('state', e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {brStates.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>CEP</Label>
            <Input value={form.zip_code} onChange={(e) => handleChange('zip_code', e.target.value)} placeholder="01310-100" />
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">Comodidades</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {amenities?.map((a) => (
            <label key={a.id} className="flex items-center gap-2 cursor-pointer rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors">
              <Checkbox
                checked={selectedAmenities.includes(a.id)}
                onCheckedChange={() => toggleAmenity(a.id)}
              />
              <span className="text-sm">{a.label}</span>
            </label>
          ))}
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">Fotos</h2>
        <div>
          <Label>Upload de fotos (máx. 5)</Label>
          <div className="mt-2">
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-8 text-sm text-muted-foreground hover:border-primary hover:text-foreground transition-colors">
              <Upload className="h-5 w-5" />
              {photos.length > 0 ? `${photos.length} foto(s) selecionada(s)` : 'Clique para selecionar fotos'}
              <input type="file" accept="image/*" multiple onChange={handlePhotoChange} className="hidden" />
            </label>
          </div>
          {photos.length > 0 && (
            <div className="mt-3 flex gap-2 flex-wrap">
              {photos.map((p, i) => (
                <img key={i} src={URL.createObjectURL(p)} alt="" className="h-20 w-20 rounded-lg object-cover" />
              ))}
            </div>
          )}
        </div>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" size="lg" disabled={uploading || createSpace.isPending}>
          {(uploading || createSpace.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Publicar espaço
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
