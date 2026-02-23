import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useEffect } from 'react';

export function useStartConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { space_id: string; owner_id: string; initial_message: string }) => {
      const { data, error } = await supabase.rpc('start_conversation' as any, {
        _space_id: input.space_id,
        _owner_id: input.owner_id,
        _initial_message: input.initial_message,
      });
      if (error) throw error;
      return data as unknown as string;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useMyConversations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['conversations', 'mine', user?.id],
    enabled: !!user,
    queryFn: async () => {
      // Get conversations where user is participant
      const { data: participations, error } = await supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          conversation:conversations(
            id, space_id, created_at,
            space:spaces(id, title)
          )
        `)
        .eq('user_id', user!.id);
      if (error) throw error;

      // For each conversation, get the last message and other participant's profile
      const enriched = await Promise.all(
        (participations || []).map(async (p: any) => {
          const convId = p.conversation_id;

          // Last message
          const { data: lastMsg } = await supabase
            .from('messages')
            .select('body, created_at, sender_id')
            .eq('conversation_id', convId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Other participant
          const { data: otherParts } = await supabase
            .from('conversation_participants')
            .select('user_id')
            .eq('conversation_id', convId)
            .neq('user_id', user!.id)
            .limit(1);

          let otherProfile = null;
          if (otherParts && otherParts.length > 0) {
            const { data: prof } = await supabase
              .from('profiles')
              .select('name, avatar_url')
              .eq('user_id', otherParts[0].user_id)
              .single();
            otherProfile = prof;
          }

          return {
            conversation_id: convId,
            conversation: p.conversation,
            lastMessage: lastMsg,
            otherProfile,
          };
        })
      );

      // Sort by last message date
      enriched.sort((a, b) => {
        const da = a.lastMessage?.created_at || a.conversation?.created_at || '';
        const db = b.lastMessage?.created_at || b.conversation?.created_at || '';
        return db.localeCompare(da);
      });

      return enriched;
    },
  });
}

export function useConversationMessages(conversationId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient]);

  return useQuery({
    queryKey: ['messages', conversationId],
    enabled: !!conversationId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId!)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: { conversation_id: string; body: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: input.conversation_id,
          sender_id: user.id,
          body: input.body,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['messages', vars.conversation_id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
