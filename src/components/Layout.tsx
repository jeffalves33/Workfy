import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Search, Heart, User, LogOut, Building2, CalendarDays, Settings, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';

const navLinks = [
  { to: '/buscar', label: 'Explorar' },
  { to: '/meus-espacos', label: 'Anunciar' },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  const { user, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className={`sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 ${isHome ? 'border-transparent' : 'border-border'}`}>
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">W</span>
            </div>
            <span className="text-xl font-bold text-foreground">Workfy</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to}>
                <Button variant={location.pathname === link.to ? 'secondary' : 'ghost'} size="sm">
                  {link.label}
                </Button>
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-2 md:flex">
            <Link to="/buscar">
              <Button variant="ghost" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </Link>
            {!loading && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {user.user_metadata?.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span className="max-w-[120px] truncate">{user.user_metadata?.name || user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigate('/perfil/dados')}>
                    <User className="mr-2 h-4 w-4" /> Meu perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/perfil/reservas')}>
                    <CalendarDays className="mr-2 h-4 w-4" /> Minhas reservas
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/meus-espacos')}>
                    <Building2 className="mr-2 h-4 w-4" /> Meus espaços
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/mensagens')}>
                    <MessageCircle className="mr-2 h-4 w-4" /> Mensagens
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/perfil/configuracoes')}>
                    <Settings className="mr-2 h-4 w-4" /> Configurações
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" /> Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : !loading ? (
              <>
                <Link to="/entrar">
                  <Button variant="ghost" size="icon">
                    <Heart className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/entrar">
                  <Button size="sm">
                    <User className="mr-1.5 h-4 w-4" />
                    Entrar
                  </Button>
                </Link>
              </>
            ) : null}
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="flex flex-col gap-4 pt-8">
                <Link to="/" className="flex items-center gap-2 mb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                    <span className="text-sm font-bold text-primary-foreground">W</span>
                  </div>
                  <span className="text-xl font-bold">Workfy</span>
                </Link>
                {navLinks.map((link) => (
                  <SheetClose asChild key={link.to}>
                    <Link to={link.to}>
                      <Button variant="ghost" className="w-full justify-start">
                        {link.label}
                      </Button>
                    </Link>
                  </SheetClose>
                ))}
                <hr className="border-border" />
                {user ? (
                  <>
                    <div className="px-3 py-1 text-sm font-medium text-muted-foreground truncate">
                      {user.user_metadata?.name || user.email}
                    </div>
                    <SheetClose asChild>
                      <Link to="/perfil/dados">
                        <Button variant="ghost" className="w-full justify-start gap-2">
                          <User className="h-4 w-4" /> Meu perfil
                        </Button>
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link to="/perfil/reservas">
                        <Button variant="ghost" className="w-full justify-start gap-2">
                          <CalendarDays className="h-4 w-4" /> Minhas reservas
                        </Button>
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link to="/meus-espacos">
                        <Button variant="ghost" className="w-full justify-start gap-2">
                          <Building2 className="h-4 w-4" /> Meus espaços
                        </Button>
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link to="/mensagens">
                        <Button variant="ghost" className="w-full justify-start gap-2">
                          <MessageCircle className="h-4 w-4" /> Mensagens
                        </Button>
                      </Link>
                    </SheetClose>
                    <hr className="border-border" />
                    <SheetClose asChild>
                      <Button variant="ghost" className="w-full justify-start gap-2 text-destructive" onClick={handleSignOut}>
                        <LogOut className="h-4 w-4" /> Sair
                      </Button>
                    </SheetClose>
                  </>
                ) : (
                  <>
                    <SheetClose asChild>
                      <Link to="/entrar">
                        <Button className="w-full">Entrar</Button>
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link to="/cadastrar">
                        <Button variant="outline" className="w-full">Criar conta</Button>
                      </Link>
                    </SheetClose>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-muted/50">
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <Link to="/" className="flex items-center gap-2 mb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                  <span className="text-xs font-bold text-primary-foreground">W</span>
                </div>
                <span className="text-lg font-bold">Workfy</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                Marketplace de espaços profissionais. Reserve por hora, sem burocracia.
              </p>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Explorar</h4>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <Link to="/buscar" className="hover:text-foreground transition-colors">Buscar espaços</Link>
                <Link to="/buscar?type=MEETING_ROOM" className="hover:text-foreground transition-colors">Salas de reunião</Link>
                <Link to="/buscar?type=COWORKING" className="hover:text-foreground transition-colors">Coworking</Link>
                <Link to="/buscar?type=OFFICE" className="hover:text-foreground transition-colors">Escritórios</Link>
              </div>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Para anfitriões</h4>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <Link to="/meus-espacos" className="hover:text-foreground transition-colors">Anunciar espaço</Link>
                <span>Como funciona</span>
                <span>Central de ajuda</span>
              </div>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Workfy</h4>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <span>Sobre nós</span>
                <span>Termos de uso</span>
                <span>Política de privacidade</span>
                <span>Contato</span>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Workfy. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
