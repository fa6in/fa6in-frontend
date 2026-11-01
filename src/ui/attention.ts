import type { AttentionItem } from "../Services/Fatin/types";

/** Lien vers l'étape de l'éditeur de contenu qui corrige le problème. */
export function attentionLink(item: AttentionItem) {
  if (item.kind === "lesson_missing_goal") return `/content?unit=${item.unit_id}&lesson=${item.lesson_id}&step=2`;
  if (item.kind === "skill_incomplete_chunks") return `/content?unit=${item.unit_id}&lesson=${item.lesson_id}&step=5`;
  return `/content?unit=${item.unit_id}&step=1`;
}

export function attentionLabel(item: AttentionItem) {
  if (item.kind === "lesson_missing_goal") {
    return { title: `الدرس ${item.code}`, detail: `ينقصه هدف ${item.missing === "conceptual" ? "مفاهيمي" : "عمليّاتي"}` };
  }
  if (item.kind === "skill_incomplete_chunks") {
    const missing: string[] = [];
    if (item.rule < 1) missing.push("قاعدة");
    if (item.example < 1) missing.push("مثال");
    if (item.practice < 2) missing.push(`${2 - item.practice} تمرين`);
    return { title: `المهارة ${item.code}`, detail: `قطع ناقصة: ${missing.join("، ") || "—"}` };
  }
  return { title: `الوحدة ${item.code}`, detail: "غير منشورة بعد" };
}
