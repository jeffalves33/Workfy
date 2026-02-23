import { Building2, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMySpaces } from '@/hooks/useSpaces';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import CreateSpaceForm from '@/components/CreateSpaceForm';

const spaceTypeLabels: Record<string, string> = {
  MEETING_ROOM: 'Sala de Reunião',
  OFFICE: 'Escritório',
  CLINIC: 'Consultório',
  COWORKING: 'Coworking',
  STUDIO: 'Estúdio',
  TRAINING_ROOM: 'Sala de Treinamento',
};

export default function MySpaces() {
  const { user, loading: authLoading } = useAuth();
  const { data: spaces, isLoading } = useMySpaces();
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  if (!authLoading && !user) return <Navigate to="/entrar" replace />;

  if (showForm) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Novo Espaço</h1>
        <CreateSpaceForm onCancel={() => setShowForm(false)} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Meus Espaços</h1>
        <Button className="gap-2" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" /> Novo espaço
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : spaces && spaces.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {spaces.map((space) => (
            <Card key={space.id} className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/meus-espacos/${space.id}/editar`)}>
              <div className="aspect-[4/3] overflow-hidden">
                {space.photos[0] ? (
                  <img src={space.photos[0].url} alt={space.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-muted">
                    <Building2 className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">{spaceTypeLabels[space.type] || space.type}</Badge>
                  <Badge variant={space.verification_status === 'VERIFIED' ? 'default' : 'outline'}>
                    {space.verification_status === 'VERIFIED' ? 'Verificado' : space.verification_status === 'PENDING' ? 'Pendente' : 'Rejeitado'}
                  </Badge>
                </div>
                <h3 className="font-semibold">{space.title}</h3>
                <p className="text-sm text-muted-foreground">{space.venue.city}, {space.venue.state}</p>
                <p className="mt-1 font-bold">
                  {(space.base_price_cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  <span className="font-normal text-muted-foreground">/hora</span>
                </p>

                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/meus-espacos/${space.id}/editar`);
                    }}
                  >
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/meus-espacos/${space.id}/editar?tab=reservas`);
                    }}
                  >
                    Reservas
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold mb-1">Nenhum espaço cadastrado</h2>
          <p className="text-sm text-muted-foreground mb-4">Comece anunciando seu primeiro espaço profissional.</p>
          <Button variant="outline" className="gap-2" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" /> Cadastrar espaço
          </Button>
        </div>
      )}
    </div>
  );
}
