import { Link } from 'react-router-dom';
import { useMyConversations } from '@/hooks/useConversations';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function MessagesPage() {
  const { user } = useAuth();
  const { data: conversations, isLoading } = useMyConversations();

  if (!user) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center px-4 py-20">
        <MessageCircle className="mb-4 h-12 w-12 text-muted-foreground" />
        <h2 className="mb-2 text-xl font-bold">Faça login para ver suas mensagens</h2>
        <Link to="/entrar" className="text-primary hover:underline">Entrar</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold">Mensagens</h1>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : conversations && conversations.length > 0 ? (
        <div className="space-y-1">
          {conversations.map((conv) => (
            <Link
              key={conv.conversation_id}
              to={`/mensagens/${conv.conversation_id}`}
              className="flex items-center gap-3 rounded-xl border border-border p-4 transition-colors hover:bg-muted/50"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={conv.otherProfile?.avatar_url || ''} />
                <AvatarFallback className="bg-secondary text-secondary-foreground text-sm font-semibold">
                  {conv.otherProfile?.name?.charAt(0)?.toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">
                    {conv.otherProfile?.name || 'Usuário'}
                  </span>
                  {conv.lastMessage?.created_at && (
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(conv.lastMessage.created_at), { addSuffix: true, locale: ptBR })}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {conv.conversation?.space?.title && (
                    <span className="font-medium">{conv.conversation.space.title} · </span>
                  )}
                  {conv.lastMessage?.body || 'Sem mensagens'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <MessageCircle className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-1 text-lg font-semibold">Nenhuma conversa ainda</h3>
          <p className="text-sm text-muted-foreground">
            Envie uma mensagem a um anfitrião pela página do espaço.
          </p>
        </div>
      )}
    </div>
  );
}
