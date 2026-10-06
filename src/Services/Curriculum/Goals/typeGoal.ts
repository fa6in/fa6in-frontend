import type { ContentUnit } from "../../Admin/Content/typeContent";

export type GoalType = "conceptual" | "operational";

export type GoalLesson = {
  id: number;
  code?: string;
  title?: string;
  unit?: ContentUnit;
  order_index?: number;
  is_published?: boolean;
  goals_complete?: boolean;
};

export type Goal = {
  id?: number;
  lesson: number | GoalLesson;
  goal_type: GoalType;
  /** Code de la leçon liée (lesson.code). */
  code?: string;
  title: string;
  description: string;
  order_index: number;
  created_at?: string;
};
