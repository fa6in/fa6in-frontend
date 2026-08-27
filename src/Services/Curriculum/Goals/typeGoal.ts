export type GoalType = "conceptual" | "operational";

export type Goal = {
  id?: number;
  lesson: number;
  goal_type: GoalType;
  code: string;
  title: string;
  description: string;
  order_index: number;
};
