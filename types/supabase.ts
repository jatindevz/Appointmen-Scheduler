export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_date: string;
          created_at: string;
          end_time: string;
          id: string;
          service_id: string;
          start_time: string;
          status: "confirmed" | "cancelled";
          user_id: string;
        };
        Insert: {
          appointment_date: string;
          created_at?: string;
          end_time: string;
          id?: string;
          service_id: string;
          start_time: string;
          status?: "confirmed" | "cancelled";
          user_id: string;
        };
        Update: {
          appointment_date?: string;
          created_at?: string;
          end_time?: string;
          id?: string;
          service_id?: string;
          start_time?: string;
          status?: "confirmed" | "cancelled";
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "appointments_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      availability: {
        Row: {
          end_time: string;
          id: string;
          start_time: string;
          weekday: number;
        };
        Insert: {
          end_time: string;
          id?: string;
          start_time: string;
          weekday: number;
        };
        Update: {
          end_time?: string;
          id?: string;
          start_time?: string;
          weekday?: number;
        };
        Relationships: [];
      };
      services: {
        Row: {
          description: string | null;
          duration_minutes: number;
          id: string;
          name: string;
          price: number;
        };
        Insert: {
          description?: string | null;
          duration_minutes: number;
          id?: string;
          name: string;
          price: number;
        };
        Update: {
          description?: string | null;
          duration_minutes?: number;
          id?: string;
          name?: string;
          price?: number;
        };
        Relationships: [];
      };
      users: {
        Row: {
          created_at: string;
          full_name: string;
          id: string;
          role: "client" | "admin";
        };
        Insert: {
          created_at?: string;
          full_name: string;
          id: string;
          role?: "client" | "admin";
        };
        Update: {
          created_at?: string;
          full_name?: string;
          id?: string;
          role?: "client" | "admin";
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      book_appointment: {
        Args: {
          p_appointment_date: string;
          p_service_id: string;
          p_start_time: string;
        };
        Returns: Database["public"]["Tables"]["appointments"]["Row"][];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
