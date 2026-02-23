import { Link } from 'react-router-dom';
import { MapPin, Star, Users, CheckCircle2, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { SpaceWithDetails } from '@/hooks/useSpaces';

const spaceTypeLabels: Record<string, string> = {
  MEETING_ROOM: 'Sala de Reunião',
  OFFICE: 'Escritório',
  CLINIC: 'Consultório',
  COWORKING: 'Coworking',
  STUDIO: 'Estúdio',
  TRAINING_ROOM: 'Sala de Treinamento',
};

function formatPrice(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

interface SpaceCardProps {
  space: SpaceWithDetails;
}

export default function SpaceCard({ space }: SpaceCardProps) {
  const mainPhoto = space.photos?.sort((a, b) => a.sort_order - b.sort_order)[0]?.url;

  return (
    <Link to={`/espaco/${space.id}`}>
      <Card className="group overflow-hidden border-border/60 transition-all hover:shadow-lg hover:-translate-y-0.5">
        <div className="relative aspect-[4/3] overflow-hidden">
          {mainPhoto ? (
            <img src={mainPhoto} alt={space.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <Building2 className="h-10 w-10 text-muted-foreground" />
            </div>
          )}
          <div className="absolute left-3 top-3">
            <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm text-foreground text-xs font-medium">
              {spaceTypeLabels[space.type] || space.type}
            </Badge>
          </div>
          {space.verification_status === 'VERIFIED' && (
            <div className="absolute right-3 top-3">
              <Badge className="bg-primary/90 backdrop-blur-sm text-primary-foreground text-xs gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Verificado
              </Badge>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-foreground line-clamp-1 mb-1">{space.title}</h3>

          <div className="mb-2 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span>{space.venue.city}, {space.venue.state}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              <span>Até {space.capacity} pessoas</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-foreground">{formatPrice(space.base_price_cents)}</span>
              <span className="text-sm text-muted-foreground">/hora</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
