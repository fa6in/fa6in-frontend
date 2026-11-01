/**
 * Centralized API endpoints — synced with Postman collection "Ed-Tech"
 * Base URL: VITE_API_URL (see .env)
 */
export const API_ENDPOINTS = {
  auth: {
    wilayas: "api/auth/wilayas/",
    register: "api/auth/register/",
    login: "api/auth/login/",
    users: "api/auth/users/",
    profile: "api/auth/profile/",
    me: "api/auth/me/",
    refreshToken: "api/token/refresh/",
    forgotPassword: "api/auth/forgot-password/",
    resetPassword: "api/auth/reset-password/",
    adminRegister: "api/auth/admin/register/",
    adminStudents: "api/auth/admin/students/",
    adminTeachers: "api/auth/admin/teachers/",
    adminStudentDetail: (id: number | string) => `api/auth/admin/students/${id}/`,
    adminTeacherDetail: (id: number | string) => `api/auth/admin/teachers/${id}/`,
    wilayaDetail: (id: number | string) => `api/auth/wilayas/${id}/`,
    changePassword: (userId: number | string) =>
      `api/auth/users/${userId}/change_password/`,
  },
  curriculum: {
    subjects: "api/curriculum/subjects/",
    subjectDetail: (id: number | string) => `api/curriculum/subjects/${id}/`,
    transcrire: "api/curriculum/transcrire/",
    units: "api/curriculum/units/",
    unitDetail: (id: number | string) => `api/curriculum/units/${id}/`,
    unitPublish: (id: number | string) => `api/curriculum/units/${id}/publish/`,
    goals: "api/curriculum/goals/",
    stages: "api/curriculum/stages/",
    stageDetail: (id: number | string) => `api/curriculum/stages/${id}/`,
    levels: "api/curriculum/levels/",
    levelDetail: (id: number | string) => `api/curriculum/levels/${id}/`,
    lessons: "api/curriculum/lessons/",
    lessonDetail: (id: number | string) => `api/curriculum/lessons/${id}/`,
    lessonPublish: (id: number | string) =>
      `api/curriculum/lessons/${id}/publish/`,
  },
  assessment: {
    errors: "api/assessment/errors/",
    logAnswers: "api/assessment/log-answers/",
    progress: "api/assessment/progress/",
  },
  analytics: {
    classDashboard: "api/analytics/class-dashboard/",
    studentErrorAnalysis: (studentId: number | string) =>
      `api/analytics/students/${studentId}/error-analysis/`,
  },
  skills: {
    skills: "api/skills/skills/",
    prerequisites: "api/skills/prerequisites/",
    chunks: "api/skills/chunks/",
  },
  // Parcours de l'élève et Decision Engine (écrans S1 → S8 du design)
  student: {
    home: (id: number | string) => `api/students/${id}/home/`,
    path: (id: number | string) => `api/students/${id}/path/`,
    skillMap: (id: number | string) => `api/students/${id}/skill-map/`,
    progressSummary: (id: number | string) => `api/students/${id}/progress-summary/`,
    nextAction: (id: number | string) => `api/students/${id}/next-action/`,
    answer: (id: number | string) => `api/students/${id}/answer/`,
  },
  // Éditeur de contenu enseignant (T2 → T9)
  content: {
    unitDetail: (id: number | string) => `api/curriculum/units/${id}/`,
    unitPublish: (id: number | string) => `api/curriculum/units/${id}/publish/`,
    lessonDetail: (id: number | string) => `api/curriculum/lessons/${id}/`,
    lessonCheck: (id: number | string) => `api/curriculum/lessons/${id}/publication_check/`,
    lessonPublish: (id: number | string) => `api/curriculum/lessons/${id}/publish/`,
    goalDetail: (id: number | string) => `api/curriculum/goals/${id}/`,
    skillDetail: (id: number | string) => `api/skills/skills/${id}/`,
    prerequisiteCandidates: (id: number | string) => `api/skills/skills/${id}/prerequisite_candidates/`,
    prerequisiteDetail: (id: number | string) => `api/skills/prerequisites/${id}/`,
    chunkDetail: (id: number | string) => `api/skills/chunks/${id}/`,
  },
  dashboards: {
    teacherOverview: "api/analytics/teacher-dashboard/overview/",
    teacherStudents: "api/analytics/teacher-dashboard/students-progress/",
    teacherUnits: "api/analytics/teacher-dashboard/units-performance/",
    studentSummary: (id: number | string) => `api/analytics/students/${id}/summary/`,
    studentErrors: (id: number | string) => `api/analytics/students/${id}/error-analysis/`,
    reports: "api/analytics/reports/",
    reportsUsage: "api/analytics/reports/usage/",
    reportsAttention: "api/analytics/reports/attention/",
    reportsByWilaya: "api/analytics/reports/by-wilaya/",
    users: "api/auth/users/",
    userDetail: (id: number | string) => `api/auth/users/${id}/`,
    verifyResetCode: "api/auth/verify-reset-code/",
  },
} as const;
