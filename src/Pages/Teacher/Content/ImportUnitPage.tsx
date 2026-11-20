import { useEffect, useMemo, useRef, useState } from "react";
import { message } from "antd";
import api from "../../../Auth-service/axios";
import { API_ENDPOINTS } from "../../../api/endpoints";
import { apiErrorText } from "../../../Services/Fatin/apiErrorText";
import { useGetMatiere } from "../../../Services/Admin/Matieres/useGetMatiere";
import { useContentUnits } from "../../../Services/Fatin/useTeacherContent";
import type { CUnit } from "../../../Services/Fatin/types";
import { useFatinChrome } from "../../../ui/FatinChrome";
import { Loading } from "../../Student/fatinStudentUi";
import { CHUNK_TYPES, GOAL_LABEL, Pill, nextCode } from "./contentUi";
import { parseImportFile, type DraftChunk, type DraftGoal, type DraftLesson, type DraftSkill, type DraftUnit, type ImportDraft } from "./importDraft";

// Case à cocher stylisée (coche dessinée en SVG) : plus nette et cohérente
// avec la marque que le rendu natif du navigateur, utilisée pour la
// sélection unité/leçon ainsi que pour needs_image.
function Checkbox({
  checked,
  indeterminate,
  onChange,
  size = "md",
  ariaLabel,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (checked: boolean) => void;
  size?: "sm" | "md";
  ariaLabel?: string;
}) {
  const dimension = size === "sm" ? "h-[16px] w-[16px]" : "h-5 w-5";
  const active = checked || indeterminate;
  return (
    <label className={`relative inline-grid shrink-0 cursor-pointer place-items-center rounded-md ${dimension}`}>
      <input
        type="checkbox"
        checked={checked}
        ref={(el) => {
          if (el) el.indeterminate = !!indeterminate;
        }}
        onChange={(event) => onChange(event.target.checked)}
        className="absolute inset-0 m-0 cursor-pointer opacity-0"
        aria-label={ariaLabel}
      />
      <span
        className={`pointer-events-none grid h-full w-full place-items-center rounded-md border-2 transition-colors ${
          active ? "border-[#0F5C47] bg-[#0F5C47]" : "border-[#CFE0DA] bg-white"
        }`}
      >
        {indeterminate ? (
          <span className="h-[2px] w-2/3 rounded-full bg-white" />
        ) : checked ? (
          <svg viewBox="0 0 16 16" className="h-3 w-3 fill-none stroke-white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M3.5 8.5L6.5 11.5L12.5 4.5" />
          </svg>
        ) : null}
      </span>
    </label>
  );
}

// Liste déroulante entièrement personnalisée (bouton + panneau positionné),
// utilisée pour le choix de la matière : un <select> natif ne permet pas de
// styler sa liste d'options (coins arrondis, survol, élément sélectionné).
type DropdownOption = { value: string; label: string };

