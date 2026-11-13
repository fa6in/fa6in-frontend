import { useEffect, useRef, useState } from "react";
import { message } from "antd";
import api from "../../../Auth-service/axios";
import { API_ENDPOINTS } from "../../../api/endpoints";
import { apiErrorText } from "../../../Services/Fatin/apiErrorText";
import { useGetMatiere } from "../../../Services/Admin/Matieres/useGetMatiere";
import { useContentUnits } from "../../../Services/Fatin/useTeacherContent";
import type { CUnit } from "../../../Services/Fatin/types";
import { useFatinChrome } from "../../../ui/FatinChrome";
import { Loading } from "../../Student/fatinStudentUi";
import { CHUNK_TYPES, GOAL_LABEL, chunkTypeLabel, nextCode } from "./contentUi";
import { parseImportFile, type DraftChunk, type DraftGoal, type DraftLesson, type DraftSkill, type DraftUnit, type ImportDraft } from "./importDraft";

type Props = { onClose: () => void; onDone: () => void };

const subjectIdOf = (unit: CUnit) => (typeof unit.subject === "number" ? unit.subject : unit.subject.id);

type ExistingLesson = { id: number; code: string; title: string };

type Selected = { level: "unit"; unitKey: string } | { level: "lesson"; unitKey: string; lessonKey: string };

type SaveReport = { unitTitle: string; lessonTitle: string; ok: boolean; error?: string }[];

/**
 * Import "livre" : arborescence unité → leçon sur la droite, chacune avec
 * une case à cocher, et zone de lecture large à gauche affichant tout le
 * contenu de la leçon (objectifs + compétences + chunks) d'un coup — sans
 * passer par les 7 étapes du wizard manuel. Seuls les éléments cochés sont
 * envoyés au clic sur "حفظ المحدد", un par un, dans le même ordre
 * hiérarchique que la création manuelle.
 */
