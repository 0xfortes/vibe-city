/**
 * Supabase database types.
 * In production, generate these with: npx supabase gen types typescript
 * For now, hand-written to match our migration schema.
 */

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          stripe_customer_id: string | null;
          subscription_status: string | null;
          subscription_tier: string | null;
          free_debates_used: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          avatar_url?: string | null;
          stripe_customer_id?: string | null;
          subscription_status?: string | null;
          subscription_tier?: string | null;
          free_debates_used?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          stripe_customer_id?: string | null;
          subscription_status?: string | null;
          subscription_tier?: string | null;
          free_debates_used?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      debates: {
        Row: {
          id: string;
          user_id: string;
          city_id: string;
          mood: string | null;
          messages: string; // JSON stringified AgentMessage[]
          verdict: string | null; // JSON stringified VerdictCard
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          city_id: string;
          mood?: string | null;
          messages: string;
          verdict?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          city_id?: string;
          mood?: string | null;
          messages?: string;
          verdict?: string | null;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
