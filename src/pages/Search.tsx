import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import SpaceCard from '@/components/SpaceCard';
import { usePublicSpaces } from '@/hooks/useSpaces';
import { useState, useMemo } from 'react';

type SpaceType = 'MEETING_ROOM' | 'OFFICE' | 'CLINIC' | 'COWORKING' | 'STUDIO' | 'TRAINING_ROOM';

const spaceTypes: SpaceType[] = ['MEETING_ROOM', 'OFFICE', 'CLINIC', 'COWORKING', 'STUDIO', 'TRAINING_ROOM'];
const spaceTypeLabels: Record<SpaceType, string> = {
  MEETING_ROOM: 'Sala de Reunião',
  OFFICE: 'Escritório',
  CLINIC: 'Consultório',
  COWORKING: 'Coworking',
  STUDIO: 'Estúdio',
  TRAINING_ROOM: 'Sala de Treinamento',
};

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const typeParam = searchParams.get('type') || '';

  const [query, setQuery] = useState(queryParam);
  const [selectedType, setSelectedType] = useState<string>(typeParam);

  const { data: spaces, isLoading } = usePublicSpaces({ query: query || undefined, type: selectedType || undefined });

  const handleTypeToggle = (type: string) => {
    const newType = selectedType === type ? '' : type;
    setSelectedType(newType);
    const params = new URLSearchParams(searchParams);
    if (newType) params.set('type', newType);
    else params.delete('type');
    setSearchParams(params);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por cidade, bairro ou nome..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {spaceTypes.map((type) => (
          <Badge
            key={type}
            variant={selectedType === type ? 'default' : 'outline'}
            className="cursor-pointer px-4 py-2 text-sm transition-colors hover:bg-primary hover:text-primary-foreground"
            onClick={() => handleTypeToggle(type)}
          >
            {spaceTypeLabels[type]}
          </Badge>
        ))}
        {selectedType && (
          <Badge
            variant="secondary"
            className="cursor-pointer px-4 py-2 text-sm"
            onClick={() => { setSelectedType(''); searchParams.delete('type'); setSearchParams(searchParams); }}
          >
            Limpar filtro ✕
          </Badge>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            {spaces?.length || 0} {(spaces?.length || 0) === 1 ? 'espaço encontrado' : 'espaços encontrados'}
            {query && <span> para "{query}"</span>}
          </div>

          {spaces && spaces.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {spaces.map((space) => (
                <SpaceCard key={space.id} space={space} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <SearchIcon className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="mb-2 text-lg font-semibold">Nenhum espaço encontrado</h3>
              <p className="text-muted-foreground">Tente ajustar seus filtros ou buscar por outra localidade.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
