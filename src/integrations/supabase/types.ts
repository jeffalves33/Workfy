export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      amenities: {
        Row: {
          code: string
          id: string
          label: string
        }
        Insert: {
          code: string
          id?: string
          label: string
        }
        Update: {
          code?: string
          id?: string
          label?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string
          data: Json | null
          entity_id: string | null
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          created_at?: string
          data?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          created_at?: string
          data?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      availability_blocks: {
        Row: {
          created_at: string
          end_at: string
          id: string
          reason: string | null
          space_id: string
          start_at: string
        }
        Insert: {
          created_at?: string
          end_at: string
          id?: string
          reason?: string | null
          space_id: string
          start_at: string
        }
        Update: {
          created_at?: string
          end_at?: string
          id?: string
          reason?: string | null
          space_id?: string
          start_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_blocks_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          accepted_at: string | null
          accepted_ip: string | null
          accepted_user_agent: string | null
          created_at: string
          id: string
          pdf_url: string | null
          reservation_id: string
          status: Database["public"]["Enums"]["contract_status"]
          version: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_ip?: string | null
          accepted_user_agent?: string | null
          created_at?: string
          id?: string
          pdf_url?: string | null
          reservation_id: string
          status?: Database["public"]["Enums"]["contract_status"]
          version?: string
        }
        Update: {
          accepted_at?: string | null
          accepted_ip?: string | null
          accepted_user_agent?: string | null
          created_at?: string
          id?: string
          pdf_url?: string | null
          reservation_id?: string
          status?: Database["public"]["Enums"]["contract_status"]
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "contracts_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: true
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          last_read_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          last_read_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          last_read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          reservation_id: string | null
          space_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          reservation_id?: string | null
          space_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          reservation_id?: string | null
          space_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          doc_type: Database["public"]["Enums"]["document_type"]
          file_url: string
          id: string
          notes: string | null
          reviewed_at: string | null
          reviewed_by_admin_id: string | null
          space_id: string
          status: Database["public"]["Enums"]["document_status"]
          uploader_user_id: string
        }
        Insert: {
          created_at?: string
          doc_type: Database["public"]["Enums"]["document_type"]
          file_url: string
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by_admin_id?: string | null
          space_id: string
          status?: Database["public"]["Enums"]["document_status"]
          uploader_user_id: string
        }
        Update: {
          created_at?: string
          doc_type?: Database["public"]["Enums"]["document_type"]
          file_url?: string
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by_admin_id?: string | null
          space_id?: string
          status?: Database["public"]["Enums"]["document_status"]
          uploader_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          space_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          space_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          space_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachment_url: string | null
          body: string
          conversation_id: string
          created_at: string
          id: string
          sender_id: string
        }
        Insert: {
          attachment_url?: string | null
          body: string
          conversation_id: string
          created_at?: string
          id?: string
          sender_id: string
        }
        Update: {
          attachment_url?: string | null
          body?: string
          conversation_id?: string
          created_at?: string
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          confirmed_at: string | null
          confirmed_by_admin_id: string | null
          created_at: string
          id: string
          method: string
          pix_copy_paste: string | null
          pix_key: string | null
          proof_url: string | null
          reservation_id: string
          status: Database["public"]["Enums"]["payment_status"]
        }
        Insert: {
          confirmed_at?: string | null
          confirmed_by_admin_id?: string | null
          created_at?: string
          id?: string
          method?: string
          pix_copy_paste?: string | null
          pix_key?: string | null
          proof_url?: string | null
          reservation_id: string
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Update: {
          confirmed_at?: string | null
          confirmed_by_admin_id?: string | null
          created_at?: string
          id?: string
          method?: string
          pix_copy_paste?: string | null
          pix_key?: string | null
          proof_url?: string | null
          reservation_id?: string
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Relationships: [
          {
            foreignKeyName: "payments_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: true
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      payouts: {
        Row: {
          amount_cents: number
          created_at: string
          due_at: string
          host_user_id: string
          id: string
          reservation_id: string
          sent_at: string | null
          status: Database["public"]["Enums"]["payout_status"]
        }
        Insert: {
          amount_cents: number
          created_at?: string
          due_at?: string
          host_user_id: string
          id?: string
          reservation_id: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["payout_status"]
        }
        Update: {
          amount_cents?: number
          created_at?: string
          due_at?: string
          host_user_id?: string
          id?: string
          reservation_id?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["payout_status"]
        }
        Relationships: [
          {
            foreignKeyName: "payouts_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: true
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          cpf_cnpj: string | null
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reservations: {
        Row: {
          attendees_count: number
          created_at: string
          currency: string
          end_at: string
          id: string
          notes: string | null
          platform_fee_cents: number
          space_id: string
          start_at: string
          status: Database["public"]["Enums"]["reservation_status"]
          subtotal_cents: number
          tenant_user_id: string
          total_cents: number
          updated_at: string
        }
        Insert: {
          attendees_count?: number
          created_at?: string
          currency?: string
          end_at: string
          id?: string
          notes?: string | null
          platform_fee_cents?: number
          space_id: string
          start_at: string
          status?: Database["public"]["Enums"]["reservation_status"]
          subtotal_cents?: number
          tenant_user_id: string
          total_cents?: number
          updated_at?: string
        }
        Update: {
          attendees_count?: number
          created_at?: string
          currency?: string
          end_at?: string
          id?: string
          notes?: string | null
          platform_fee_cents?: number
          space_id?: string
          start_at?: string
          status?: Database["public"]["Enums"]["reservation_status"]
          subtotal_cents?: number
          tenant_user_id?: string
          total_cents?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      space_amenities: {
        Row: {
          amenity_id: string
          space_id: string
        }
        Insert: {
          amenity_id: string
          space_id: string
        }
        Update: {
          amenity_id?: string
          space_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "space_amenities_amenity_id_fkey"
            columns: ["amenity_id"]
            isOneToOne: false
            referencedRelation: "amenities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "space_amenities_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      space_opening_hours: {
        Row: {
          day_of_week: number
          end_time: string
          id: string
          space_id: string
          start_time: string
        }
        Insert: {
          day_of_week: number
          end_time: string
          id?: string
          space_id: string
          start_time: string
        }
        Update: {
          day_of_week?: number
          end_time?: string
          id?: string
          space_id?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "space_opening_hours_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      space_photos: {
        Row: {
          id: string
          sort_order: number
          space_id: string
          url: string
        }
        Insert: {
          id?: string
          sort_order?: number
          space_id: string
          url: string
        }
        Update: {
          id?: string
          sort_order?: number
          space_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "space_photos_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      spaces: {
        Row: {
          area_m2: number | null
          base_price_cents: number
          cancellation_policy: string | null
          capacity: number
          cleaning_fee_cents: number
          created_at: string
          currency: string
          description: string
          id: string
          is_active: boolean
          min_duration_min: number
          owner_id: string
          rules: string | null
          slug: string
          title: string
          type: Database["public"]["Enums"]["space_type"]
          updated_at: string
          venue_id: string
          verification_status: Database["public"]["Enums"]["verification_status"]
        }
        Insert: {
          area_m2?: number | null
          base_price_cents?: number
          cancellation_policy?: string | null
          capacity?: number
          cleaning_fee_cents?: number
          created_at?: string
          currency?: string
          description?: string
          id?: string
          is_active?: boolean
          min_duration_min?: number
          owner_id: string
          rules?: string | null
          slug: string
          title: string
          type?: Database["public"]["Enums"]["space_type"]
          updated_at?: string
          venue_id: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Update: {
          area_m2?: number | null
          base_price_cents?: number
          cancellation_policy?: string | null
          capacity?: number
          cleaning_fee_cents?: number
          created_at?: string
          currency?: string
          description?: string
          id?: string
          is_active?: boolean
          min_duration_min?: number
          owner_id?: string
          rules?: string | null
          slug?: string
          title?: string
          type?: Database["public"]["Enums"]["space_type"]
          updated_at?: string
          venue_id?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Relationships: [
          {
            foreignKeyName: "spaces_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      venues: {
        Row: {
          address_line: string
          city: string
          created_at: string
          id: string
          lat: number | null
          lng: number | null
          name: string
          owner_id: string
          state: string
          timezone: string
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address_line: string
          city: string
          created_at?: string
          id?: string
          lat?: number | null
          lng?: number | null
          name: string
          owner_id: string
          state?: string
          timezone?: string
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address_line?: string
          city?: string
          created_at?: string
          id?: string
          lat?: number | null
          lng?: number | null
          name?: string
          owner_id?: string
          state?: string
          timezone?: string
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_reservation_space_owner: {
        Args: { _reservation_id: string }
        Returns: string
      }
      get_reservation_tenant: {
        Args: { _reservation_id: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_conversation_participant: {
        Args: { _conv_id: string }
        Returns: boolean
      }
      is_space_owner: { Args: { _space_id: string }; Returns: boolean }
      is_venue_owner: { Args: { _venue_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
      contract_status: "DRAFT" | "ACCEPTED" | "VOID"
      document_status: "PENDING" | "APPROVED" | "REJECTED"
      document_type: "ID" | "PROOF" | "ALVARA" | "OTHER"
      payment_status:
        | "WAITING_PIX"
        | "PROOF_SUBMITTED"
        | "CONFIRMED"
        | "REJECTED"
        | "REFUNDED"
      payout_status: "PENDING" | "SENT"
      reservation_status:
        | "PENDING_PAYMENT"
        | "PENDING_CONFIRMATION"
        | "CONFIRMED"
        | "CHECKED_IN"
        | "COMPLETED"
        | "CANCELLED"
        | "REJECTED"
      space_type:
        | "MEETING_ROOM"
        | "OFFICE"
        | "CLINIC"
        | "COWORKING"
        | "STUDIO"
        | "TRAINING_ROOM"
      verification_status: "PENDING" | "VERIFIED" | "REJECTED"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      contract_status: ["DRAFT", "ACCEPTED", "VOID"],
      document_status: ["PENDING", "APPROVED", "REJECTED"],
      document_type: ["ID", "PROOF", "ALVARA", "OTHER"],
      payment_status: [
        "WAITING_PIX",
        "PROOF_SUBMITTED",
        "CONFIRMED",
        "REJECTED",
        "REFUNDED",
      ],
      payout_status: ["PENDING", "SENT"],
      reservation_status: [
        "PENDING_PAYMENT",
        "PENDING_CONFIRMATION",
        "CONFIRMED",
        "CHECKED_IN",
        "COMPLETED",
        "CANCELLED",
        "REJECTED",
      ],
      space_type: [
        "MEETING_ROOM",
        "OFFICE",
        "CLINIC",
        "COWORKING",
        "STUDIO",
        "TRAINING_ROOM",
      ],
      verification_status: ["PENDING", "VERIFIED", "REJECTED"],
    },
  },
} as const
