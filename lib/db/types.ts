/**
 * Hand-written Database type that mirrors supabase/migrations/
 * 20260427000001_initial_schema.sql.
 *
 * This is a temporary stand-in until you run:
 *
 *   supabase gen types typescript --linked > lib/db/types.ts
 *
 * after the Supabase CLI is set up locally. The generated output
 * may differ in formatting (column order, additional helper types
 * around Views/Functions/Enums) — replace this file wholesale when
 * you regenerate. The generated version becomes the canonical one;
 * this exists only so v1 features can be properly typed before the
 * CLI install lands.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      equipment: {
        Row: {
          id: string;
          name: string;
          type: string | null;
          manufacturer: string | null;
          model: string | null;
          serial: string | null;
          install_date: string | null;
          location: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type?: string | null;
          manufacturer?: string | null;
          model?: string | null;
          serial?: string | null;
          install_date?: string | null;
          location?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: string | null;
          manufacturer?: string | null;
          model?: string | null;
          serial?: string | null;
          install_date?: string | null;
          location?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      vendor: {
        Row: {
          id: string;
          name: string;
          type: "supplier" | "contractor" | "service";
          email: string | null;
          phone: string | null;
          website: string | null;
          specialty: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: "supplier" | "contractor" | "service";
          email?: string | null;
          phone?: string | null;
          website?: string | null;
          specialty?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: "supplier" | "contractor" | "service";
          email?: string | null;
          phone?: string | null;
          website?: string | null;
          specialty?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      part_search: {
        Row: {
          id: string;
          input_text: string | null;
          input_image_url: string | null;
          results: Json;
          chosen_result_id: string | null;
          equipment_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          input_text?: string | null;
          input_image_url?: string | null;
          results?: Json;
          chosen_result_id?: string | null;
          equipment_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          input_text?: string | null;
          input_image_url?: string | null;
          results?: Json;
          chosen_result_id?: string | null;
          equipment_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "part_search_equipment_id_fkey";
            columns: ["equipment_id"];
            isOneToOne: false;
            referencedRelation: "equipment";
            referencedColumns: ["id"];
          },
        ];
      };
      email_draft: {
        Row: {
          id: string;
          recipient_email: string;
          subject: string;
          body: string;
          attachments: Json;
          vendor_id: string | null;
          context_type: "part_search" | "vendor" | "equipment" | null;
          context_id: string | null;
          status: "draft" | "sent" | "ignored";
          gmail_draft_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          recipient_email: string;
          subject: string;
          body: string;
          attachments?: Json;
          vendor_id?: string | null;
          context_type?: "part_search" | "vendor" | "equipment" | null;
          context_id?: string | null;
          status?: "draft" | "sent" | "ignored";
          gmail_draft_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          recipient_email?: string;
          subject?: string;
          body?: string;
          attachments?: Json;
          vendor_id?: string | null;
          context_type?: "part_search" | "vendor" | "equipment" | null;
          context_id?: string | null;
          status?: "draft" | "sent" | "ignored";
          gmail_draft_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "email_draft_vendor_id_fkey";
            columns: ["vendor_id"];
            isOneToOne: false;
            referencedRelation: "vendor";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};

// Convenience aliases for consumers — saves writing the full path.
export type EquipmentRow = Database["public"]["Tables"]["equipment"]["Row"];
export type VendorRow = Database["public"]["Tables"]["vendor"]["Row"];
export type PartSearchRow = Database["public"]["Tables"]["part_search"]["Row"];
export type EmailDraftRow = Database["public"]["Tables"]["email_draft"]["Row"];
