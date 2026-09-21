export type SkillType = "conceptual" | "operational";

export type Skill = {
  id?: number;
  code: string;
  name: string;
  goal: number;
  skill_type: SkillType;
  difficulty: number;
  description: string;
  order_index: number;
};

export type Prerequisite = {
  id?: number;
  skill: number;
  prerequisite: number;
  strength: number;
};

export type ChunkType =
  | "rule"
  | "example"
  | "practice"
  | "error"
  | "hint"
  | "real_life";

type BaseChunk = {
  id?: number;
  code: string;
  title: string;
  skill: number;
  difficulty: number;
  content: string;
  order_index?: number;
  points: number;
};

// rule, example, error, hint, real_life => structure de base
type SimpleChunk = BaseChunk & {
  chunk_type: "rule" | "example" | "error" | "hint" | "real_life";
};

// practice => structure de base + champs spécifiques
type PracticeChunk = BaseChunk & {
  chunk_type: "practice";
  correct_answer: string;
  options: string[]; // [] pour réponse libre, rempli pour QCM
  time_limit: number;
};

export type Chunk = SimpleChunk | PracticeChunk;