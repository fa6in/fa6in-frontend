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

export type ChunkType = "rule" | "example";

export type Chunk = {
  id?: number;
  code: string;
  title: string;
  skill: number;
  chunk_type: ChunkType;
  difficulty: number;
  content: string;
  order_index?: number;
};
