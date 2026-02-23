import { useState, useEffect } from 'react';
import { User, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Navigate } from 'react-router-dom';

export default function MyProfile() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', cpf_cnpj: '', avatar_url: '' });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setForm({
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            cpf_cnpj: data.cpf_cnpj || '',
            avatar_url: data.avatar_url || '',
          });
        }
        setLoading(false);
      });
  }, [user]);

  if (!authLoading && !user) return <Navigate to="/entrar" replace />;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      let avatarUrl = form.avatar_url;
      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop();
        const path = `avatars/${user.id}.${ext}`;
        const { error: upErr } = await supabase.storage.from('uploads').upload(path, avatarFile, { upsert: true });
        if (upErr) throw upErr;
        const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(path);
        avatarUrl = urlData.publicUrl;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          name: form.name,
          phone: form.phone || null,
          cpf_cnpj: form.cpf_cnpj || null,
          avatar_url: avatarUrl || null,
        })
        .eq('user_id', user.id);
      if (error) throw error;
      setForm((f) => ({ ...f, avatar_url: avatarUrl }));
      toast({ title: 'Perfil atualizado!' });
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Meu Perfil</h1>
      <form onSubmit={handleSave}>
        <Card className="p-6 space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative">
              {form.avatar_url ? (
                <img src={form.avatar_url} alt="Avatar" className="h-20 w-20 rounded-full object-cover" />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary text-2xl font-bold text-secondary-foreground">
                  {form.name?.charAt(0)?.toUpperCase() || <User className="h-8 w-8" />}
                </div>
              )}
            </div>
            <div>
              <Label>Foto de perfil</Label>
              <Input type="file" accept="image/*" className="mt-1" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Nome completo</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <Label>E-mail</Label>
              <Input value={form.email} disabled className="bg-muted" />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="(11) 99999-9999" />
            </div>
            <div>
              <Label>CPF / CNPJ</Label>
              <Input value={form.cpf_cnpj} onChange={(e) => setForm((f) => ({ ...f, cpf_cnpj: e.target.value }))} placeholder="000.000.000-00" />
            </div>
          </div>

          <Button type="submit" disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar alterações
          </Button>
        </Card>
      </form>
    </div>
  );
}
