import axios from "axios";

const KNOWN: [RegExp, string][] = [
  [/too common/i, "كلمة المرور شائعة جداً."],
  [/entirely numeric/i, "كلمة المرور لا يجب أن تكون أرقاماً فقط."],
  [/too short|at least/i, "كلمة المرور قصيرة جداً."],
  [/similar/i, "كلمة المرور قريبة من اسم المستخدم أو البريد."],
  [/already exists|existe déjà|must be unique/i, "هذا الرمز أو الاسم مستخدم من قبل."],
  [/cycle/i, "هذا المتطلب يُنشئ دورة في المتطلبات."],
  [/Goal de type/i, "هذا الدرس يحتوي بالفعل على هدف من هذا النوع."],
];

function collect(data: unknown): string[] {
  if (typeof data === "string") return [data];
  if (Array.isArray(data)) return data.flatMap(collect);
  if (data && typeof data === "object") return Object.values(data).flatMap(collect);
  return [];
}

/** Message lisible (en arabe quand il est connu) à partir d'une erreur DRF. */
export function apiErrorText(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) return "تعذر الاتصال بالخادم.";
    const data = error.response.data as { detail?: string } | undefined;
    const lines = data?.detail ? [data.detail] : collect(data);
    if (lines.length) {
      return lines
        .map((line) => KNOWN.find(([pattern]) => pattern.test(line))?.[1] ?? line)
        .filter((line, index, all) => all.indexOf(line) === index)
        .join(" ");
    }
    return `خطأ ${error.response.status}`;
  }
  return "حدث خطأ غير متوقع.";
}
