export type UsageAnalytics = {
  total_logins: number;
  daily_active_users: number;
  total_activities_completed: number;
  avg_session_duration: number;
  peak_usage_hours: PeakUsageHour[];
};

export type PeakUsageHour = {
  hour: number;
  count: number;
};

export type StudentPerformance = {
  student__username: string;
  student__first_name: string;
  student__last_name: string;
  avg_progress: number;
  total_score: number;
};

export type SubjectPerformance = {
  name: string;
  grade: number;
  avg_progress: number | null;
  total_students: number;
};

export type PerformanceAnalytics = {
  overall_success_rate: number;
  avg_completion_rate: number;
  top_performing_students: StudentPerformance[];
  struggling_students: StudentPerformance[];
  subject_performance: SubjectPerformance[];
};

export type RoleDistribution = {
  role: "admin" | "teacher" | "student";
  count: number;
};

export type UserGrowth = {
  current_month: number;
  last_month: number;
  growth_rate: number;
};

export type UserAnalytics = {
  total_users: number;
  role_distribution: RoleDistribution[];
  new_users_last_30_days: number;
  active_users_rate: number;
  user_growth: UserGrowth;
};

export type UnitDifficultyStat = {
  difficulty: "easy" | "medium" | "hard";
  count: number;
};

export type MostAccessedUnit = {
  id: number;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  access_count: number;
};

export type ContentCreationTrend = {
  year: number;
  month: number;
  count: number;
};

export type ContentAnalytics = {
  total_units: number;
  published_units: number;
  units_by_difficulty: UnitDifficultyStat[];
  most_accessed_units: MostAccessedUnit[];
  content_creation_trend: ContentCreationTrend[];
};

export type AdminAnalyticsType = {
  usage_analytics: UsageAnalytics;
  performance_analytics: PerformanceAnalytics;
  user_analytics: UserAnalytics;
  content_analytics: ContentAnalytics;
  generated_at: string; // ISO datetime
};



// -------------


export type UsageTrendItem = {
  date: string; // YYYY-MM-DD
  attempts: number;
  unique_users: number;
};

export type UsageAnalyticsWithTrend = {
  total_logins: number;
  daily_active_users: number;
  total_activities_completed: number;
  avg_session_duration: number;
  peak_usage_hours: PeakUsageHour[];
  usage_trend: UsageTrendItem[];
};