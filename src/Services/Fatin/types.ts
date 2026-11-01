// Types des réponses backend utilisées par les écrans du design FATIN.

export type Ref = { id: number; code: string; name: string };

// ==================== Élève (S1 → S8) ====================

export type SkillStatus = "mastered" | "in_progress" | "available" | "locked";
export type UnitStatus = "done" | "in_progress" | "available" | "locked";
export type LessonStatus = "done" | "current" | "locked";
export type ErrorCategory = "concept" | "procedure" | "careless";
export type ChunkType = "rule" | "example" | "practice" | "error" | "hint" | "real_life";

export type StudentHome = {
  resume: null | {
    subject: { id: number; name: string };
    skill: Ref;
    unit: { id: number; code: string };
    lesson: { id: number; code: string; title: string };
    mastery: number;
    mastery_threshold: number;
  };
  suggestion: null | { skill: Ref; reason: string };
  stats: { mastered_skills: number; streak_days: number; attempts_today: number };
  subjects: {
    id: number;
    name: string;
    color: string;
    icon: string;
    skills_total: number;
    skills_mastered: number;
  }[];
};

export type PathLesson = {
  id: number;
  code: string;
  title: string;
  status: LessonStatus;
  skills_total: number;
  skills_mastered: number;
};

export type PathUnit = {
  id: number;
  code: string;
  title: string;
  central_question: string | null;
  thumbnail: string | null;
  status: UnitStatus;
  skills_total: number;
  skills_mastered: number;
  progress: number;
  locked_by_unit: { id: number; code: string } | null;
  lessons: PathLesson[];
};

export type StudentPath = {
  subject: null | { id: number; name: string; color: string; icon: string; level_name: string };
  units: PathUnit[];
  subjects: { id: number; name: string; color: string }[];
};

export type MapSkill = {
  id: number;
  code: string;
  name: string;
  skill_type: "conceptual" | "operational";
  status: SkillStatus;
  mastery: number;
  attempts: number;
  mastery_threshold: number;
  locked_by: Ref[];
};

export type SkillMap = {
  subject: { id: number; name: string };
  unit: { id: number; code: string; title: string; status: UnitStatus; skills_total: number; skills_mastered: number };
  lessons: { id: number; code: string; title: string; status: LessonStatus; skills: MapSkill[] }[];
};

export type ProgressSummary = {
  skills_total: number;
  skills_mastered: number;
  skills_in_progress: number;
  skills_not_started: number;
  completion: number;
  weekly_activity: { date: string; attempts: number; correct: number }[];
  errors_by_category: Record<ErrorCategory, number>;
  streak_days: number;
};

export type SessionChunk = {
  id: number;
  code: string;
  chunk_type: ChunkType;
  title: string | null;
  content: string;
  options: string[] | null;
  difficulty: number;
  points: number;
  time_limit: number | null;
};

export type SessionContext = {
  skill: {
    id: number;
    code: string;
    name: string;
    skill_type: string;
    mastery_threshold: number;
    required_consecutive_correct: number;
  };
  breadcrumb: {
    subject_id: number;
    subject_name: string;
    unit_id: number;
    unit_code: string;
    lesson_id: number;
    lesson_code: string;
    lesson_title: string;
  };
  progress: {
    attempts: number;
    correct_count: number;
    mastery: number;
    consecutive_correct: number;
    status: "not_started" | "in_progress" | "mastered";
    rule_seen: boolean;
    example_seen: boolean;
  };
  chunk_counts: Partial<Record<ChunkType, number>>;
  hint: string | null;
};

export type NextAction =
  | { action: "show_chunk"; chunk: SessionChunk | null; session: SessionContext; context: { reason: string } }
  | {
      action: "redirect_to_prerequisite";
      chunk: SessionChunk | null;
      session: SessionContext;
      new_skill: Ref & { current_mastery: number };
      previous_skill: { id: number; code: string; mastery: number; attempts: number };
      message: string;
    };

export type SubmitResult = {
  is_correct: boolean;
  error_type: ErrorCategory | null;
  feedback: null | { category: ErrorCategory; message: string | null; example: string | null; rule: string | null };
  progress: SessionContext["progress"];
  mastered_now: boolean;
  points: number | null;
  next_skill: (Ref & { unit_id: number }) | null;
  redirect: null | { skill: Ref; attempts: number; mastery: number };
  session: SessionContext;
};

// ==================== Enseignant (T1 → T11) ====================

export type TeacherOverview = {
  total_students: number;
  active_students_7d: number;
  average_mastery: number;
  mastered_skills_total: number;
  attempts_7d: number;
};