function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
  invalid,
}: {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder: string;
  invalid?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find((item) => item.value === value) ?? null;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`fatin-field flex w-full items-center justify-between gap-2 text-start transition-colors ${
          selected ? "text-[#12302B]" : "text-[#8CA39C]"
        } ${open ? "ring-2 ring-[#0F5C47]" : invalid ? "border-[#FFE3A3]" : ""}`}
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <span className={`shrink-0 text-xs text-[#8CA39C] transition-transform ${open ? "rotate-180" : ""}`} aria-hidden>
          ▾
        </span>
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute z-30 mt-1.5 max-h-60 w-full overflow-auto rounded-xl border border-[#E7F2ED] bg-white p-1.5 shadow-lg"
        >
          {options.length === 0 && <li className="px-3 py-2 text-sm text-[#8CA39C]">لا توجد خيارات</li>}
          {options.map((item) => {
            const active = item.value === value;
            return (
              <li key={item.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-start text-sm transition-colors ${
                    active ? "bg-[#E7F2ED] font-bold text-[#0F5C47]" : "text-[#12302B] hover:bg-[#F3F7F5]"
                  }`}
                >
                  <span className="truncate">{item.label}</span>
                  {active && <span aria-hidden>✓</span>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

const TIME_PRESETS = [30, 60, 90, 120, 180];
const formatTime = (seconds: number) => {
  if (seconds % 60 === 0) return `${seconds / 60}د`;
  if (seconds < 60) return `${seconds}ث`;
  return `${Math.floor(seconds / 60)}د ${seconds % 60}ث`;
};

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
  // Réaffectation locale d'une leçon vers une autre unité du même brouillon,
  // sans toucher à la structure d'origine issue du JSON (clé leçon → clé unité cible).
  const [lessonUnitOverride, setLessonUnitOverride] = useState<Record<string, string>>({});
  const [draggedLesson, setDraggedLesson] = useState<string | null>(null);

  // Vue effective du brouillon : chaque leçon apparaît sous l'unité choisie
  // par l'enseignant (override) plutôt que sous l'unité d'origine du fichier.
  const effectiveUnits = useMemo(() => {
    if (!draft) return [];
    const lessonToOriginalUnit = new Map<string, string>();
    draft.units.forEach((unit) => unit.lessons.forEach((lesson) => lessonToOriginalUnit.set(lesson.key, unit.key)));
    const allLessons = draft.units.flatMap((unit) => unit.lessons);
    return draft.units.map((unit) => ({
      ...unit,
      lessons: allLessons.filter((lesson) => (lessonUnitOverride[lesson.key] ?? lessonToOriginalUnit.get(lesson.key)) === unit.key),
    }));
  }, [draft, lessonUnitOverride]);

  const moveLessonToUnit = (lessonKey: string, targetUnitKey: string) => {
    setLessonUnitOverride((prev) => ({ ...prev, [lessonKey]: targetUnitKey }));
    setSelected((prev) =>
      prev?.level === "lesson" && prev.lessonKey === lessonKey ? { level: "lesson", unitKey: targetUnitKey, lessonKey } : prev,
    );
  };

  // Remplacement local de l'image d'une chunk avant import : clé chunk →
  // nouveau fichier (ou null si l'enseignant a explicitement retiré l'image),
  // prioritaire sur la résolution par image_path/imagesByPath.
  const [chunkImageOverride, setChunkImageOverride] = useState<Record<string, File | null>>({});

  // Mise à jour générique du brouillon : chaque niveau (unité/leçon/objectif/
  // compétence/chunk) descend jusqu'à son nœud via sa propre clé puis
  // reconstruit le tableau immuablement, sans dépendance externe (pas d'Immer).
  const updateUnits = (recipe: (units: DraftUnit[]) => DraftUnit[]) =>
    setDraft((prev) => (prev ? { ...prev, units: recipe(prev.units) } : prev));

  const updateUnit = (unitKey: string, patch: Partial<DraftUnit>) =>
    updateUnits((units) => units.map((u) => (u.key === unitKey ? { ...u, ...patch } : u)));

  const updateLesson = (lessonKey: string, patch: Partial<DraftLesson>) =>
    updateUnits((units) =>
      units.map((u) => ({ ...u, lessons: u.lessons.map((l) => (l.key === lessonKey ? { ...l, ...patch } : l)) })),
    );

  const updateGoal = (goalKey: string, patch: Partial<DraftGoal>) =>
    updateUnits((units) =>
      units.map((u) => ({
        ...u,
        lessons: u.lessons.map((l) => ({ ...l, goals: l.goals.map((g) => (g.key === goalKey ? { ...g, ...patch } : g)) })),
      })),
    );

  const updateSkill = (skillKey: string, patch: Partial<DraftSkill>) =>
    updateUnits((units) =>
      units.map((u) => ({
        ...u,
        lessons: u.lessons.map((l) => ({
          ...l,
          goals: l.goals.map((g) => ({ ...g, skills: g.skills.map((s) => (s.key === skillKey ? { ...s, ...patch } : s)) })),
        })),
      })),
    );

  const updateChunk = (chunkKey: string, patch: Partial<DraftChunk>) =>
    updateUnits((units) =>
      units.map((u) => ({
        ...u,
        lessons: u.lessons.map((l) => ({
          ...l,
          goals: l.goals.map((g) => ({
            ...g,
            skills: g.skills.map((s) => ({ ...s, chunks: s.chunks.map((c) => (c.key === chunkKey ? { ...c, ...patch } : c)) })),
          })),
        })),
      })),
    );

  const setChunkImage = (chunkKey: string, file: File | null) =>
    setChunkImageOverride((prev) => ({ ...prev, [chunkKey]: file }));

  // Renomme une unité du brouillon avant import — l'enseignant peut corriger
  // un titre issu du fichier numérisé sans toucher au reste de sa structure.
  const renameUnit = (unitKey: string, title: string) => updateUnit(unitKey, { title });

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
      setLessonUnitOverride({});
      setChunkImageOverride({});
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

  const totalChecked = effectiveUnits.reduce((n, u) => n + u.lessons.filter((l) => checkedLessons.has(l.key)).length, 0);

  const saveSelected = async () => {
    if (!draft || !subject) return;
    setSaving(true);
    setReport(null);
    setSavedCount(0);
    setSaveTotal(totalChecked);
    const results: SaveReport = [];
    try {
      const usedUnitCodes = existingUnits.map((item) => item.code);
      for (const unit of effectiveUnits) {
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
              await saveLesson(lesson, unitId, code, lessonOrder, existingLessons, lessonCodes, imagesByPath, chunkImageOverride, setProgress);
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

      <div
        className={`mb-3 flex flex-col gap-3 rounded-2xl border-2 bg-white p-3 shadow-[0_1px_6px_rgba(0,0,0,0.06)] transition-colors sm:flex-row sm:flex-wrap sm:items-center sm:justify-between ${
          subject ? "border-transparent" : "border-[#FFE3A3]"
        }`}
      >
        <div className="flex flex-col gap-1.5 text-sm sm:flex-row sm:items-center sm:gap-3">
          <span className="flex shrink-0 items-center gap-1.5 font-bold text-[#12302B]">
            المادة لكل الوحدات المستوردة
            {!subject && <span className="text-[#C4564A]">*</span>}
          </span>
          <div className="sm:w-64">
            <CustomSelect
              value={subject}
              onChange={onSubjectChange}
              placeholder="اختر المادة…"
              invalid={!subject}
              options={subjects.map((item) => ({
                value: String(item.id),
                label: `${item.name}${item.level_name ? ` · ${item.level_name}` : ""}`,
              }))}
            />
          </div>
        </div>
        {draft.stats.images_expected > 0 && (
          <ImagesBadge expected={draft.stats.images_expected} matched={imagesByPath.size} />
        )}
      </div>

      {error && <p className="mb-3 rounded-xl bg-[#FDECEA] px-3 py-2 text-sm text-[#C4564A]">{error}</p>}

      <div className="grid gap-3 lg:grid-cols-[320px_1fr]">
        <nav className="max-h-[50vh] overflow-auto rounded-2xl bg-[#F3F7F5] p-2 shadow-[0_1px_6px_rgba(0,0,0,0.06)] lg:max-h-[72vh]">
          {effectiveUnits.map((unit) => {
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
                onMoveLesson={moveLessonToUnit}
                draggedLesson={draggedLesson}
                onDragLesson={setDraggedLesson}
              />
            );
          })}
        </nav>

        <section className="max-h-[65vh] overflow-auto rounded-2xl bg-white p-4 shadow-[0_1px_6px_rgba(0,0,0,0.06)] sm:p-5 lg:max-h-[72vh]">
          <DetailView
            draft={{ ...draft, units: effectiveUnits }}
            selected={selected}
            imagesByPath={imagesByPath}
            chunkImageOverride={chunkImageOverride}
            existingUnitTitleMatch={(title) => (subject ? !!matchUnit(title, Number(subject)) : false)}
            existingLessonTitles={(unitKey) => {
              const unit = effectiveUnits.find((u) => u.key === unitKey);
              if (!unit || !subject) return [];
              const existing = matchUnit(unit.title, Number(subject));
              return existing ? (lessonsByUnit[existing.id] ?? []).map((l) => l.title.trim()) : [];
            }}
            onRenameUnit={renameUnit}
            onUpdateUnit={updateUnit}
            onUpdateLesson={updateLesson}
            onUpdateGoal={updateGoal}
            onUpdateSkill={updateSkill}
            onUpdateChunk={updateChunk}
            onChunkImage={setChunkImage}
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
  onMoveLesson,
  draggedLesson,
  onDragLesson,
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
  onMoveLesson: (lessonKey: string, targetUnitKey: string) => void;
  draggedLesson: string | null;
  onDragLesson: (lessonKey: string | null) => void;
}) {
  const [open, setOpen] = useState(true);
  const [dropHover, setDropHover] = useState(false);
  const active = selected?.level === "unit" && selected.unitKey === unit.key;
  const duplicateLessons = unit.lessons.filter((lesson) => existingLessonTitles.includes(lesson.title.trim())).length;

  const dropOnUnit = () => {
    setDropHover(false);
    if (draggedLesson) onMoveLesson(draggedLesson, unit.key);
    onDragLesson(null);
  };

  return (
    <div
      className="mb-2"
      onDragOver={(event) => {
        if (!draggedLesson) return;
        event.preventDefault();
        setDropHover(true);
      }}
      onDragLeave={() => setDropHover(false)}
      onDrop={(event) => {
        event.preventDefault();
        dropOnUnit();
      }}
    >
      <div
        className={`flex items-center gap-2 rounded-xl border-2 px-2.5 py-2.5 shadow-sm transition-colors ${dropHover ? "border-[#0F5C47] bg-[#DCEFE6]" : active ? "border-[#0F5C47] bg-white" : "border-transparent bg-white"}`}
      >
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#F3F7F5]" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={checkState === "all"}
            indeterminate={checkState === "partial"}
            onChange={onToggleUnit}
            ariaLabel={`تحديد كل دروس ${unit.title}`}
          />
        </div>

        <button type="button" onClick={() => onSelect({ level: "unit", unitKey: unit.key })} className="min-w-0 flex-1 text-start" dir="auto">
          <span className={`block truncate text-sm font-extrabold ${active ? "text-[#0F5C47]" : "text-[#12302B]"}`}>
            {unit.title || "وحدة بلا عنوان"}
          </span>
          <span className="mt-0.5 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-[#8CA39C]">{unit.lessons.length} درس</span>
            {unitExists && (
              <span className="rounded-full bg-[#FFF4D6] px-1.5 py-0.5 text-[10px] font-bold text-[#8A5A00]">موجودة</span>
            )}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-label={open ? "طي دروس الوحدة" : "عرض دروس الوحدة"}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs text-[#8CA39C] transition-transform hover:bg-[#F3F7F5]"
        >
          <span className={`transition-transform ${open ? "rotate-90" : ""}`}>◂</span>
        </button>
      </div>
      {unitExists && duplicateLessons > 0 && (
        <p className="ms-2 mt-1 text-[11px] font-bold text-[#C4564A]">⚠ {duplicateLessons} درس سيُستبدل (نفس العنوان موجود)</p>
      )}
      {open && (
        <div className="ms-4 mt-1.5 space-y-1 border-e-2 border-[#E7F2ED] ps-2.5">
          {unit.lessons.map((lesson) => {
            const lessonActive = selected?.level === "lesson" && selected.lessonKey === lesson.key;
            const willReplace = existingLessonTitles.includes(lesson.title.trim());
            const checked = checkedLessons.has(lesson.key);
            const dragging = draggedLesson === lesson.key;
            return (
              <div
                key={lesson.key}
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.effectAllowed = "move";
                  onDragLesson(lesson.key);
                }}
                onDragEnd={() => onDragLesson(null)}
                className={`group flex cursor-move items-center gap-1.5 rounded-lg px-2 py-1.5 transition-colors ${dragging ? "opacity-40" : ""} ${lessonActive ? "bg-[#E7F2ED]" : checked ? "bg-transparent hover:bg-[#F3F7F5]" : "bg-transparent opacity-60 hover:bg-[#F3F7F5] hover:opacity-100"}`}
                title="اسحب لنقل الدرس إلى وحدة أخرى"
              >
                <span className="shrink-0 text-[#CFE0DA]" aria-hidden>⠿</span>
                <Checkbox
                  checked={checked}
                  onChange={(value) => onToggleLesson(lesson.key, value)}
                  size="sm"
                  ariaLabel={`تحديد ${lesson.title}`}
                />
                <button
                  type="button"
                  onClick={() => onSelect({ level: "lesson", unitKey: unit.key, lessonKey: lesson.key })}
                  className="min-w-0 flex-1 truncate text-start text-[13px]"
                  dir="auto"
                >
                  <span className={lessonActive ? "font-bold text-[#0F5C47]" : "font-medium text-[#12302B]"}>{lesson.title || "درس بلا عنوان"}</span>
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

type DraftMutators = {
  onUpdateUnit: (unitKey: string, patch: Partial<DraftUnit>) => void;
  onUpdateLesson: (lessonKey: string, patch: Partial<DraftLesson>) => void;
  onUpdateGoal: (goalKey: string, patch: Partial<DraftGoal>) => void;
  onUpdateSkill: (skillKey: string, patch: Partial<DraftSkill>) => void;
  onUpdateChunk: (chunkKey: string, patch: Partial<DraftChunk>) => void;
  onChunkImage: (chunkKey: string, file: File | null) => void;
};

function DetailView({
  draft,
  selected,
  imagesByPath,
  chunkImageOverride,
  existingUnitTitleMatch,
  existingLessonTitles,
  onRenameUnit,
  onUpdateUnit,
  onUpdateLesson,
  onUpdateGoal,
  onUpdateSkill,
  onUpdateChunk,
  onChunkImage,
}: {
  draft: ImportDraft;
  selected: Selected | null;
  imagesByPath: Map<string, File>;
  chunkImageOverride: Record<string, File | null>;
  existingUnitTitleMatch: (title: string) => boolean;
  existingLessonTitles: (unitKey: string) => string[];
  onRenameUnit: (unitKey: string, title: string) => void;
} & DraftMutators) {
  if (!selected) return <p className="py-10 text-center text-sm text-[#8CA39C]">اختر وحدة أو درسًا من القائمة للمراجعة.</p>;
  const unit = draft.units.find((u) => u.key === selected.unitKey);
  if (!unit) return null;

  if (selected.level === "unit") {
    return <UnitDetail unit={unit} unitExists={existingUnitTitleMatch(unit.title)} onRename={(title) => onRenameUnit(unit.key, title)} onUpdateUnit={onUpdateUnit} />;
  }

  const lesson = unit.lessons.find((l) => l.key === selected.lessonKey);
  if (!lesson) return null;
  const willReplace = existingLessonTitles(unit.key).includes(lesson.title.trim());
  return (
    <LessonDetail
      lesson={lesson}
      willReplace={willReplace}
      imagesByPath={imagesByPath}
      chunkImageOverride={chunkImageOverride}
      onUpdateLesson={onUpdateLesson}
      onUpdateGoal={onUpdateGoal}
      onUpdateSkill={onUpdateSkill}
      onUpdateChunk={onUpdateChunk}
      onChunkImage={onChunkImage}
    />
  );
}

// Champ texte modifiable sur place : affichage figé jusqu'au clic, puis
// input contrôlé validé par blur/Entrée et annulé par Échap. Utilisé pour
// tous les champs courts (titres, références...) de l'arborescence importée.
function EditableText({
  value,
  onCommit,
  placeholder,
  className,
  dir = "auto",
}: {
  value: string;
  onCommit: (value: string) => void;
  placeholder: string;
  className?: string;
  dir?: "auto" | "ltr" | "rtl";
}) {
  const [editing, setEditing] = useState(false);
  const [draftValue, setDraftValue] = useState(value);

  useEffect(() => {
    setDraftValue(value);
  }, [value]);

  const commit = () => {
    setEditing(false);
    const trimmed = draftValue.trim();
    if (trimmed !== value) onCommit(trimmed);
  };

  if (editing) {
    return (
      <input
        autoFocus
        className={`fatin-field !h-auto !py-1 ${className ?? ""}`}
        dir={dir}
        value={draftValue}
        placeholder={placeholder}
        onChange={(event) => setDraftValue(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") commit();
          if (event.key === "Escape") {
            setDraftValue(value);
            setEditing(false);
          }
        }}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className={`group inline-flex max-w-full items-baseline gap-1.5 text-start ${className ?? ""}`}
      dir={dir}
      title="اضغط للتعديل"
    >
      <span className="truncate border-b border-dashed border-transparent transition-colors group-hover:border-[#8CA39C]">
        {value || <span className="text-[#8CA39C]">{placeholder}</span>}
      </span>
      <span className="shrink-0 text-xs text-[#8CA39C] opacity-0 transition-opacity group-hover:opacity-100" aria-hidden>✎</span>
    </button>
  );
}

// Variante multi-lignes du champ modifiable, pour les descriptions/contenus.
function EditableTextarea({
  value,
  onCommit,
  placeholder,
  rows = 2,
}: {
  value: string;
  onCommit: (value: string) => void;
  placeholder: string;
  rows?: number;
}) {
  const [editing, setEditing] = useState(false);
  const [draftValue, setDraftValue] = useState(value);

  useEffect(() => {
    setDraftValue(value);
  }, [value]);

  const commit = () => {
    setEditing(false);
    const trimmed = draftValue.trim();
    if (trimmed !== value) onCommit(trimmed);
  };

  if (editing) {
    return (
      <textarea
        autoFocus
        className="fatin-field"
        dir="auto"
        rows={rows}
        value={draftValue}
        placeholder={placeholder}
        onChange={(event) => setDraftValue(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setDraftValue(value);
            setEditing(false);
          }
        }}
      />
    );
  }

  return (
    <button type="button" onClick={() => setEditing(true)} className="group flex w-full items-start gap-1.5 text-start text-sm" dir="auto" title="اضغط للتعديل">
      <span className="flex-1 border-b border-dashed border-transparent transition-colors group-hover:border-[#8CA39C]">
        {value || <span className="text-[#8CA39C]">{placeholder}</span>}
      </span>
      <span className="shrink-0 pt-0.5 text-xs text-[#8CA39C] opacity-0 transition-opacity group-hover:opacity-100" aria-hidden>✎</span>
    </button>
  );
}

// Liste de valeurs modifiable (أسابيع البرنامج، تمارين الكتاب...) : mêmes
// tags + champ d'ajout que StepLesson.tsx, mais sur des number[]/string[] locaux.
function EditableTagList({
  values,
  onAdd,
  onRemove,
  placeholder,
  parse,
  format,
  dir = "auto",
}: {
  values: (string | number)[];
  onAdd: (raw: string) => void;
  onRemove: (value: string | number) => void;
  placeholder: string;
  parse?: (raw: string) => boolean;
  format?: (value: string | number) => string;
  dir?: "auto" | "ltr";
}) {
  const [input, setInput] = useState("");

  const submit = () => {
    if (input.trim() && (!parse || parse(input))) onAdd(input.trim());
    setInput("");
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {values.map((value) => (
        <span key={value} className="flex items-center gap-1 rounded-full bg-[#F3F7F5] px-2.5 py-1 text-xs font-bold text-[#0F5C47]" dir={dir}>
          {format ? format(value) : value}
          <button type="button" onClick={() => onRemove(value)} className="text-[#C4564A]" aria-label={`حذف ${value}`}>⌫</button>
        </span>
      ))}
      <input
        className="fatin-field w-28 !h-8"
        dir={dir}
        value={input}
        placeholder={placeholder}
        onChange={(event) => setInput(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            submit();
          }
        }}
        onBlur={submit}
      />
    </div>
  );
}

// Sélecteur d'étoiles identique à celui de StepChunks.tsx, réutilisé ici
// pour la difficulté des compétences et des chunks du brouillon importé.
function DifficultyStars({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <div className="flex items-center gap-1" dir="ltr">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          aria-label={`الصعوبة ${star}`}
          aria-pressed={value === star}
          className="text-xl leading-none transition-transform hover:scale-110"
          style={{ color: star <= value ? "#E0A526" : "#DCE8E3" }}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function UnitDetail({
  unit,
  unitExists,
  onRename,
  onUpdateUnit,
}: {
  unit: DraftUnit;
  unitExists: boolean;
  onRename: (title: string) => void;
} & Pick<DraftMutators, "onUpdateUnit">) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2 border-b border-[#E7F2ED] pb-4">
        <EditableText value={unit.title} onCommit={(value) => value && onRename(value)} placeholder="وحدة بلا عنوان" className="flex-1 text-2xl font-extrabold text-[#12302B]" />
        {unitExists && (
          <span className="shrink-0 rounded-full bg-[#FFF4D6] px-3 py-0.5 text-xs font-bold text-[#8A5A00]">وحدة موجودة — سيُضاف المحدَّد إليها</span>
        )}
      </div>
      <div className="space-y-4">
        <div>
          <p className="mb-1 text-xs font-bold text-[#4C6A63]">الوصف</p>
          <EditableTextarea value={unit.description} onCommit={(description) => onUpdateUnit(unit.key, { description })} placeholder="لا يوجد وصف — اضغط للإضافة" />
        </div>
        <div>
          <p className="mb-1 text-xs font-bold text-[#4C6A63]">الهدف الرئيسي</p>
          <EditableTextarea value={unit.main_goal_description} onCommit={(main_goal_description) => onUpdateUnit(unit.key, { main_goal_description })} placeholder="لا يوجد هدف رئيسي — اضغط للإضافة" />
        </div>
        <div>
          <p className="mb-1 text-xs font-bold text-[#4C6A63]">السؤال المركزي</p>
          <EditableTextarea value={unit.central_question} onCommit={(central_question) => onUpdateUnit(unit.key, { central_question })} placeholder="لا يوجد سؤال مركزي — اضغط للإضافة" />
        </div>
      </div>
      <div className="grid gap-3 rounded-xl bg-[#F3F7F5] p-3 sm:grid-cols-3">
        <div>
          <p className="mb-1 text-xs font-bold text-[#4C6A63]">المجال</p>
          <EditableText value={unit.main_skill_domain} onCommit={(main_skill_domain) => onUpdateUnit(unit.key, { main_skill_domain })} placeholder="—" className="text-sm" />
        </div>
        <div>
          <p className="mb-1 text-xs font-bold text-[#4C6A63]">الفصل</p>
          <EditableText value={unit.term} onCommit={(term) => onUpdateUnit(unit.key, { term })} placeholder="—" className="text-sm" />
        </div>
        <div>
          <p className="mb-1 text-xs font-bold text-[#4C6A63]">مرجع الكفاءة</p>
          <EditableText value={unit.competency_ref} onCommit={(competency_ref) => onUpdateUnit(unit.key, { competency_ref })} placeholder="—" className="text-sm" dir="ltr" />
        </div>
      </div>
      <p className="text-sm text-[#8CA39C]">{unit.lessons.length} درس — اختر درسًا من القائمة لمراجعة محتواه الكامل.</p>
    </div>
  );
}

function LessonDetail({
  lesson,
  willReplace,
  imagesByPath,
  chunkImageOverride,
  onUpdateLesson,
  onUpdateGoal,
  onUpdateSkill,
  onUpdateChunk,
  onChunkImage,
}: {
  lesson: DraftLesson;
  willReplace: boolean;
  imagesByPath: Map<string, File>;
  chunkImageOverride: Record<string, File | null>;
} & Omit<DraftMutators, "onUpdateUnit">) {
  return (
    <div className="space-y-6">
      <div className="space-y-4 border-b border-[#E7F2ED] pb-5">
        <div className="flex flex-wrap items-center gap-2">
          <EditableText
            value={lesson.title}
            onCommit={(title) => onUpdateLesson(lesson.key, { title })}
            placeholder="درس بلا عنوان"
            className="flex-1 text-2xl font-extrabold text-[#12302B]"
          />
          {willReplace && <span className="shrink-0 rounded-full bg-[#FDECEA] px-3 py-0.5 text-xs font-bold text-[#C4564A]">سيُستبدل درس موجود بنفس العنوان</span>}
        </div>
        <EditableTextarea value={lesson.description} onCommit={(description) => onUpdateLesson(lesson.key, { description })} placeholder="لا يوجد وصف — اضغط للإضافة" />
        <div className="grid gap-3 rounded-xl bg-[#F3F7F5] p-3 sm:grid-cols-2">
          <div>
            <p className="mb-1 text-xs font-bold text-[#4C6A63]">مرجع البرنامج</p>
            <EditableText value={lesson.programme_ref} onCommit={(programme_ref) => onUpdateLesson(lesson.key, { programme_ref })} placeholder="—" className="text-sm" dir="ltr" />
          </div>
          <div>
            <p className="mb-1 text-xs font-bold text-[#4C6A63]">الأسبوع</p>
            <input
              className="fatin-field !h-8 w-24"
              type="number"
              min={1}
              value={lesson.week ?? ""}
              onChange={(event) => onUpdateLesson(lesson.key, { week: event.target.value.trim() ? Number(event.target.value) : null })}
            />
          </div>
        </div>
        <div>
          <p className="mb-1 text-xs font-bold text-[#4C6A63]">أسابيع البرنامج</p>
          <EditableTagList
            values={lesson.programme_weeks}
            dir="ltr"
            placeholder="+ أسبوع"
            parse={(raw) => Number.isFinite(Number(raw)) && Number(raw) > 0}
            onAdd={(raw) => {
              const value = Number(raw);
              if (!lesson.programme_weeks.includes(value)) {
                onUpdateLesson(lesson.key, { programme_weeks: [...lesson.programme_weeks, value].sort((a, b) => a - b) });
              }
            }}
            onRemove={(value) => onUpdateLesson(lesson.key, { programme_weeks: lesson.programme_weeks.filter((item) => item !== value) })}
          />
        </div>
        <div>
          <p className="mb-1 text-xs font-bold text-[#4C6A63]">تمارين الكتاب</p>
          <EditableTagList
            values={lesson.book_exercises}
            placeholder="+ تمرين"
            onAdd={(raw) => {
              if (!lesson.book_exercises.includes(raw)) onUpdateLesson(lesson.key, { book_exercises: [...lesson.book_exercises, raw] });
            }}
            onRemove={(value) => onUpdateLesson(lesson.key, { book_exercises: lesson.book_exercises.filter((item) => item !== value) })}
          />
        </div>
      </div>

      <div className="space-y-4">
        {lesson.goals.map((goal) => (
          <GoalSection
            key={goal.key}
            goal={goal}
            imagesByPath={imagesByPath}
            chunkImageOverride={chunkImageOverride}
            onUpdateGoal={onUpdateGoal}
            onUpdateSkill={onUpdateSkill}
            onUpdateChunk={onUpdateChunk}
            onChunkImage={onChunkImage}
          />
        ))}
        {lesson.goals.length === 0 && <p className="text-sm text-[#8CA39C]">لا توجد أهداف لهذا الدرس في الملف.</p>}
      </div>
    </div>
  );
}

function GoalSection({
  goal,
  imagesByPath,
  chunkImageOverride,
  onUpdateGoal,
  onUpdateSkill,
  onUpdateChunk,
  onChunkImage,
}: {
  goal: DraftGoal;
  imagesByPath: Map<string, File>;
  chunkImageOverride: Record<string, File | null>;
} & Pick<DraftMutators, "onUpdateGoal" | "onUpdateSkill" | "onUpdateChunk" | "onChunkImage">) {
  return (
    <div className="space-y-3 rounded-xl border-s-4 border-[#0F5C47] bg-[#FBFDFC] p-3.5">
      <div>
        <div className="flex gap-2">
          <Pill active={goal.goal_type === "conceptual"} onClick={() => onUpdateGoal(goal.key, { goal_type: "conceptual" })}>{GOAL_LABEL.conceptual}</Pill>
          <Pill active={goal.goal_type === "operational"} onClick={() => onUpdateGoal(goal.key, { goal_type: "operational" })}>{GOAL_LABEL.operational}</Pill>
        </div>
        <EditableText
          value={goal.title}
          onCommit={(title) => onUpdateGoal(goal.key, { title })}
          placeholder="هدف بلا عنوان"
          className="mt-2 text-base font-extrabold text-[#12302B]"
        />
        <EditableTextarea value={goal.description} onCommit={(description) => onUpdateGoal(goal.key, { description })} placeholder="لا يوجد وصف — اضغط للإضافة" />
      </div>
      <div className="space-y-2.5 ps-1">
        {goal.skills.map((skill) => (
          <SkillSection
            key={skill.key}
            skill={skill}
            imagesByPath={imagesByPath}
            chunkImageOverride={chunkImageOverride}
            onUpdateSkill={onUpdateSkill}
            onUpdateChunk={onUpdateChunk}
            onChunkImage={onChunkImage}
          />
        ))}
        {goal.skills.length === 0 && <p className="text-sm text-[#8CA39C]">لا توجد مهارات لهذا الهدف في الملف.</p>}
      </div>
    </div>
  );
}

function SkillSection({
  skill,
  imagesByPath,
  chunkImageOverride,
  onUpdateSkill,
  onUpdateChunk,
  onChunkImage,
}: {
  skill: DraftSkill;
  imagesByPath: Map<string, File>;
  chunkImageOverride: Record<string, File | null>;
} & Pick<DraftMutators, "onUpdateSkill" | "onUpdateChunk" | "onChunkImage">) {
  const counts = CHUNK_TYPES.map((type) => ({ ...type, count: skill.chunks.filter((c) => c.chunk_type === type.id).length })).filter((t) => t.count > 0);
  return (
    <div className="rounded-lg border-s-[3px] border-[#9BC3B4] bg-white p-3 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
      <EditableText value={skill.name} onCommit={(name) => onUpdateSkill(skill.key, { name })} placeholder="مهارة بلا اسم" className="font-bold text-[#12302B]" />
      <EditableTextarea value={skill.description} onCommit={(description) => onUpdateSkill(skill.key, { description })} placeholder="لا يوجد وصف — اضغط للإضافة" />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-[#4C6A63]">الصعوبة:</span>
        <DifficultyStars value={skill.difficulty} onChange={(difficulty) => onUpdateSkill(skill.key, { difficulty })} />
        {counts.map((type) => (
          <span key={type.id} className="rounded-full bg-[#F3F7F5] px-2.5 py-1 text-xs font-bold text-[#4C6A63]">{type.label}: {type.count}</span>
        ))}
      </div>
      <div className="mt-3 space-y-2">
        {skill.chunks.map((chunk) => (
          <ChunkCard
            key={chunk.key}
            chunk={chunk}
            imageFile={chunkImageOverride[chunk.key] !== undefined ? chunkImageOverride[chunk.key] ?? undefined : chunk.image_path ? imagesByPath.get(chunk.image_path) : undefined}
            onUpdateChunk={onUpdateChunk}
            onChunkImage={onChunkImage}
          />
        ))}
        {skill.chunks.length === 0 && <p className="text-sm text-[#8CA39C]">لا توجد قطع محتوى لهذه المهارة في الملف.</p>}
      </div>
    </div>
  );
}

function ChunkCard({
  chunk,
  imageFile,
  onUpdateChunk,
  onChunkImage,
}: {
  chunk: DraftChunk;
  imageFile: File | undefined;
} & Pick<DraftMutators, "onUpdateChunk" | "onChunkImage">) {
  const isPractice = chunk.chunk_type === "practice";
  const imageUrl = useObjectUrl(imageFile);
  const update = (patch: Partial<DraftChunk>) => onUpdateChunk(chunk.key, patch);

  return (
    <div className="divide-y divide-[#E7F2ED] rounded-lg bg-[#F3F7F5] px-3">
      <div className="py-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {CHUNK_TYPES.map((type) => (
            <Pill key={type.id} active={chunk.chunk_type === type.id} onClick={() => update({ chunk_type: type.id })}>
              {type.label}
            </Pill>
          ))}
        </div>
        <EditableText value={chunk.title} onCommit={(title) => update({ title })} placeholder="بلا عنوان" className="mt-1.5 font-bold text-[#12302B]" />
        <EditableTextarea value={chunk.content} onCommit={(content) => update({ content })} placeholder="لا يوجد محتوى — اضغط للإضافة" />
      </div>

      {isPractice && (
        <div className="grid gap-2 py-2 sm:grid-cols-2">
          <div>
            <p className="text-xs font-bold text-[#4C6A63]">الإجابة الصحيحة</p>
            <EditableText value={chunk.correct_answer} onCommit={(correct_answer) => update({ correct_answer })} placeholder="—" className="text-sm" dir="auto" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#4C6A63]">الخيارات (مفصولة بـ ،)</p>
            <EditableText value={chunk.options} onCommit={(options) => update({ options })} placeholder="—" className="text-sm" dir="auto" />
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#4C6A63]">الصعوبة:</span>
          <DifficultyStars value={chunk.difficulty} onChange={(difficulty) => update({ difficulty })} />
        </div>
        {isPractice && (
          <>
            <label className="flex items-center gap-1.5 text-xs font-bold text-[#4C6A63]">
              النقاط
              <input className="fatin-field !h-8 w-16" type="number" min={1} max={10} value={chunk.points} onChange={(event) => update({ points: Number(event.target.value) })} />
            </label>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-[#4C6A63]">الحد الزمني:</span>
              {TIME_PRESETS.map((seconds) => (
                <Pill key={seconds} active={chunk.time_limit === seconds} onClick={() => update({ time_limit: seconds })}>
                  {formatTime(seconds)}
                </Pill>
              ))}
              <input className="fatin-field !h-8 w-20" type="number" min={10} value={chunk.time_limit} onChange={(event) => update({ time_limit: Number(event.target.value) })} />
            </div>
          </>
        )}
      </div>

      <div className="space-y-2 py-2">
        <div className="space-y-2 rounded-lg bg-white p-2">
          {imageUrl && <img src={imageUrl} alt={chunk.title || "صورة القطعة"} className="mx-auto max-h-40 rounded-lg border border-[#E7F2ED] object-contain" />}
          <div className="flex flex-wrap items-center gap-2">
            <label className="cursor-pointer rounded-full border border-[#0F5C47] px-3 py-1 text-xs font-extrabold text-[#0F5C47]">
              <input type="file" accept="image/*" className="hidden" onChange={(event) => onChunkImage(chunk.key, event.target.files?.[0] ?? null)} />
              {imageFile ? "تغيير الصورة" : "رفع صورة"}
            </label>
            {imageFile && (
              <button type="button" onClick={() => onChunkImage(chunk.key, null)} className="rounded-full border border-[#C4564A] px-3 py-1 text-xs font-extrabold text-[#C4564A]">
                إزالة الصورة
              </button>
            )}
            {chunk.image_path && (
              <span className="text-[11px] text-[#8CA39C]" dir="ltr">{chunk.image_path}</span>
            )}
          </div>
          {chunk.image_path && !imageFile && <span className="text-xs text-[#8A5A00]">🖼 صورة ناقصة من المجلد — يمكنك رفعها هنا</span>}
        </div>
        <div className="flex items-center gap-2 text-sm text-[#4C6A63]">
          <Checkbox checked={chunk.needs_image} onChange={(needs_image) => update({ needs_image })} size="sm" ariaLabel="هذه القطعة تحتاج صورة" />
          <span>هذه القطعة تحتاج صورة ولم تُرفع بعد</span>
        </div>
        {chunk.needs_image && (
          <EditableTextarea value={chunk.image_note} onCommit={(image_note) => update({ image_note })} placeholder="وصف الرسم المطلوب رفعه لاحقًا" rows={1} />
        )}
      </div>
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
  chunkImageOverride: Record<string, File | null>,
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
        // L'override posé en révision (upload/suppression manuelle) prime
        // toujours sur la résolution automatique par image_path.
        const imageFile = chunkImageOverride[chunk.key] !== undefined
          ? chunkImageOverride[chunk.key] ?? undefined
          : chunk.image_path ? imagesByPath.get(chunk.image_path) : undefined;
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
