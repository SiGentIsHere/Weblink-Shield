// Database types for Supabase integration
export interface Database {
  public: {
    Tables: {
      Plan: {
        Row: {
          plan_id: number
          name: string
          description: string | null
          price: number
          created_at: string
        }
        Insert: {
          plan_id?: number
          name: string
          description?: string | null
          price?: number
          created_at?: string
        }
        Update: {
          plan_id?: number
          name?: string
          description?: string | null
          price?: number
          created_at?: string
        }
      }
      Role: {
        Row: {
          role_id: number
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          role_id?: number
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          role_id?: number
          name?: string
          description?: string | null
          created_at?: string
        }
      }
      User: {
        Row: {
          user_id: number
          role_id: number
          email: string
          username: string
          status: string
          created_at: string
          updated_at: string
          auth_user_id: string | null
          first_name: string | null
          last_name: string | null
          avatar_url: string | null
          last_login: string | null
        }
        Insert: {
          user_id?: number
          role_id: number
          email: string
          username: string
          status?: string
          created_at?: string
          updated_at?: string
          auth_user_id?: string | null
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          last_login?: string | null
        }
        Update: {
          user_id?: number
          role_id?: number
          email?: string
          username?: string
          status?: string
          created_at?: string
          updated_at?: string
          auth_user_id?: string | null
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          last_login?: string | null
        }
      }
      PlanPolicy: {
        Row: {
          policy_id: number
          plan_id: number
          daily_scan_limit: number
          monthly_scan_limit: number
          export_allowed: boolean
          detailed_report_allowed: boolean
          api_access_allowed: boolean
          priority_support: boolean
          created_at: string
        }
        Insert: {
          policy_id?: number
          plan_id: number
          daily_scan_limit?: number
          monthly_scan_limit?: number
          export_allowed?: boolean
          detailed_report_allowed?: boolean
          api_access_allowed?: boolean
          priority_support?: boolean
          created_at?: string
        }
        Update: {
          policy_id?: number
          plan_id?: number
          daily_scan_limit?: number
          monthly_scan_limit?: number
          export_allowed?: boolean
          detailed_report_allowed?: boolean
          api_access_allowed?: boolean
          priority_support?: boolean
          created_at?: string
        }
      }
      Subscription: {
        Row: {
          subscription_id: number
          user_id: number
          plan_id: number
          start_date: string
          end_date: string
          status: string
          auto_renew: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          subscription_id?: number
          user_id: number
          plan_id: number
          start_date: string
          end_date: string
          status?: string
          auto_renew?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          subscription_id?: number
          user_id?: number
          plan_id?: number
          start_date?: string
          end_date?: string
          status?: string
          auto_renew?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      Scan: {
        Row: {
          scan_id: number
          user_id: number
          url_scanned: string
          scan_type: string
          submitted_at: string
          started_at: string | null
          analyzed_at: string | null
          completed_at: string | null
          status: string
          progress: number
          error_message: string | null
          scan_duration_seconds: number | null
        }
        Insert: {
          scan_id?: number
          user_id: number
          url_scanned: string
          scan_type?: string
          submitted_at?: string
          started_at?: string | null
          analyzed_at?: string | null
          completed_at?: string | null
          status?: string
          progress?: number
          error_message?: string | null
          scan_duration_seconds?: number | null
        }
        Update: {
          scan_id?: number
          user_id?: number
          url_scanned?: string
          scan_type?: string
          submitted_at?: string
          started_at?: string | null
          analyzed_at?: string | null
          completed_at?: string | null
          status?: string
          progress?: number
          error_message?: string | null
          scan_duration_seconds?: number | null
        }
      }
      DetailedReport: {
        Row: {
          detail_id: number
          scan_id: number
          type: string
          result: string
          extra_info: any | null
          recommendation: string | null
          technical_details: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          detail_id?: number
          scan_id: number
          type: string
          result: string
          extra_info?: any | null
          recommendation?: string | null
          technical_details?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          detail_id?: number
          scan_id?: number
          type?: string
          result?: string
          extra_info?: any | null
          recommendation?: string | null
          technical_details?: any | null
          created_at?: string
          updated_at?: string
        }
      }
      ThreatSummary: {
        Row: {
          summary_id: number
          scan_id: number
          category: string
          severity: string
          status: string
          description: string | null
          confidence_score: number | null
          detected_at: string
        }
        Insert: {
          summary_id?: number
          scan_id: number
          category: string
          severity: string
          status: string
          description?: string | null
          confidence_score?: number | null
          detected_at?: string
        }
        Update: {
          summary_id?: number
          scan_id?: number
          category?: string
          severity?: string
          status?: string
          description?: string | null
          confidence_score?: number | null
          detected_at?: string
        }
      }
      ScoreReport: {
        Row: {
          detail_id: number
          scan_id: number
          overall_score: number
          risk_level: string
          security_score: number | null
          performance_score: number | null
          seo_score: number | null
          accessibility_score: number | null
          created_at: string
        }
        Insert: {
          detail_id: number
          scan_id: number
          overall_score: number
          risk_level: string
          security_score?: number | null
          performance_score?: number | null
          seo_score?: number | null
          accessibility_score?: number | null
          created_at?: string
        }
        Update: {
          detail_id?: number
          scan_id?: number
          overall_score?: number
          risk_level?: string
          security_score?: number | null
          performance_score?: number | null
          seo_score?: number | null
          accessibility_score?: number | null
          created_at?: string
        }
      }
      History: {
        Row: {
          history_id: number
          user_id: number
          scan_id: number
          saved_at: string
          notes: string | null
          is_favorite: boolean
        }
        Insert: {
          history_id?: number
          user_id: number
          scan_id: number
          saved_at?: string
          notes?: string | null
          is_favorite?: boolean
        }
        Update: {
          history_id?: number
          user_id?: number
          scan_id?: number
          saved_at?: string
          notes?: string | null
          is_favorite?: boolean
        }
      }
      Review: {
        Row: {
          review_id: number
          user_id: number
          rating: number
          comment: string | null
          is_featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          review_id?: number
          user_id: number
          rating: number
          comment?: string | null
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          review_id?: number
          user_id?: number
          rating?: number
          comment?: string | null
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      UsageCounter: {
        Row: {
          usage_id: number
          user_id: number
          period_start: string
          period_end: string
          scans_used: number
          api_calls_used: number
          last_reset: string
        }
        Insert: {
          usage_id?: number
          user_id: number
          period_start: string
          period_end: string
          scans_used?: number
          api_calls_used?: number
          last_reset?: string
        }
        Update: {
          usage_id?: number
          user_id?: number
          period_start?: string
          period_end?: string
          scans_used?: number
          api_calls_used?: number
          last_reset?: string
        }
      }
    }
    Views: {
      active_subscriptions: {
        Row: {
          subscription_id: number
          username: string
          email: string
          plan_name: string
          start_date: string
          end_date: string
          status: string
          daily_scan_limit: number
          monthly_scan_limit: number
          export_allowed: boolean
          detailed_report_allowed: boolean
          api_access_allowed: boolean
        }
      }
      user_scan_summary: {
        Row: {
          user_id: number
          username: string
          email: string
          role_name: string
          total_scans: number
          completed_scans: number
          failed_scans: number
          pending_scans: number
          last_scan_date: string | null
          avg_scan_duration: number | null
        }
      }
      daily_usage_stats: {
        Row: {
          user_id: number
          username: string
          plan_name: string
          daily_scan_limit: number
          scans_used_today: number
          remaining_scans: number
          limit_reached: boolean
        }
      }
    }
  }
}

// Convenience types
export type User = Database['public']['Tables']['User']['Row']
export type Scan = Database['public']['Tables']['Scan']['Row']
export type Subscription = Database['public']['Tables']['Subscription']['Row']
export type Plan = Database['public']['Tables']['Plan']['Row']
export type Role = Database['public']['Tables']['Role']['Row']
export type DetailedReport = Database['public']['Tables']['DetailedReport']['Row']
export type ThreatSummary = Database['public']['Tables']['ThreatSummary']['Row']
export type ScoreReport = Database['public']['Tables']['ScoreReport']['Row']
export type History = Database['public']['Tables']['History']['Row']
export type Review = Database['public']['Tables']['Review']['Row']
export type UsageCounter = Database['public']['Tables']['UsageCounter']['Row']

// View types
export type ActiveSubscription = Database['public']['Views']['active_subscriptions']['Row']
export type UserScanSummary = Database['public']['Views']['user_scan_summary']['Row']
export type DailyUsageStats = Database['public']['Views']['daily_usage_stats']['Row']

// Extended user type with related data
export interface UserProfile extends User {
  role: Role
  subscription?: Subscription
  plan?: Plan
  usage_stats?: DailyUsageStats
}

// Scan with related data
export interface ScanWithDetails extends Scan {
  detailed_report?: DetailedReport
  threat_summaries?: ThreatSummary[]
  score_report?: ScoreReport
}

// Auth types
export interface AuthUser {
  id: string
  email: string
  user_metadata: {
    first_name?: string
    last_name?: string
    username?: string
  }
}

// API response types
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}
