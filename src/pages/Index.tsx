import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, ArrowRight, Building2, Stethoscope, Users, Camera, GraduationCap, Briefcase, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SpaceCard from '@/components/SpaceCard';
import { usePublicSpaces } from '@/hooks/useSpaces';
import heroImage from '@/assets/hero-workfy.jpg';
import { useState } from 'react';

type SpaceType = 'MEETING_ROOM' | 'OFFICE' | 'CLINIC' | 'COWORKING' | 'STUDIO' | 'TRAINING_ROOM';

const categories: { type: SpaceType; icon: React.ReactNode; label: string }[] = [
  { type: 'MEETING_ROOM', icon: <Building2 className="h-6 w-6" />, label: 'Salas de Reunião' },
  { type: 'CLINIC', icon: <Stethoscope className="h-6 w-6" />, label: 'Consultórios' },
  { type: 'OFFICE', icon: <Briefcase className="h-6 w-6" />, label: 'Escritórios' },
  { type: 'COWORKING', icon: <Users className="h-6 w-6" />, label: 'Coworking' },
  { type: 'STUDIO', icon: <Camera className="h-6 w-6" />, label: 'Estúdios' },
  { type: 'TRAINING_ROOM', icon: <GraduationCap className="h-6 w-6" />, label: 'Treinamento' },
];

export default function Index() {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const { data: spaces, isLoading } = usePublicSpaces();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/buscar${location ? `?q=${encodeURIComponent(location)}` : ''}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative flex min-h-[520px] items-center overflow-hidden">
        <img src={heroImage} alt="Espaço de trabalho moderno" className="absolute inset-0 h-full w-full object-cover" />
        <div className="hero-overlay absolute inset-0" />
        <div className="relative container mx-auto px-4 py-20">
          <div className="max-w-2xl">
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Seu próximo espaço de trabalho te espera
            </h1>
            <p className="mb-8 text-lg text-white/85">
              Reserve salas de reunião, consultórios, escritórios e coworking por hora. Sem contrato, sem burocracia.
            </p>
            <form onSubmit={handleSearch} className="flex flex-col gap-3 rounded-2xl bg-background p-3 shadow-xl sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Onde você precisa de um espaço?" value={location} onChange={(e) => setLocation(e.target.value)} className="border-0 pl-9 shadow-none focus-visible:ring-0" />
              </div>
              <Button type="submit" size="lg" className="gap-2 px-8">
                <Search className="h-4 w-4" /> Buscar
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="mb-8 text-2xl font-bold">Explore por categoria</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          {categories.map((cat) => (
            <Link key={cat.type} to={`/buscar?type=${cat.type}`} className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-6 text-center transition-all hover:border-primary hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                {cat.icon}
              </div>
              <span className="text-sm font-medium">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Spaces */}
      <section className="container mx-auto px-4 pb-16">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Espaços em destaque</h2>
          <Link to="/buscar">
            <Button variant="ghost" className="gap-1">Ver todos <ArrowRight className="h-4 w-4" /></Button>
          </Link>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : spaces && spaces.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {spaces.slice(0, 6).map((space) => (
              <SpaceCard key={space.id} space={space} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>Ainda não há espaços cadastrados. Seja o primeiro a anunciar!</p>
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-primary">
        <div className="container mx-auto flex flex-col items-center gap-6 px-4 py-16 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground">Tem um espaço para alugar?</h2>
          <p className="max-w-md text-primary-foreground/85">Anuncie gratuitamente e comece a receber reservas. Sem taxas de cadastro, sem mensalidades.</p>
          <Link to="/meus-espacos">
            <Button size="lg" variant="secondary" className="gap-2">Anunciar meu espaço <ArrowRight className="h-4 w-4" /></Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