export default function ImportUnitPage({ onClose, onDone }: Props) {
  const { data: existingUnits = [], isLoading: loadingUnits } = useContentUnits();
  const { data: subjects = [] } = useGetMatiere();
  const fileInput = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<ImportDraft | null>(null);
  const [subject, setSubject] = useState("");
  const [selected, setSelected] = useState<Selected | null>(null);
  const [checkedLessons, setCheckedLessons] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState("");
  const [savedCount, setSavedCount] = useState(0);
  const [saveTotal, setSaveTotal] = useState(0);
  const [error, setError] = useState("");
  const [report, setReport] = useState<SaveReport | null>(null);
  const [lessonsByUnit, setLessonsByUnit] = useState<Record<number, ExistingLesson[]>>({});
  const [imagesByPath, setImagesByPath] = useState<Map<string, File>>(new Map());

  useFatinChrome({ subtitle: "استيراد وحدة من مجلد" });

  const matchUnit = (title: string, subjectId: number) =>
    existingUnits.find((item) => subjectIdOf(item) === subjectId && item.title.trim() === title.trim()) ?? null;

  // Toutes les leçons existantes des unités candidates, chargées dès que
  // la matière est choisie — sert à détecter doublons unité/leçon.
  const loadLessonsFor = async (subjectId: number, units: DraftUnit[]) => {
    const matches = units.map((item) => matchUnit(item.title, subjectId)).filter((item): item is CUnit => !!item);
    const entries = await Promise.all(
      matches.map(async (item) => {
        if (lessonsByUnit[item.id]) return [item.id, lessonsByUnit[item.id]] as const;
        const { data } = await api.get(API_ENDPOINTS.curriculum.lessons, { params: { unit: item.id, page_size: 500 } });
        const list: ExistingLesson[] = Array.isArray(data) ? data : data.results ?? [];
        return [item.id, list.map((l) => ({ id: l.id, code: l.code, title: l.title }))] as const;
      }),
    );
    setLessonsByUnit((prev) => ({ ...prev, ...Object.fromEntries(entries) }));
  };

  const onSubjectChange = (value: string) => {
    setSubject(value);
    if (draft && value) loadLessonsFor(Number(value), draft.units);
  };

  const handleFolder = async (files: FileList) => {
    setError("");
    try {
      const list = Array.from(files);
      // Le dossier peut contenir plusieurs .json (ex: "M1AF.json" avec les
      // unités, et "images.json" qui n'est qu'une liste de métadonnées
      // d'images). On essaie chaque fichier .json et on garde le premier
      // dont la structure contient effectivement des unités valides.
      const jsonFiles = list.filter((file) => file.name.toLowerCase().endsWith(".json"));
      if (!jsonFiles.length) {
        setError("لم يُعثر على ملف JSON داخل المجلد المختار.");
        return;
      }
      let parsed: ImportDraft | null = null;
      for (const file of jsonFiles) {
        try {
          const text = await file.text();
          const candidate = parseImportFile(JSON.parse(text));
          if (candidate.units.length) {
            parsed = candidate;
            break;
          }
        } catch {
          // Fichier JSON invalide ou de structure différente : on l'ignore et on essaie le suivant.
        }
      }
      if (!parsed) {
        setError("لم يُعثر على وحدات صالحة في ملفات JSON الموجودة بالمجلد.");
        return;
      }

      const images = new Map<string, File>();
      list.forEach((file) => {
        const relPath = (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name;
        const withoutRoot = relPath.split("/").slice(1).join("/");
        if (withoutRoot) images.set(withoutRoot, file);
      });

      // Tout est coché par défaut : l'enseignant décoche ce qu'il ne veut pas importer.
      const allLessonKeys = new Set<string>();
      parsed.units.forEach((unit) => unit.lessons.forEach((lesson) => allLessonKeys.add(lesson.key)));

      setDraft(parsed);
      setImagesByPath(images);
      setCheckedLessons(allLessonKeys);
      setSelected(parsed.units[0] ? { level: "unit", unitKey: parsed.units[0].key } : null);
      setReport(null);
    } catch {
      setError("تعذرت قراءة المجلد. تأكد أنه يحتوي ملف JSON صالحًا بنفس بنية الكتاب المرقمن.");
    }
  };

  const toggleUnit = (unit: DraftUnit, checked: boolean) => {
    setCheckedLessons((prev) => {
      const next = new Set(prev);
      unit.lessons.forEach((lesson) => (checked ? next.add(lesson.key) : next.delete(lesson.key)));
      return next;
    });
  };

  const toggleLesson = (lessonKey: string, checked: boolean) => {
    setCheckedLessons((prev) => {
      const next = new Set(prev);
      if (checked) next.add(lessonKey);
      else next.delete(lessonKey);
      return next;
    });
  };

  const unitCheckState = (unit: DraftUnit): "all" | "none" | "partial" => {
    const total = unit.lessons.length;
    const checked = unit.lessons.filter((l) => checkedLessons.has(l.key)).length;
    if (checked === 0) return "none";
    if (checked === total) return "all";
    return "partial";
  };

  const totalChecked = draft ? draft.units.reduce((n, u) => n + u.lessons.filter((l) => checkedLessons.has(l.key)).length, 0) : 0;

  const saveSelected = async () => {
    if (!draft || !subject) return;
    setSaving(true);
    setReport(null);
    setSavedCount(0);
    setSaveTotal(totalChecked);
    const results: SaveReport = [];
    try {
      const usedUnitCodes = existingUnits.map((item) => item.code);
      for (const unit of draft.units) {
        const lessonsToSave = unit.lessons.filter((lesson) => checkedLessons.has(lesson.key));
        if (!lessonsToSave.length) continue;

        const existing = matchUnit(unit.title, Number(subject));
        const existingLessons = existing ? lessonsByUnit[existing.id] ?? [] : [];

        try {
          const { unitId, code, startIndex } = await ensureUnit(unit, Number(subject), usedUnitCodes, existing);
          if (!existing) usedUnitCodes.push(code);

          let lessonOrder = startIndex;
          const lessonCodes = existingLessons.map((item) => item.code);
          for (const lesson of lessonsToSave) {
            setProgress(`جارٍ حفظ: ${unit.title} ← ${lesson.title}`);
            lessonOrder += 1;
            try {
              await saveLesson(lesson, unitId, code, lessonOrder, existingLessons, lessonCodes, imagesByPath, setProgress);
              results.push({ unitTitle: unit.title, lessonTitle: lesson.title, ok: true });
            } catch (err) {
              results.push({ unitTitle: unit.title, lessonTitle: lesson.title, ok: false, error: apiErrorText(err) });
            } finally {
              setSavedCount((count) => count + 1);
            }
          }
        } catch (err) {
          lessonsToSave.forEach((lesson) => {
            results.push({ unitTitle: unit.title, lessonTitle: lesson.title, ok: false, error: apiErrorText(err) });
            setSavedCount((count) => count + 1);
          });
        }
      }
      setReport(results);
      const failed = results.filter((r) => !r.ok).length;
      if (failed === 0) message.success(`تم استيراد ${results.length} درسًا بنجاح كمسودة.`);
      else message.error(`تم استيراد ${results.length - failed} درسًا، وفشل ${failed}. راجع التفاصيل أسفل الصفحة.`);
      if (failed === 0) onDone();
    } catch (err) {
      setError(apiErrorText(err));
    } finally {
      setSaving(false);
      setProgress("");
    }
  };

  if (loadingUnits) return <Loading />;

  if (!draft) {
    return (
      <div className="px-3 pb-8 sm:px-4 md:px-7" dir="rtl">
        <div className="mb-3">
          <button type="button" onClick={onClose} className="text-sm font-bold text-[#0F5C47]">→ وحداتي</button>
        </div>
        <div className="rounded-2xl bg-white p-8 text-center shadow-[0_1px_6px_rgba(0,0,0,0.06)]">
          <p className="text-lg font-extrabold text-[#12302B]">استيراد وحدة من مجلد</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-[#4C6A63]">
            اختر مجلد الدرس أو الكتاب الذي رقمنته مسبقًا — يحتوي الوحدات ودروسها وصورها. سيُحفظ كل شيء كمسودة يمكنك مراجعتها وتعديلها بنفسك قبل نشرها للطلاب.
          </p>
          <label className="mx-auto mt-5 grid min-h-28 max-w-sm cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-[#CFE0DA] bg-[#F3F7F5] p-4 text-center text-sm text-[#4C6A63]">
            <input
              ref={fileInput}
              type="file"
              // @ts-expect-error webkitdirectory n'est pas dans le typage standard de React mais fonctionne dans Chrome/Edge/Safari.
              webkitdirectory=""
              directory=""
              multiple
              className="hidden"
              onChange={(event) => event.target.files?.length && handleFolder(event.target.files)}
            />
            اضغط لاختيار مجلد الاستيراد
          </label>
          {error && <p className="mt-3 text-sm text-[#C4564A]">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 pb-28 sm:px-4 sm:pb-24 md:px-7" dir="rtl">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <button type="button" onClick={onClose} disabled={saving} className="shrink-0 text-sm font-bold text-[#0F5C47] disabled:opacity-50">
          → وحداتي
        </button>
        <span className="rounded-full bg-white px-3 py-1 text-xs text-[#4C6A63]">
          {draft.units.length} وحدة · {draft.stats.lessons} درس في الملف · {totalChecked} محدَّد
        </span>
      </div>

      <div className="mb-3 flex flex-col gap-2 rounded-2xl bg-white p-3 shadow-[0_1px_6px_rgba(0,0,0,0.06)] sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <label className="flex flex-col gap-1 text-sm text-[#4C6A63] sm:flex-row sm:items-center sm:gap-2">
          <span className="shrink-0">المادة لكل الوحدات المستوردة</span>
          <select className="fatin-field sm:!w-auto" value={subject} onChange={(event) => onSubjectChange(event.target.value)}>
            <option value="">اختر المادة</option>
            {subjects.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} {item.level_name ? `· ${item.level_name}` : ""}
              </option>
            ))}
          </select>
        </label>
        {draft.stats.images_expected > 0 && (
          <ImagesBadge expected={draft.stats.images_expected} matched={imagesByPath.size} />
        )}
      </div>

      {error && <p className="mb-3 rounded-xl bg-[#FDECEA] px-3 py-2 text-sm text-[#C4564A]">{error}</p>}

      <div className="grid gap-3 lg:grid-cols-[320px_1fr]">
        <nav className="max-h-[50vh] overflow-auto rounded-2xl bg-white p-2 shadow-[0_1px_6px_rgba(0,0,0,0.06)] lg:max-h-[72vh]">
          {draft.units.map((unit) => {
            const existing = subject ? matchUnit(unit.title, Number(subject)) : null;
            const existingLessonTitles = existing ? (lessonsByUnit[existing.id] ?? []).map((l) => l.title.trim()) : [];
            return (
              <UnitTree
                key={unit.key}
                unit={unit}
                unitExists={!!existing}
                existingLessonTitles={existingLessonTitles}
                checkState={unitCheckState(unit)}
                checkedLessons={checkedLessons}
                selected={selected}
                onSelect={setSelected}
                onToggleUnit={(checked) => toggleUnit(unit, checked)}
                onToggleLesson={toggleLesson}
              />
            );
          })}
        </nav>

        <section className="max-h-[65vh] overflow-auto rounded-2xl bg-white p-4 shadow-[0_1px_6px_rgba(0,0,0,0.06)] sm:p-5 lg:max-h-[72vh]">
          <DetailView
            draft={draft}
            selected={selected}
            imagesByPath={imagesByPath}
            existingUnitTitleMatch={(title) => (subject ? !!matchUnit(title, Number(subject)) : false)}
            existingLessonTitles={(unitKey) => {
              const unit = draft.units.find((u) => u.key === unitKey);
              if (!unit || !subject) return [];
              const existing = matchUnit(unit.title, Number(subject));
              return existing ? (lessonsByUnit[existing.id] ?? []).map((l) => l.title.trim()) : [];
            }}
          />
        </section>
      </div>

      {report && <SaveReportView report={report} />}

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[#E7F2ED] bg-white/95 px-3 py-3 backdrop-blur sm:px-4 md:px-7">
        <div className="mx-auto flex max-w-screen-xl flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-center text-xs text-[#C4564A] sm:text-start sm:text-sm">
            {!subject ? "اختر المادة أولًا." : totalChecked === 0 ? "لم تُحدَّد أي دروس للحفظ." : ""}
          </span>
          <button
            type="button"
            disabled={!subject || totalChecked === 0 || saving}
            onClick={saveSelected}
            className="w-full rounded-full bg-[#0F5C47] px-5 py-3 text-sm font-extrabold text-white disabled:opacity-50 sm:w-auto sm:py-2.5"
          >
            {saving ? "جارٍ الحفظ…" : `حفظ ${totalChecked} درس محدَّد كمسودة`}
          </button>
        </div>
      </div>

      {saving && <SavingOverlay progress={progress} savedCount={savedCount} total={saveTotal} />}
    </div>
  );
}

function SavingOverlay({ progress, savedCount, total }: { progress: string; savedCount: number; total: number }) {
  const percent = total > 0 ? Math.min(100, Math.round((savedCount / total) * 100)) : 0;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#12302B]/60 backdrop-blur-sm" role="status" aria-live="polite">
      <div dir="rtl" className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#E7F2ED] border-t-[#0F5C47]" />
        <p className="text-lg font-extrabold text-[#12302B]">جارٍ الحفظ…</p>
        <p className="mt-1 text-sm text-[#4C6A63]">الرجاء الانتظار حتى يتم الحفظ، لا تُغلق الصفحة.</p>

        {total > 0 && (
          <>
            <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[#E7F2ED]">
              <div className="h-full rounded-full bg-[#0F5C47] transition-all duration-300" style={{ width: `${percent}%` }} />
            </div>
            <p className="mt-2 text-xs font-bold text-[#0F5C47]">{savedCount} / {total} درس · {percent}%</p>
          </>
        )}

        {progress && (
          <p className="mt-3 truncate rounded-xl bg-[#F3F7F5] px-3 py-2 text-xs text-[#4C6A63]" dir="auto" title={progress}>
            {progress}
          </p>
        )}
      </div>
    </div>
  );
}

function ImagesBadge({ expected, matched }: { expected: number; matched: number }) {
  const missing = Math.max(0, expected - matched);
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold ${missing > 0 ? "bg-[#FFF4D6] text-[#8A5A00]" : "bg-[#E3F4EC] text-[#1B7F5C]"}`}>
      {missing > 0 ? `⚠ ${matched}/${expected} صورة موجودة في المجلد` : `✓ كل الصور (${matched}) موجودة`}
    </span>
  );
}

function SaveReportView({ report }: { report: SaveReport }) {
  const failed = report.filter((r) => !r.ok);
  const ok = report.filter((r) => r.ok);
  return (
    <div className="mt-3 rounded-2xl bg-white p-4 shadow-[0_1px_6px_rgba(0,0,0,0.06)]">
      <h3 className="font-extrabold text-[#12302B]">نتيجة الحفظ</h3>
      <p className="mt-1 text-sm text-[#4C6A63]">{ok.length} درس نجح · {failed.length} درس فشل</p>
      {failed.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {failed.map((item, index) => (
            <li key={index} className="rounded-xl bg-[#FDECEA] px-3 py-2 text-sm text-[#C4564A]" dir="auto">
              <b>{item.unitTitle} ← {item.lessonTitle}:</b> {item.error}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ==================== Arborescence (colonne droite) ====================

function UnitTree({
  unit,
  unitExists,
  existingLessonTitles,
  checkState,
  checkedLessons,
  selected,
  onSelect,
  onToggleUnit,
  onToggleLesson,
}: {
  unit: DraftUnit;
  unitExists: boolean;
  existingLessonTitles: string[];
  checkState: "all" | "none" | "partial";
  checkedLessons: Set<string>;
  selected: Selected | null;
  onSelect: (s: Selected) => void;
  onToggleUnit: (checked: boolean) => void;
  onToggleLesson: (lessonKey: string, checked: boolean) => void;
}) {
  const [open, setOpen] = useState(true);
  const active = selected?.level === "unit" && selected.unitKey === unit.key;
  const duplicateLessons = unit.lessons.filter((lesson) => existingLessonTitles.includes(lesson.title.trim())).length;

  return (
    <div className="mb-1.5">
      <div className={`flex items-start gap-2 rounded-xl border px-2 py-2 ${active ? "border-[#0F5C47] bg-[#E7F2ED]" : "border-transparent bg-[#FBFDFC]"}`}>
        <label className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-lg bg-white" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={checkState === "all"}
            ref={(el) => { if (el) el.indeterminate = checkState === "partial"; }}
            onChange={(event) => onToggleUnit(event.target.checked)}
            className="h-5 w-5 accent-[#0F5C47]"
            aria-label={`تحديد كل دروس ${unit.title}`}
          />
        </label>

        <button type="button" onClick={() => onSelect({ level: "unit", unitKey: unit.key })} className="min-w-0 flex-1 py-1 text-start" dir="auto">
          <span className={`block truncate text-sm ${active ? "font-bold text-[#0F5C47]" : "font-bold text-[#12302B]"}`}>
            {unit.title || "وحدة بلا عنوان"}
          </span>
          <span className="mt-0.5 flex flex-wrap items-center gap-1">
            <span className="text-[11px] text-[#8CA39C]">{unit.lessons.length} درس</span>
            {unitExists && (
              <span className="rounded-full bg-[#FFF4D6] px-1.5 py-0.5 text-[10px] font-bold text-[#8A5A00]">موجودة</span>
            )}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-label={open ? "طي دروس الوحدة" : "عرض دروس الوحدة"}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-sm text-[#8CA39C] hover:bg-white"
        >
          {open ? "▾" : "◂"}
        </button>
      </div>
      {unitExists && duplicateLessons > 0 && (
        <p className="ms-11 mt-1 text-[11px] text-[#C4564A]">⚠ {duplicateLessons} درس سيُستبدل (نفس العنوان موجود)</p>
      )}
      {open && (
        <div className="ms-4 mt-1 space-y-1 border-e-2 border-[#E7F2ED] ps-2">
          {unit.lessons.map((lesson) => {
            const lessonActive = selected?.level === "lesson" && selected.lessonKey === lesson.key;
            const willReplace = existingLessonTitles.includes(lesson.title.trim());
            const checked = checkedLessons.has(lesson.key);
            return (
              <div
                key={lesson.key}
                className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 ${lessonActive ? "border-[#0F5C47] bg-[#E7F2ED]" : checked ? "border-transparent bg-white" : "border-transparent bg-white/60"}`}
              >
                <label className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-lg bg-[#F3F7F5]">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(event) => onToggleLesson(lesson.key, event.target.checked)}
                    className="h-[18px] w-[18px] accent-[#0F5C47]"
                    aria-label={`تحديد ${lesson.title}`}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => onSelect({ level: "lesson", unitKey: unit.key, lessonKey: lesson.key })}
                  className="min-w-0 flex-1 truncate py-1 text-start text-sm"
                  dir="auto"
                >
                  <span className={lessonActive ? "font-bold text-[#0F5C47]" : "text-[#12302B]"}>{lesson.title || "درس بلا عنوان"}</span>
                </button>
                {willReplace && <span className="shrink-0 rounded-full bg-[#FDECEA] px-1.5 py-0.5 text-[10px] font-bold text-[#C4564A]">استبدال</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ==================== Lecture (colonne gauche) ====================

function DetailView({
  draft,
  selected,
  imagesByPath,
  existingUnitTitleMatch,
  existingLessonTitles,
}: {
  draft: ImportDraft;
  selected: Selected | null;
  imagesByPath: Map<string, File>;
  existingUnitTitleMatch: (title: string) => boolean;
  existingLessonTitles: (unitKey: string) => string[];
}) {
  if (!selected) return <p className="py-10 text-center text-sm text-[#8CA39C]">اختر وحدة أو درسًا من القائمة للمراجعة.</p>;
  const unit = draft.units.find((u) => u.key === selected.unitKey);
  if (!unit) return null;

  if (selected.level === "unit") {
    return <UnitDetail unit={unit} unitExists={existingUnitTitleMatch(unit.title)} />;
  }

  const lesson = unit.lessons.find((l) => l.key === selected.lessonKey);
  if (!lesson) return null;
  const willReplace = existingLessonTitles(unit.key).includes(lesson.title.trim());
  return <LessonDetail lesson={lesson} willReplace={willReplace} imagesByPath={imagesByPath} />;
}

function UnitDetail({ unit, unitExists }: { unit: DraftUnit; unitExists: boolean }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-xl font-extrabold text-[#12302B]" dir="auto">{unit.title || "وحدة بلا عنوان"}</h2>
        {unitExists && (
          <span className="shrink-0 rounded-full bg-[#FFF4D6] px-3 py-0.5 text-xs font-bold text-[#8A5A00]">وحدة موجودة — سيُضاف المحدَّد إليها</span>
        )}
      </div>
      {unit.description && (
        <div>
          <p className="text-xs font-bold text-[#4C6A63]">الوصف</p>
          <p className="mt-1 text-sm" dir="auto">{unit.description}</p>
        </div>
      )}
      {unit.main_goal_description && (
        <div>
          <p className="text-xs font-bold text-[#4C6A63]">الهدف الرئيسي</p>
          <p className="mt-1 text-sm" dir="auto">{unit.main_goal_description}</p>
        </div>
      )}
      {unit.central_question && (
        <div>
          <p className="text-xs font-bold text-[#4C6A63]">السؤال المركزي</p>
          <p className="mt-1 text-sm" dir="auto">{unit.central_question}</p>
        </div>
      )}
      {(unit.main_skill_domain || unit.term || unit.competency_ref) && (
        <div className="flex flex-wrap gap-2 pt-1">
          {unit.main_skill_domain && <span className="rounded-full bg-[#F3F7F5] px-3 py-1 text-xs font-bold text-[#0F5C47]">المجال: {unit.main_skill_domain}</span>}
          {unit.term && <span className="rounded-full bg-[#F3F7F5] px-3 py-1 text-xs font-bold text-[#0F5C47]">الفصل: {unit.term}</span>}
          {unit.competency_ref && <span className="rounded-full bg-[#F3F7F5] px-3 py-1 text-xs font-bold text-[#0F5C47]" dir="ltr">مرجع الكفاءة: {unit.competency_ref}</span>}
        </div>
      )}
      <p className="pt-2 text-sm text-[#4C6A63]">{unit.lessons.length} درس — اختر درسًا من القائمة لمراجعة محتواه الكامل.</p>
    </div>
  );
}

function LessonDetail({ lesson, willReplace, imagesByPath }: { lesson: DraftLesson; willReplace: boolean; imagesByPath: Map<string, File> }) {
  const hasProgrammeInfo = lesson.programme_ref || lesson.week != null || lesson.programme_weeks.length > 0 || lesson.book_exercises.length > 0;
  return (
    <div className="space-y-4">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-extrabold text-[#12302B]" dir="auto">{lesson.title || "درس بلا عنوان"}</h2>
          {willReplace && <span className="shrink-0 rounded-full bg-[#FDECEA] px-3 py-0.5 text-xs font-bold text-[#C4564A]">سيُستبدل درس موجود بنفس العنوان</span>}
        </div>
        {lesson.description && <p className="mt-1 text-sm text-[#4C6A63]" dir="auto">{lesson.description}</p>}
        {hasProgrammeInfo && (
          <div className="mt-2 flex flex-wrap gap-2">
            {lesson.programme_ref && <span className="rounded-full bg-[#F3F7F5] px-2.5 py-1 text-xs font-bold text-[#0F5C47]" dir="ltr">مرجع البرنامج: {lesson.programme_ref}</span>}
            {lesson.week != null && <span className="rounded-full bg-[#F3F7F5] px-2.5 py-1 text-xs font-bold text-[#0F5C47]">الأسبوع: {lesson.week}</span>}
            {lesson.programme_weeks.length > 0 && (
              <span className="rounded-full bg-[#F3F7F5] px-2.5 py-1 text-xs font-bold text-[#0F5C47]" dir="ltr">أسابيع البرنامج: {lesson.programme_weeks.join("، ")}</span>
            )}
            {lesson.book_exercises.length > 0 && (
              <span className="rounded-full bg-[#F3F7F5] px-2.5 py-1 text-xs font-bold text-[#0F5C47]" dir="auto">تمارين الكتاب: {lesson.book_exercises.join("، ")}</span>
            )}
          </div>
        )}
      </div>

      {lesson.goals.map((goal) => (
        <GoalSection key={goal.key} goal={goal} imagesByPath={imagesByPath} />
      ))}
      {lesson.goals.length === 0 && <p className="text-sm text-[#8CA39C]">لا توجد أهداف لهذا الدرس في الملف.</p>}
    </div>
  );
}

function GoalSection({ goal, imagesByPath }: { goal: DraftGoal; imagesByPath: Map<string, File> }) {
  return (
    <div className="space-y-3 rounded-2xl bg-[#FBFDFC] p-3">
      <div>
        <span className="rounded-full bg-[#F3F7F5] px-3 py-1 text-xs font-bold text-[#0F5C47]">هدف {GOAL_LABEL[goal.goal_type]}</span>
        <h3 className="mt-2 font-extrabold text-[#12302B]" dir="auto">{goal.title || "هدف بلا عنوان"}</h3>
        {goal.description && <p className="mt-1 text-sm text-[#4C6A63]" dir="auto">{goal.description}</p>}
      </div>
      <div className="space-y-3">
        {goal.skills.map((skill) => (
          <SkillSection key={skill.key} skill={skill} imagesByPath={imagesByPath} />
        ))}
        {goal.skills.length === 0 && <p className="text-sm text-[#8CA39C]">لا توجد مهارات لهذا الهدف في الملف.</p>}
      </div>
    </div>
  );
}

function SkillSection({ skill, imagesByPath }: { skill: DraftSkill; imagesByPath: Map<string, File> }) {
  const counts = CHUNK_TYPES.map((type) => ({ ...type, count: skill.chunks.filter((c) => c.chunk_type === type.id).length })).filter((t) => t.count > 0);
  return (
    <div className="rounded-xl border border-[#E7F2ED] bg-white p-3">
      <p className="font-bold text-[#12302B]" dir="auto">{skill.name || "مهارة بلا اسم"}</p>
      {skill.description && <p className="mt-1 text-sm text-[#4C6A63]" dir="auto">{skill.description}</p>}
      <div className="mt-2 flex flex-wrap gap-2">
        <span className="rounded-full bg-[#F3F7F5] px-2.5 py-1 text-xs font-bold text-[#4C6A63]">صعوبة {skill.difficulty}</span>
        {counts.map((type) => (
          <span key={type.id} className="rounded-full bg-[#F3F7F5] px-2.5 py-1 text-xs font-bold text-[#4C6A63]">{type.label}: {type.count}</span>
        ))}
      </div>
      <div className="mt-3 space-y-3">
        {skill.chunks.map((chunk) => (
          <ChunkCard key={chunk.key} chunk={chunk} imageFile={chunk.image_path ? imagesByPath.get(chunk.image_path) : undefined} />
        ))}
        {skill.chunks.length === 0 && <p className="text-sm text-[#8CA39C]">لا توجد قطع محتوى لهذه المهارة في الملف.</p>}
      </div>
    </div>
  );
}

function ChunkCard({ chunk, imageFile }: { chunk: DraftChunk; imageFile: File | undefined }) {
  const isPractice = chunk.chunk_type === "practice";
  const imageUrl = useObjectUrl(imageFile);
  return (
    <div className="rounded-xl bg-[#F3F7F5] px-3 py-2">
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-[#0F5C47]">{chunkTypeLabel(chunk.chunk_type)}</span>
        {chunk.title && <span className="font-bold text-[#12302B]" dir="auto">{chunk.title}</span>}
        {chunk.image_path && !imageFile && <span className="text-xs text-[#8A5A00]">🖼 صورة ناقصة من المجلد</span>}
      </div>
      {chunk.content && <p className="whitespace-pre-line text-sm" dir="auto">{chunk.content}</p>}
      {imageUrl && <img src={imageUrl} alt={chunk.title || "صورة القطعة"} className="mt-2 max-h-40 rounded-lg border border-[#E7F2ED] object-contain" />}
      {isPractice && (chunk.correct_answer || chunk.options) && (
        <div className="mt-1 text-xs text-[#4C6A63]" dir="auto">
          {chunk.correct_answer && <>الإجابة: {chunk.correct_answer} </>}
          {chunk.options && `· ${chunk.options}`}
        </div>
      )}
    </div>
  );
}

// Crée une object URL locale pour prévisualiser un File sans appel réseau,
// et la révoque proprement quand le fichier change ou que le composant se démonte.
function useObjectUrl(file: File | undefined) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);
  return url;
}

// ==================== Enregistrement ====================
// Une unité est créée/réutilisée une seule fois (ensureUnit), puis chaque
// leçon cochée est enregistrée indépendamment (saveLesson) avec son propre
// try/catch dans saveSelected : l'échec d'une leçon n'empêche pas les
// suivantes d'être tentées, et le rapport final liste précisément ce qui a
// réussi ou échoué.

async function ensureUnit(
  unit: DraftUnit,
  subject: number,
  usedCodes: string[],
  existingUnit: CUnit | null,
): Promise<{ unitId: number; code: string; startIndex: number }> {
  if (existingUnit) {
    return { unitId: existingUnit.id, code: existingUnit.code, startIndex: existingUnit.lessons_count };
  }
  const code = nextCode("U", usedCodes, 2);
  const { data: savedUnit } = await api.post(API_ENDPOINTS.curriculum.units, {
    subject,
    code,
    title: unit.title || "وحدة مستوردة",
    description: unit.description || null,
    main_goal_description: unit.main_goal_description || null,
    central_question: unit.central_question || null,
    main_skill_domain: unit.main_skill_domain || "",
    term: unit.term || "",
    competency_ref: unit.competency_ref || "",
    order_index: usedCodes.length + 1,
  });
  return { unitId: savedUnit.id, code, startIndex: 0 };
}

async function saveLesson(
  lesson: DraftLesson,
  unitId: number,
  unitCode: string,
  lessonOrder: number,
  existingLessons: ExistingLesson[],
  lessonCodes: string[],
  imagesByPath: Map<string, File>,
  onProgress: (text: string) => void,
) {
  const duplicate = existingLessons.find((item) => item.title.trim() === lesson.title.trim());
  if (duplicate) {
    onProgress(`استبدال الدرس: ${lesson.title}`);
    await api.delete(API_ENDPOINTS.content.lessonDetail(duplicate.id));
  }
  const lessonCode = duplicate ? duplicate.code : nextCode(`${unitCode}-L`, lessonCodes, 2);
  if (!duplicate) lessonCodes.push(lessonCode);

  const { data: savedLesson } = await api.post(API_ENDPOINTS.curriculum.lessons, {
    unit: unitId,
    code: lessonCode,
    title: lesson.title || `درس ${lessonOrder}`,
    description: lesson.description || "",
    programme_ref: lesson.programme_ref || "",
    week: lesson.week,
    programme_weeks: lesson.programme_weeks,
    book_exercises: lesson.book_exercises,
    order_index: lessonOrder,
  });

  const skillCodes: string[] = [];
  for (const goal of lesson.goals) {
    const { data: savedGoal } = await api.post(API_ENDPOINTS.curriculum.goals, {
      lesson: savedLesson.id,
      goal_type: goal.goal_type,
      title: goal.title || "",
      description: goal.description || "",
      order_index: goal.goal_type === "conceptual" ? 1 : 2,
    });

    const letter = goal.goal_type === "conceptual" ? "C" : "O";
    let skillOrder = 0;
    for (const skill of goal.skills) {
      skillOrder += 1;
      const skillCode = nextCode(`SK-${lessonCode}-${letter}`, skillCodes, 2);
      skillCodes.push(skillCode);
      const { data: savedSkill } = await api.post(API_ENDPOINTS.skills.skills, {
        goal: savedGoal.id,
        skill_type: goal.goal_type,
        code: skillCode,
        name: skill.name || "",
        description: skill.description || "",
        difficulty: skill.difficulty,
        mastery_threshold: 0.8,
        required_consecutive_correct: 3,
        order_index: skillOrder,
      });

      const chunkCodes: string[] = [];
      let chunkOrder = 0;
      for (const chunk of skill.chunks) {
        chunkOrder += 1;
        const chunkCode = nextCode(`${skillCode}-CH`, chunkCodes, 2);
        chunkCodes.push(chunkCode);
        const isPractice = chunk.chunk_type === "practice";
        const options = chunk.options.split(/[،,]/).map((item) => item.trim()).filter(Boolean);
        const optionObjects = isPractice && options.length && chunk.correct_answer && !options.includes(chunk.correct_answer)
          ? [...options, chunk.correct_answer]
          : isPractice ? options : [];
        const imageFile = chunk.image_path ? imagesByPath.get(chunk.image_path) : undefined;
        // Une image jointe comble le besoin : on ne garde needs_image que
        // si aucun fichier correspondant n'a été retrouvé dans le dossier.
        const fields: Record<string, unknown> = {
          skill: savedSkill.id,
          code: chunkCode,
          chunk_type: chunk.chunk_type,
          title: chunk.title || null,
          content: chunk.content || "",
          difficulty: chunk.difficulty,
          points: chunk.points,
          correct_answer: isPractice ? chunk.correct_answer : null,
          options: optionObjects,
          time_limit: isPractice ? chunk.time_limit : null,
          needs_image: chunk.needs_image && !imageFile,
          image_note: chunk.image_note || null,
          order_index: chunkOrder,
        };
        let data: FormData | Record<string, unknown> = fields;
        if (imageFile) {
          onProgress(`رفع صورة القطعة: ${chunk.title || chunkCode}`);
          const body = new FormData();
          Object.entries(fields).forEach(([key, value]) => {
            if (key === "options") body.append(key, JSON.stringify(value));
            else body.append(key, value === null || value === undefined ? "" : String(value));
          });
          body.append("image", imageFile);
          data = body;
        }
        await api.post(API_ENDPOINTS.skills.chunks, data);
      }
    }
  }
}
