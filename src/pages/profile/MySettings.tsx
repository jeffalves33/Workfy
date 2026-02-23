import { Settings } from 'lucide-react';

export default function MySettings() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Configurações</h1>
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
        <Settings className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-semibold mb-1">Configurações da conta</h2>
        <p className="text-sm text-muted-foreground">Em breve você poderá gerenciar suas configurações aqui.</p>
      </div>
    </div>
  );
}