export type AttentionReason = "concept_errors" | "redirects" | "inactive" | "low_mastery";

export type StudentRow = {
  student_id: number;
  username: string;
  first_name: string;
  last_name: string;
  skills_started: number;
  skills_mastered: number;
  average_mastery: number;
  last_active: string | null;
  wilaya_name: string | null;
  inactive_days: number | null;
  concept_errors_14d: number;
  blocked_skills: number;
  needs_attention: boolean;
  attention_reason: AttentionReason | null;
};

export type UnitPerformance = {
  unit_id: number;
  unit_code: string;
  unit_title: string;
  skills_count: number;
  average_mastery: number;
  students_mastered: number;
  attempts_count: number;
};

export type StudentSummary = {
  student_id: number;
  username: string;
  first_name: string;
  last_name: string;
  wilaya_name: string | null;
  average_mastery: number;
  skills_started: number;
  skills_mastered: number;
  attempts: number;
  correct_attempts: number;
  careless_ratio: number;
  errors_by_category: Record<ErrorCategory, number>;
  last_active: string | null;
};

export type StudentErrorRow = {
  skill_name: string;
  error_category: ErrorCategory;
  error_code: string | null;
  root_cause: string | null;
  severity_level: "low" | "medium" | "high" | null;
  occurrences: number;
};

// Contenu (éditeur T2 → T9)
export type CUnit = {
  id: number;
  code: string;
  title: string;
  subject: { id: number; name: string } | number;
  subject_name: string;
  order_index: number;
  is_published: boolean;
  thumbnail: string | null;
  lessons_count: number;
  central_question?: string | null;
  main_goal_description?: string | null;
};

export type CLesson = {
  id: number;
  code: string;
  title: string;
  description?: string | null;
  order_index: number;
  is_published: boolean;
  goals_complete: boolean;
};

export type CGoal = {
  id: number;
  goal_type: "conceptual" | "operational";
  title: string;
  description: string | null;
  order_index: number;
};

export type CSkill = {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  skill_type: "conceptual" | "operational";
  goal: { id: number; goal_type: string } | number;
  difficulty: number;
  order_index: number;
  chunks_ready: boolean;
  mastery_threshold?: number;
  required_consecutive_correct?: number;
};

export type CChunk = {
  id: number;
  code: string;
  chunk_type: ChunkType;
  title: string | null;
  content: string;
  correct_answer?: string | null;
  options: string[] | null;
  difficulty: number;
  order_index: number;
  points: number;
  time_limit: number | null;
  skill: { id: number; code: string } | number;
};

export type CPrerequisite = {
  id: number;
  skill: Ref;
  prerequisite: Ref;
};

export type PrereqCandidate = Ref & { skill_type: string; lesson_code: string; state: "available" | "linked" | "cycle" };

export type PublicationCheck = {
  ready: boolean;
  checks: {
    key: "goals" | "skill_types" | "no_cycles" | "chunks";
    ok: boolean;
    detail: {
      missing?: string[];
      goals_without_skill?: string[];
      mismatched_skills?: string[];
      incomplete_skills?: { skill: string; rule: number; example: number; practice: number }[];
    };
  }[];
};

// ==================== Admin (A1 → A7) ====================

export type ReportsOverview = {
  total_users: number;
  total_students: number;
  total_teachers: number;
  total_units: number;
  published_units: number;
  total_skills: number;
  total_attempts: number;
  correct_attempts: number;
  mastered_skills_count: number;
  overall_average_mastery: number;
  incomplete_skills: number;
};

export type ReportsUsage = {
  period_days: number;
  new_registrations: number;
  active_students: number;
  active_users_by_login: number;
  total_attempts: number;
  correct_attempts: number;
  average_attempts_per_active_student: number;
  daily: { date: string; attempts: number; correct: number }[];
};

export type AttentionItem =
  | { kind: "lesson_missing_goal"; code: string; missing: "conceptual" | "operational"; unit_id: number; lesson_id: number }
  | { kind: "skill_incomplete_chunks"; code: string; practice: number; rule: number; example: number; unit_id: number; lesson_id: number }
  | { kind: "unit_unpublished"; code: string; unit_id: number };

export type WilayaMastery = {
  wilaya_id: number;
  wilaya_name: string;
  students: number;
  average_mastery: number | null;
};

export type UserRole = "student" | "teacher" | "regional_admin" | "admin";

export type AppUser = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  wilaya: number | null;
  wilaya_name: string | null;
  phone_number: string;
  school: string;
  is_active: boolean;
};

export type Page<T> = { count: number; next: string | null; previous: string | null; results: T[] };
