/**
 * Database Types
 *
 * Questi tipi rappresentano lo schema del database Supabase.
 *
 * Per rigenerare automaticamente questi tipi dal database:
 * 1. Installa Supabase CLI: npm install -g supabase
 * 2. Login: supabase login
 * 3. Link project: supabase link --project-ref sgdxmtqrjgxuajxxvajf
 * 4. Generate types: supabase gen types typescript --linked > src/types/database.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tenants: {
        Row: {
          id: string;
          owner_id: string;
          restaurant_name: string;
          slug: string;
          contact_email: string | null;
          phone: string | null;
          address: string | null;
          city: string | null;
          country: string;
          logo_url: string | null;
          primary_color: string;
          secondary_color: string;
          default_language: string;
          supported_languages: string[];
          currency: string;
          cover_charge: number;
          subscription_tier: string;
          subscription_status: string;

          onboarding_completed: boolean;
          onboarding_step: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          restaurant_name: string;
          slug: string;
          contact_email?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          country?: string;
          logo_url?: string | null;
          primary_color?: string;
          secondary_color?: string;
          default_language?: string;
          supported_languages?: string[];
          currency?: string;
          cover_charge?: number;
          subscription_tier?: string;
          subscription_status?: string;

          onboarding_completed?: boolean;
          onboarding_step?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          restaurant_name?: string;
          slug?: string;
          contact_email?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          country?: string;
          logo_url?: string | null;
          primary_color?: string;
          secondary_color?: string;
          default_language?: string;
          supported_languages?: string[];
          currency?: string;
          cover_charge?: number;
          subscription_tier?: string;
          subscription_status?: string;

          onboarding_completed?: boolean;
          onboarding_step?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      allergens: {
        Row: {
          id: string;
          number: number;
          icon: string;
          name: Json;
          description: Json | null;
          created_at: string;
        };
        Insert: {
          id: string;
          number: number;
          icon: string;
          name: Json;
          description?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          number?: number;
          icon?: string;
          name?: Json;
          description?: Json | null;
          created_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          tenant_id: string;
          name: Json;
          slug: string;
          description: Json | null;
          display_order: number;
          is_visible: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: Json;
          slug: string;
          description?: Json | null;
          display_order?: number;
          is_visible?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: Json;
          slug?: string;
          description?: Json | null;
          display_order?: number;
          is_visible?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      dishes: {
        Row: {
          id: string;
          tenant_id: string;
          category_id: string;
          name: Json;
          description: Json;
          slug: string;
          price: number;
          image_url: string | null;
          is_visible: boolean;
          is_seasonal: boolean;
          seasonal_note: Json | null;
          is_gluten_free: boolean;
          is_vegetarian: boolean;
          is_vegan: boolean;
          is_homemade: boolean;
          is_frozen: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          category_id: string;
          name: Json;
          description: Json;
          slug: string;
          price: number;
          image_url?: string | null;
          is_visible?: boolean;
          is_seasonal?: boolean;
          seasonal_note?: Json | null;
          is_gluten_free?: boolean;
          is_vegetarian?: boolean;
          is_vegan?: boolean;
          is_homemade?: boolean;
          is_frozen?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          category_id?: string;
          name?: Json;
          description?: Json;
          slug?: string;
          price?: number;
          image_url?: string | null;
          is_visible?: boolean;
          is_seasonal?: boolean;
          seasonal_note?: Json | null;
          is_gluten_free?: boolean;
          is_vegetarian?: boolean;
          is_vegan?: boolean;
          is_homemade?: boolean;
          is_frozen?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      dish_allergens: {
        Row: {
          dish_id: string;
          allergen_id: string;
          tenant_id: string;
          created_at: string;
        };
        Insert: {
          dish_id: string;
          allergen_id: string;
          tenant_id: string;
          created_at?: string;
        };
        Update: {
          dish_id?: string;
          allergen_id?: string;
          tenant_id?: string;
          created_at?: string;
        };
      };
      reservation_settings: {
        Row: {
          tenant_id: string;
          is_active: boolean;
          notification_email: string | null;
          total_seats: number;
          total_high_chairs: number;
          min_advance_hours: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          tenant_id: string;
          is_active?: boolean;
          notification_email?: string | null;
          total_seats?: number;
          total_high_chairs?: number;
          min_advance_hours?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          tenant_id?: string;
          is_active?: boolean;
          notification_email?: string | null;
          total_seats?: number;
          total_high_chairs?: number;
          min_advance_hours?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      reservation_tables: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          seats: number;
          display_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          seats?: number;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          seats?: number;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
      };
      reservation_shifts: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          start_time: string;
          end_time: string;
          days_of_week: number[];
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          start_time: string;
          end_time: string;
          days_of_week?: number[];
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          start_time?: string;
          end_time?: string;
          days_of_week?: number[];
          is_active?: boolean;
          created_at?: string;
        };
      };
      reservations: {
        Row: {
          id: string;
          tenant_id: string;
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          guests: number;
          high_chairs: number;
          reservation_date: string;
          reservation_time: string;
          status: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          guests: number;
          high_chairs?: number;
          reservation_date: string;
          reservation_time: string;
          status?: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          customer_name?: string;
          customer_email?: string;
          customer_phone?: string;
          guests?: number;
          high_chairs?: number;
          reservation_date?: string;
          reservation_time?: string;
          status?: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      reservation_assignments: {
        Row: {
          reservation_id: string;
          table_id: string;
          assigned_at: string;
        };
        Insert: {
          reservation_id: string;
          table_id: string;
          assigned_at?: string;
        };
        Update: {
          reservation_id?: string;
          table_id?: string;
          assigned_at?: string;
        };
      };
    };
    Views: {
      menu_with_allergens: {
        Row: {
          dish_id: string | null;
          tenant_id: string | null;
          category_id: string | null;
          category_name: Json | null;
          category_slug: string | null;
          category_order: number | null;
          dish_name: Json | null;
          description: Json | null;
          dish_slug: string | null;
          price: number | null;
          image_url: string | null;
          is_visible: boolean | null;
          is_seasonal: boolean | null;
          seasonal_note: Json | null;
          is_gluten_free: boolean | null;
          is_vegetarian: boolean | null;
          is_vegan: boolean | null;
          dish_order: number | null;
          allergens: Json | null;
        };
      };
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
