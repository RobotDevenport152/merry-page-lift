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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      contact_enquiries: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          status: string | null
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          status?: string | null
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          status?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      fiber_batches: {
        Row: {
          batch_code: string
          created_at: string
          farm_image: string | null
          farm_name: string
          fiber_grade: string | null
          grower_name: string | null
          grower_user_id: string | null
          id: string
          manufacturing_date: string | null
          micron_measurement: number | null
          payout: number | null
          processing_date: string | null
          product_type: string | null
          region: string
          shearing_date: string | null
          status: string | null
          updated_at: string
          weight_kg: number | null
        }
        Insert: {
          batch_code: string
          created_at?: string
          farm_image?: string | null
          farm_name: string
          fiber_grade?: string | null
          grower_name?: string | null
          grower_user_id?: string | null
          id?: string
          manufacturing_date?: string | null
          micron_measurement?: number | null
          payout?: number | null
          processing_date?: string | null
          product_type?: string | null
          region: string
          shearing_date?: string | null
          status?: string | null
          updated_at?: string
          weight_kg?: number | null
        }
        Update: {
          batch_code?: string
          created_at?: string
          farm_image?: string | null
          farm_name?: string
          fiber_grade?: string | null
          grower_name?: string | null
          grower_user_id?: string | null
          id?: string
          manufacturing_date?: string | null
          micron_measurement?: number | null
          payout?: number | null
          processing_date?: string | null
          product_type?: string | null
          region?: string
          shearing_date?: string | null
          status?: string | null
          updated_at?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          batch_code: string | null
          created_at: string
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          total_price: number
          unit_price: number
          variant: string | null
        }
        Insert: {
          batch_code?: string | null
          created_at?: string
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          quantity?: number
          total_price: number
          unit_price: number
          variant?: string | null
        }
        Update: {
          batch_code?: string | null
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          total_price?: number
          unit_price?: number
          variant?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          carrier: string | null
          created_at: string
          currency: string
          discount: number
          id: string
          notes: string | null
          order_number: string
          payment_intent_id: string | null
          payment_method: string | null
          promo_code: string | null
          shipping_address: Json | null
          shipping_cost: number
          shipping_email: string
          shipping_name: string
          shipping_phone: string | null
          status: string
          subtotal: number
          total: number
          tracking_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          carrier?: string | null
          created_at?: string
          currency?: string
          discount?: number
          id?: string
          notes?: string | null
          order_number: string
          payment_intent_id?: string | null
          payment_method?: string | null
          promo_code?: string | null
          shipping_address?: Json | null
          shipping_cost?: number
          shipping_email: string
          shipping_name: string
          shipping_phone?: string | null
          status?: string
          subtotal?: number
          total?: number
          tracking_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          carrier?: string | null
          created_at?: string
          currency?: string
          discount?: number
          id?: string
          notes?: string | null
          order_number?: string
          payment_intent_id?: string | null
          payment_method?: string | null
          promo_code?: string | null
          shipping_address?: Json | null
          shipping_cost?: number
          shipping_email?: string
          shipping_name?: string
          shipping_phone?: string | null
          status?: string
          subtotal?: number
          total?: number
          tracking_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      product_reviews: {
        Row: {
          content: string | null
          country_code: string | null
          created_at: string
          helpful_count: number | null
          id: string
          product_id: string
          rating: number
          title: string | null
          updated_at: string
          user_id: string
          verified_purchase: boolean | null
        }
        Insert: {
          content?: string | null
          country_code?: string | null
          created_at?: string
          helpful_count?: number | null
          id?: string
          product_id: string
          rating: number
          title?: string | null
          updated_at?: string
          user_id: string
          verified_purchase?: boolean | null
        }
        Update: {
          content?: string | null
          country_code?: string | null
          created_at?: string
          helpful_count?: number | null
          id?: string
          product_id?: string
          rating?: number
          title?: string | null
          updated_at?: string
          user_id?: string
          verified_purchase?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          certifications: string[] | null
          created_at: string
          description_en: string | null
          description_zh: string | null
          fill_power: string | null
          id: string
          image: string | null
          images: string[] | null
          is_active: boolean | null
          is_featured: boolean | null
          name_en: string
          name_zh: string
          price_cny: number
          price_nzd: number
          price_usd: number
          rating: number | null
          review_count: number | null
          slug: string
          stock: number
          updated_at: string
          variants: Json | null
          weight: string | null
        }
        Insert: {
          category?: string
          certifications?: string[] | null
          created_at?: string
          description_en?: string | null
          description_zh?: string | null
          fill_power?: string | null
          id?: string
          image?: string | null
          images?: string[] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name_en: string
          name_zh: string
          price_cny?: number
          price_nzd?: number
          price_usd?: number
          rating?: number | null
          review_count?: number | null
          slug: string
          stock?: number
          updated_at?: string
          variants?: Json | null
          weight?: string | null
        }
        Update: {
          category?: string
          certifications?: string[] | null
          created_at?: string
          description_en?: string | null
          description_zh?: string | null
          fill_power?: string | null
          id?: string
          image?: string | null
          images?: string[] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name_en?: string
          name_zh?: string
          price_cny?: number
          price_nzd?: number
          price_usd?: number
          rating?: number | null
          review_count?: number | null
          slug?: string
          stock?: number
          updated_at?: string
          variants?: Json | null
          weight?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          default_address: Json | null
          display_name: string | null
          id: string
          phone: string | null
          preferred_currency: string | null
          preferred_locale: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          default_address?: Json | null
          display_name?: string | null
          id?: string
          phone?: string | null
          preferred_currency?: string | null
          preferred_locale?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          default_address?: Json | null
          display_name?: string | null
          id?: string
          phone?: string | null
          preferred_currency?: string | null
          preferred_locale?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          code: string
          created_at: string
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean | null
          max_uses: number | null
          min_amount: number | null
          uses_count: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_amount?: number | null
          uses_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_amount?: number | null
          uses_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      stock_notifications: {
        Row: {
          created_at: string
          email: string
          id: string
          notified_at: string | null
          product_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          notified_at?: string | null
          product_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          notified_at?: string | null
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_notifications_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
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
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wholesale_enquiries: {
        Row: {
          company_name: string
          contact_name: string
          country: string | null
          created_at: string
          email: string
          id: string
          message: string | null
          phone: string | null
          product_interest: string | null
          quantity: string | null
          status: string | null
        }
        Insert: {
          company_name: string
          contact_name: string
          country?: string | null
          created_at?: string
          email: string
          id?: string
          message?: string | null
          phone?: string | null
          product_interest?: string | null
          quantity?: string | null
          status?: string | null
        }
        Update: {
          company_name?: string
          contact_name?: string
          country?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          phone?: string | null
          product_interest?: string | null
          quantity?: string | null
          status?: string | null
        }
        Relationships: []
      }
      wishlist: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_fiber_batches: {
        Row: {
          batch_code: string | null
          created_at: string | null
          farm_name: string | null
          fiber_grade: string | null
          manufacturing_date: string | null
          micron_measurement: number | null
          processing_date: string | null
          product_type: string | null
          region: string | null
          shearing_date: string | null
          status: string | null
          weight_kg: number | null
        }
        Insert: {
          batch_code?: string | null
          created_at?: string | null
          farm_name?: string | null
          fiber_grade?: string | null
          manufacturing_date?: string | null
          micron_measurement?: number | null
          processing_date?: string | null
          product_type?: string | null
          region?: string | null
          shearing_date?: string | null
          status?: string | null
          weight_kg?: number | null
        }
        Update: {
          batch_code?: string | null
          created_at?: string | null
          farm_name?: string | null
          fiber_grade?: string | null
          manufacturing_date?: string | null
          micron_measurement?: number | null
          processing_date?: string | null
          product_type?: string | null
          region?: string | null
          shearing_date?: string | null
          status?: string | null
          weight_kg?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      decrement_product_stock: {
        Args: { p_product_id: string; p_quantity: number }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "grower" | "customer"
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
      app_role: ["admin", "moderator", "grower", "customer"],
    },
  },
} as const
