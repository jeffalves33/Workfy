import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Tables } from '@/integrations/supabase/types';

export type SpaceWithDetails = Tables<'spaces'> & {
  venue: Tables<'venues'>;
  photos: Tables<'space_photos'>[];
  amenities: (Tables<'space_amenities'> & { amenity: Tables<'amenities'> })[];
};

export function usePublicSpaces(filters?: { query?: string; type?: string }) {
  return useQuery({
    queryKey: ['spaces', 'public', filters],
    queryFn: async () => {
      let q = supabase
        .from('spaces')
        .select(`
          *,
          venue:venues!inner(*),
          photos:space_photos(id, url, sort_order),
          amenities:space_amenities(amenity_id, space_id, amenity:amenities(*))
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (filters?.type) {
        q = q.eq('type', filters.type as any);
      }

      if (filters?.query) {
        const search = filters.query.toLowerCase();
        q = q.or(`title.ilike.%${search}%,venue.city.ilike.%${search}%,venue.address_line.ilike.%${search}%`);
      }

      const { data, error } = await q;
      if (error) throw error;
      return data as SpaceWithDetails[];
    },
  });
}

export function useSpaceDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['spaces', 'detail', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('spaces')
        .select(`
          *,
          venue:venues!inner(*),
          photos:space_photos(id, url, sort_order),
          amenities:space_amenities(amenity_id, space_id, amenity:amenities(*))
        `)
        .eq('id', id!)
        .single();
      if (error) throw error;

      const { data: ownerProfile } = await supabase
        .from('profiles')
        .select('name, avatar_url')
        .eq('user_id', data.owner_id)
        .single();

      return { ...data, ownerProfile } as SpaceWithDetails & { ownerProfile: { name: string; avatar_url: string | null } | null };
    },
  });
}

export function useMySpaces() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['spaces', 'mine', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('spaces')
        .select(`
          *,
          venue:venues!inner(*),
          photos:space_photos(id, url, sort_order),
          amenities:space_amenities(amenity_id, space_id, amenity:amenities(*))
        `)
        .eq('owner_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as SpaceWithDetails[];
    },
  });
}

export function useAmenities() {
  return useQuery({
    queryKey: ['amenities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('amenities')
        .select('*')
        .order('label');
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateSpace() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: {
      venue: { name: string; address_line: string; city: string; state: string; zip_code?: string };
      space: {
        title: string; description: string; type: string; capacity: number;
        area_m2?: number; base_price_cents: number; cleaning_fee_cents: number;
        rules?: string; cancellation_policy?: string;
      };
      amenity_ids: string[];
      photo_urls: string[];
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data: venue, error: venueError } = await supabase
        .from('venues')
        .insert({ name: input.venue.name, address_line: input.venue.address_line, city: input.venue.city, state: input.venue.state, zip_code: input.venue.zip_code || null, owner_id: user.id })
        .select().single();
      if (venueError) throw venueError;

      const slug = input.space.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);

      const { data: space, error: spaceError } = await supabase
        .from('spaces')
        .insert({ ...input.space, type: input.space.type as any, slug, venue_id: venue.id, owner_id: user.id, area_m2: input.space.area_m2 || null, rules: input.space.rules || null, cancellation_policy: input.space.cancellation_policy || null })
        .select().single();
      if (spaceError) throw spaceError;

      if (input.amenity_ids.length > 0) {
        const { error } = await supabase.from('space_amenities').insert(input.amenity_ids.map((aid) => ({ space_id: space.id, amenity_id: aid })));
        if (error) throw error;
      }

      if (input.photo_urls.length > 0) {
        const { error } = await supabase.from('space_photos').insert(input.photo_urls.map((url, i) => ({ space_id: space.id, url, sort_order: i })));
        if (error) throw error;
      }

      return space;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['spaces'] }); },
  });
}

export function useUpdateSpace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      spaceId: string;
      venueId: string;
      venue: { name: string; address_line: string; city: string; state: string; zip_code: string | null };
      space: {
        title: string; description: string; type: string; capacity: number;
        area_m2: number | null; base_price_cents: number; cleaning_fee_cents: number;
        rules: string | null; cancellation_policy: string | null;
      };
      amenity_ids: string[];
      new_photo_urls: string[];
      existing_photo_count: number;
    }) => {
      // Update venue
      const { error: venueError } = await supabase
        .from('venues')
        .update(input.venue)
        .eq('id', input.venueId);
      if (venueError) throw venueError;

      // Update space
      const { error: spaceError } = await supabase
        .from('spaces')
        .update({ ...input.space, type: input.space.type as any })
        .eq('id', input.spaceId);
      if (spaceError) throw spaceError;

      // Replace amenities
      await supabase.from('space_amenities').delete().eq('space_id', input.spaceId);
      if (input.amenity_ids.length > 0) {
        const { error } = await supabase.from('space_amenities').insert(input.amenity_ids.map((aid) => ({ space_id: input.spaceId, amenity_id: aid })));
        if (error) throw error;
      }

      // Add new photos
      if (input.new_photo_urls.length > 0) {
        const startOrder = input.existing_photo_count;
        const { error } = await supabase.from('space_photos').insert(input.new_photo_urls.map((url, i) => ({ space_id: input.spaceId, url, sort_order: startOrder + i })));
        if (error) throw error;
      }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['spaces'] }); },
  });
}
