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
} as const;
