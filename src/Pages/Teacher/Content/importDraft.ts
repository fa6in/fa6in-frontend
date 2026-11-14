// Lecture d'un dossier type "M1AF" (manuel scolaire numérisé : un .json +
// un sous-dossier images/) en brouillon local (en mémoire, aucun appel
// réseau) avant révision par l'enseignant. Le champ `image` de chaque
// chunk référence un chemin relatif (ex. "images/M1AF-u1-l1-s1-c1.jpg") ;
// ce chemin est résolu contre les fichiers du même dossier choisi par
// l'enseignant (voir `resolveImage` dans ImportUnitPage.tsx).

import type { ChunkType } from "../../../Services/Fatin/types";

const CHUNK_TYPE_VALUES: ChunkType[] = ["rule", "example", "practice", "error", "hint", "real_life"];

function asChunkType(value: unknown): ChunkType {
  return CHUNK_TYPE_VALUES.includes(value as ChunkType) ? (value as ChunkType) : "rule";
}

export type DraftChunk = {
  key: string;
  chunk_type: ChunkType;
  title: string;
  content: string;
  correct_answer: string;
  options: string;
  difficulty: number;
  points: number;
  time_limit: number;
  needs_image: boolean;
  image_note: string;
  image_path: string | null;
};

export type DraftSkill = {
  key: string;
  name: string;
  description: string;
  difficulty: number;
  chunks: DraftChunk[];
};

export type DraftGoal = {
  key: string;
  goal_type: "conceptual" | "operational";
  title: string;
  description: string;
  skills: DraftSkill[];
};

export type DraftLesson = {
  key: string;
  title: string;
  description: string;
  programme_ref: string;
  week: number | null;
  programme_weeks: number[];
  book_exercises: string[];
  goals: DraftGoal[];
};

export type DraftUnit = {
  key: string;
  title: string;
  description: string;
  central_question: string;
  main_goal_description: string;
  main_skill_domain: string;
  term: string;
  competency_ref: string;
  lessons: DraftLesson[];
};

export type ImportDraft = {
  units: DraftUnit[];
  stats: { lessons: number; goals: number; skills: number; chunks: number; images_expected: number };
};

let seq = 0;
const nextKey = () => `draft-${++seq}`;

function asText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asNumberArray(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is number => typeof item === "number");
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function asOptionsText(options: unknown): string {
  if (!Array.isArray(options)) return "";
  return options
    .map((item) => (typeof item === "string" ? item : typeof item === "object" && item && "text" in item ? String((item as { text: unknown }).text ?? "") : ""))
    .filter(Boolean)
    .join(" ، ");
}

function correctAnswerOf(chunk: Record<string, unknown>): string {
  if (typeof chunk.correct_answer === "string") return chunk.correct_answer;
  const options = chunk.options;
  if (Array.isArray(options)) {
    const correct = options.find((item) => typeof item === "object" && item && (item as { is_correct?: boolean }).is_correct);
    if (correct && typeof correct === "object") return asText((correct as { text?: unknown }).text);
  }
  return "";
}

function parseChunk(raw: unknown): DraftChunk | null {
  if (typeof raw !== "object" || !raw) return null;
  const chunk = raw as Record<string, unknown>;
  return {
    key: nextKey(),
    chunk_type: asChunkType(chunk.chunk_type),
    title: asText(chunk.title),
    content: asText(chunk.content),
    correct_answer: correctAnswerOf(chunk),
    options: asOptionsText(chunk.options),
    difficulty: typeof chunk.difficulty === "number" ? chunk.difficulty : 2,
    points: typeof chunk.points === "number" ? chunk.points : 1,
    time_limit: typeof chunk.time_limit === "number" ? chunk.time_limit : 60,
    needs_image: Boolean(chunk.needs_image),
    image_note: asText(chunk.image_note),
    image_path: typeof chunk.image === "string" ? chunk.image : null,
  };
}

function parseSkill(raw: unknown): DraftSkill | null {
  if (typeof raw !== "object" || !raw) return null;
  const skill = raw as Record<string, unknown>;
  const chunks = Array.isArray(skill.chunks) ? skill.chunks.map(parseChunk).filter((c): c is DraftChunk => !!c) : [];
  return {
    key: nextKey(),
    name: asText(skill.name),
    description: asText(skill.description),
    difficulty: typeof skill.difficulty === "number" ? skill.difficulty : 2,
    chunks,
  };
}

function parseGoal(raw: unknown): DraftGoal | null {
  if (typeof raw !== "object" || !raw) return null;
  const goal = raw as Record<string, unknown>;
  const goalType = goal.goal_type === "operational" ? "operational" : "conceptual";
  const skills = Array.isArray(goal.skills) ? goal.skills.map(parseSkill).filter((s): s is DraftSkill => !!s) : [];
  return {
    key: nextKey(),
    goal_type: goalType,
    title: asText(goal.title),
    description: asText(goal.description),
    skills,
  };
}

function parseLesson(raw: unknown): DraftLesson | null {
  if (typeof raw !== "object" || !raw) return null;
  const lesson = raw as Record<string, unknown>;
  const goals = Array.isArray(lesson.goals) ? lesson.goals.map(parseGoal).filter((g): g is DraftGoal => !!g) : [];
  return {
    key: nextKey(),
    title: asText(lesson.title),
    description: asText(lesson.description),
    programme_ref: asText(lesson.programme_ref),
    week: typeof lesson.week === "number" ? lesson.week : null,
    programme_weeks: asNumberArray(lesson.programme_weeks),
    book_exercises: asStringArray(lesson.book_exercises),
    goals,
  };
}

function parseUnit(raw: unknown): DraftUnit | null {
  if (typeof raw !== "object" || !raw) return null;
  const unit = raw as Record<string, unknown>;
  // Rejette les objets qui ne ressemblent pas à une unité (ex: entrées de
  // "images.json" — {ref, file, page, note} — sans titre ni leçons),
  // pour éviter de les confondre avec de vraies unités vides.
  if (!asText(unit.title).trim() || !("lessons" in unit)) return null;
  const lessons = Array.isArray(unit.lessons) ? unit.lessons.map(parseLesson).filter((l): l is DraftLesson => !!l) : [];
  return {
    key: nextKey(),
    title: asText(unit.title),
    description: asText(unit.description),
    central_question: asText(unit.central_question),
    main_goal_description: asText(unit.main_goal_description),
    main_skill_domain: asText(unit.main_skill_domain),
    term: asText(unit.term),
    competency_ref: asText(unit.competency_ref),
    lessons,
  };
}

export function parseImportFile(json: unknown): ImportDraft {
  const root = (typeof json === "object" && json && "draft" in (json as object) ? (json as { draft: unknown }).draft : json) as
    | Record<string, unknown>
    | undefined;
  const rawUnits = Array.isArray(root?.units) ? root.units : Array.isArray(json) ? json : [];
  const units = rawUnits.map(parseUnit).filter((u): u is DraftUnit => !!u);

  let lessons = 0;
  let goals = 0;
  let skills = 0;
  let chunks = 0;
  let images_expected = 0;
  units.forEach((unit) => {
    lessons += unit.lessons.length;
    unit.lessons.forEach((lesson) => {
      goals += lesson.goals.length;
      lesson.goals.forEach((goal) => {
        skills += goal.skills.length;
        goal.skills.forEach((skill) => {
          chunks += skill.chunks.length;
          skill.chunks.forEach((chunk) => {
            if (chunk.image_path) images_expected += 1;
          });
        });
      });
    });
  });

  return { units, stats: { lessons, goals, skills, chunks, images_expected } };
}
