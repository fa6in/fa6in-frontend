import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { message } from "antd";
import { useNextAction, useSubmitAnswer } from "../../Services/Fatin/useStudentLearning";
import { apiErrorText } from "../../Services/Fatin/apiErrorText";
import type { NextAction, SessionChunk, SessionContext, SubmitResult } from "../../Services/Fatin/types";
import { useFatinChrome } from "../../ui/FatinChrome";
import {
  BottomSheet,
  Chip,
  ERROR_LABEL,
  EmptyNote,
  Loading,
  PrimaryButton,
  SecondaryButton,
  StudentBanner,
  pct,
} from "./fatinStudentUi";

type Preload = { skillId: number; chunk: SessionChunk | null; session: SessionContext };

type Sheet =
  | { kind: "correct" }
  | { kind: "wrong"; result: SubmitResult }
  | { kind: "redirect"; skillName: string; attempts: number }
  | { kind: "mastered"; result: SubmitResult };

const STEPS = ["قاعدة", "مثال", "تمرين", "تمرين", "تطبيق"];

const INSTRUCTION: Record<string, string> = {
  rule: "اقرأ القاعدة جيدًا ثم اضغط «التالي».",
  example: "تابع المثال خطوة بخطوة ثم اضغط «التالي».",
  practice: "اختر الإجابة الصحيحة ثم اضغط «تحقق».",
  practice_free: "اكتب إجابتك ثم اضغط «تحقق».",
};

const CHUNK_TITLE: Record<string, string> = {
  rule: "القاعدة",
  example: "مثال",
  error: "خطأ شائع",
  hint: "تلميح",
  real_life: "تطبيق",
};

function stepState(session: SessionContext, chunk: SessionChunk | null) {
  const p = session.progress;
  const mastered = p.status === "mastered";
  const done = [p.rule_seen, p.example_seen, p.consecutive_correct >= 1 || mastered, p.consecutive_correct >= 2 || mastered, mastered];
  let current = 4;
  if (!mastered && chunk) {
    if (chunk.chunk_type === "rule") current = 0;
    else if (chunk.chunk_type === "example") current = 1;
    else current = Math.min(2 + p.consecutive_correct, 3);
  }
  return { done, current };
}

// Écrans S4 → S7 du design : séance pilotée par le Decision Engine
// (next-action), avec fiche d'erreur, redirection vers un prérequis et
// célébration de la maîtrise.
export default function FatinLearnSession() {
  const { skillId: rawSkillId } = useParams();
  const skillId = Number(rawSkillId);
  const navigate = useNavigate();
  const location = useLocation();
  const preload = (location.state as { preload?: Preload } | null)?.preload;

  const nextAction = useNextAction();
  const submit = useSubmitAnswer();
  const [chunk, setChunk] = useState<SessionChunk | null>(null);
  const [session, setSession] = useState<SessionContext | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [answer, setAnswer] = useState("");
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [ruleReminder, setRuleReminder] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startedAt = useRef(Date.now());
  const pendingRedirect = useRef<Extract<NextAction, { action: "redirect_to_prerequisite" }> | null>(null);

  useFatinChrome({ subtitle: session ? session.skill.name : "" });

  const showChunk = useCallback((next: SessionChunk | null, context: SessionContext) => {
    setChunk(next);
    setSession(context);
    setAnswer("");
    setShowHint(false);
    setRuleReminder(null);
    setLoaded(true);
    startedAt.current = Date.now();
    setElapsed(0);
  }, []);

  const { mutate: fetchNext } = nextAction;
  const loadNext = useCallback(() => {
    fetchNext(skillId, {
      onSuccess: (data) => {
        if (data.action === "redirect_to_prerequisite") {
          pendingRedirect.current = data;
          setLoaded(true);
          setSheet({ kind: "redirect", skillName: data.new_skill.name, attempts: data.previous_skill.attempts });
          return;
        }
        setSheet(null);
        showChunk(data.chunk, data.session);
      },
      onError: (error) => {
        setLoaded(true);
        message.error(apiErrorText(error));
      },
    });
  }, [fetchNext, skillId, showChunk]);

  // Arrivée sur la page : contenu déjà servi par une redirection, sinon
  // on demande au Decision Engine quoi afficher.
  useEffect(() => {
    setSheet(null);
    setLoaded(false);
    pendingRedirect.current = null;
    if (preload && preload.skillId === skillId) showChunk(preload.chunk, preload.session);
    else loadNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skillId]);

  useEffect(() => {
    const timer = window.setInterval(() => setElapsed(Math.round((Date.now() - startedAt.current) / 1000)), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const mapPath = session ? `/units/${session.breadcrumb.unit_id}` : "/matieres";

  const check = () => {
    if (!chunk || !answer.trim()) return;
    submit.mutate(
      { chunk_id: chunk.id, answer: answer.trim(), time_taken: Math.round((Date.now() - startedAt.current) / 1000) },
      {
        onSuccess: (result) => {
          setSession(result.session);
          if (result.mastered_now) setSheet({ kind: "mastered", result });
          else if (result.redirect) setSheet({ kind: "redirect", skillName: result.redirect.skill.name, attempts: result.redirect.attempts });
          else if (!result.is_correct) setSheet({ kind: "wrong", result });
          else setSheet({ kind: "correct" });
        },
        onError: (error) => message.error(apiErrorText(error)),
      },
    );
  };

  // "انتقل إلى المهارة" : next-action renvoie la règle du prérequis, qu'on
  // transmet à la page suivante pour qu'elle l'affiche en premier.
  const goToPrerequisite = () => {
    const open = (data: Extract<NextAction, { action: "redirect_to_prerequisite" }>) =>
      navigate(`/learn/${data.new_skill.id}`, {
        state: { preload: { skillId: data.new_skill.id, chunk: data.chunk, session: data.session } },
      });
    if (pendingRedirect.current) {
      open(pendingRedirect.current);
      return;
    }
    fetchNext(skillId, {
      onSuccess: (data) => (data.action === "redirect_to_prerequisite" ? open(data) : (setSheet(null), showChunk(data.chunk, data.session))),
      onError: (error) => message.error(apiErrorText(error)),
    });
  };

  if (!loaded) return <Loading />;

  const isPractice = chunk?.chunk_type === "practice";
  const options = chunk?.options?.filter(Boolean) ?? [];
  const steps = session ? stepState(session, chunk) : null;
  const threshold = session?.skill.mastery_threshold ?? 0.8;
  const progress = session?.progress;
  const remaining = chunk?.time_limit ? Math.max(0, chunk.time_limit - elapsed) : null;

  return (
    <div className="flex min-h-full flex-col pb-4" dir="rtl">
      {session ? (
        <StudentBanner
          kicker={`${session.breadcrumb.subject_name} › ${session.breadcrumb.unit_code} › ${session.breadcrumb.lesson_code.split("-").pop()}`}
          title={session.skill.name}
        >
          {steps && (
            <div className="mt-3">
              <div className="flex gap-1.5">
                {STEPS.map((label, index) => (
                  <div
                    key={`${label}-${index}`}
                    className="h-1.5 flex-1 rounded"
                    style={{ background: steps.done[index] ? "#E0A526" : index === steps.current ? "#fff" : "#ffffff55" }}
                  />
                ))}
              </div>
              <div className="mt-1 flex justify-between text-[11px]">
                {STEPS.map((label, index) => (
                  <span key={`${label}-${index}`} className={index === steps.current ? "font-extrabold" : ""}>
                    {label}
                    {steps.done[index] ? " ✓" : ""}
                  </span>
                ))}
              </div>
            </div>
          )}
        </StudentBanner>
      ) : (
        <StudentBanner kicker="مساري" title="جلسة تعلّم" />
      )}

      <div className="flex flex-1 flex-col gap-3 px-4 pt-4 lg:max-w-3xl lg:px-7">
        {!chunk && session && (
          <EmptyNote>لا يوجد محتوى لهذه الخطوة بعد. سيضيفه المعلم قريبًا.</EmptyNote>
        )}

        {chunk && (
          <>
            <div className="rounded-2xl bg-[#FFF4D6] px-4 py-3 text-[15px]">
              <b className="text-[#8A5A00]">المطلوب الآن: </b>
              {ruleReminder
                ? "راجع القاعدة ثم عُد إلى التمرين."
                : isPractice
                  ? options.length ? INSTRUCTION.practice : INSTRUCTION.practice_free
                  : INSTRUCTION[chunk.chunk_type] ?? INSTRUCTION.rule}
            </div>

            {ruleReminder ? (
              <section className="rounded-2xl bg-white p-4 shadow-[0_1px_6px_rgba(0,0,0,0.06)]">
                <div className="text-[13px] text-[#4C6A63]">القاعدة</div>
                <p className="mt-2 whitespace-pre-line text-lg leading-relaxed" dir="auto">{ruleReminder}</p>
              </section>
            ) : isPractice ? (
              <section className="rounded-2xl bg-white p-4 shadow-[0_1px_6px_rgba(0,0,0,0.06)]">
                <div className="flex justify-between text-[13px] text-[#4C6A63]">
                  <span>{chunk.title || "تمرين"}</span>
                  {remaining !== null && <span>{remaining} ثانية</span>}
                </div>
                <div className="my-4 whitespace-pre-line text-center text-[26px] font-extrabold" dir="auto">
                  {chunk.content}
                </div>
                {options.length ? (
                  <div className="grid grid-cols-2 gap-2.5" dir="ltr">
                    {options.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setAnswer(option)}
                        className={`min-h-14 rounded-xl border-2 text-xl ${answer === option ? "border-[#1B7F5C] bg-[#E3F4EC] font-extrabold" : "border-[#CFE0DA] bg-white font-semibold"}`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                ) : (
                  <input
                    className="fatin-field text-center text-xl"
                    dir="auto"
                    value={answer}
                    onChange={(event) => setAnswer(event.target.value)}
                    onKeyDown={(event) => event.key === "Enter" && check()}
                    placeholder="إجابتك"
                  />
                )}
              </section>
            ) : (
              <section className="rounded-2xl bg-white p-4 shadow-[0_1px_6px_rgba(0,0,0,0.06)]">
                <div className="text-[13px] text-[#4C6A63]">{chunk.title || CHUNK_TITLE[chunk.chunk_type]}</div>
                <p className="mt-2 whitespace-pre-line text-lg leading-relaxed" dir="auto">{chunk.content}</p>
              </section>
            )}

            {progress && (
              <section className="rounded-2xl bg-white p-4 shadow-[0_1px_6px_rgba(0,0,0,0.06)]">
                <div className="flex justify-between text-sm">
                  <span>مستوى الإتقان</span>
                  <b>
                    {pct(progress.mastery)}٪ / الهدف {pct(threshold)}٪
                  </b>
                </div>
                <div className="my-2 h-2.5 overflow-hidden rounded-lg bg-[#DCE8E3]">
                  <div className="h-full rounded-lg bg-[#1B7F5C]" style={{ width: `${Math.min(100, pct(progress.mastery))}%` }} />
                </div>
                <div className="text-[13px] text-[#4C6A63]">
                  صحيحة متتالية: {progress.consecutive_correct} من {session?.skill.required_consecutive_correct}
                  {progress.attempts < 3 && " · يُحسب الإتقان بعد 3 محاولات"}
                </div>
              </section>
            )}

            {isPractice && session?.hint && !ruleReminder && (
              showHint ? (
                <div className="rounded-2xl border-[1.5px] border-dashed border-[#B9776A] bg-white px-4 py-3 text-sm">
                  تلميح: {session.hint}
                </div>
              ) : (
                <button type="button" onClick={() => setShowHint(true)} className="self-start text-sm font-bold text-[#8A5A00]">
                  💡 عرض التلميح
                </button>
              )
            )}
          </>
        )}

        <div className="mt-auto pt-2">
          {!chunk ? (
            <SecondaryButton className="w-full" onClick={() => navigate(mapPath)}>
              العودة إلى الخريطة
            </SecondaryButton>
          ) : ruleReminder ? (
            <PrimaryButton className="w-full" onClick={() => setRuleReminder(null)}>
              عودة إلى التمرين
            </PrimaryButton>
          ) : isPractice ? (
            <PrimaryButton className="w-full" onClick={check} disabled={!answer.trim() || submit.isPending}>
              {submit.isPending ? "..." : "تحقق ← الخطوة التالية"}
            </PrimaryButton>
          ) : (
            <PrimaryButton className="w-full" onClick={loadNext} disabled={nextAction.isPending}>
              {nextAction.isPending ? "..." : "التالي ←"}
            </PrimaryButton>
          )}
        </div>
      </div>

      {sheet?.kind === "correct" && (
        <BottomSheet>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[#1B7F5C] font-extrabold text-white">✓</span>
            <div className="text-[19px] font-extrabold">إجابة صحيحة!</div>
          </div>
          <PrimaryButton onClick={loadNext} disabled={nextAction.isPending}>
            {nextAction.isPending ? "..." : "الخطوة التالية"}
          </PrimaryButton>
        </BottomSheet>
      )}

      {sheet?.kind === "wrong" && (
        <BottomSheet>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#B3392F] font-extrabold text-white">!</span>
            <div>
              <div className="text-[19px] font-extrabold">إجابة غير صحيحة</div>
              {sheet.result.error_type && (
                <Chip bg="#FDECEA" fg="#B3392F">{ERROR_LABEL[sheet.result.error_type]}</Chip>
              )}
            </div>
          </div>
          {sheet.result.feedback?.message && (
            <p className="text-[15px] leading-relaxed">السبب: {sheet.result.feedback.message}</p>
          )}
          {sheet.result.feedback?.example && (
            <div className="whitespace-pre-line rounded-2xl bg-[#F3F7F5] p-4 text-sm" dir="auto">
              مثال: {sheet.result.feedback.example}
            </div>
          )}
          <div className="flex gap-2.5">
            <PrimaryButton
              className="flex-1"
              onClick={() => {
                setSheet(null);
                setAnswer("");
                startedAt.current = Date.now();
              }}
            >
              حاول مرة أخرى
            </PrimaryButton>
            {sheet.result.feedback?.rule && (
              <SecondaryButton
                className="flex-1"
                onClick={() => {
                  setRuleReminder(sheet.result.feedback?.rule ?? null);
                  setSheet(null);
                  setAnswer("");
                }}
              >
                أعد القاعدة
              </SecondaryButton>
            )}
          </div>
        </BottomSheet>
      )}

      {sheet?.kind === "redirect" && (
        <BottomSheet>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#E0A526] text-lg font-extrabold text-white">↩</span>
            <div>
              <div className="text-sm text-[#4C6A63]">تحتاج أولًا إلى إتقان:</div>
              <div className="text-[19px] font-extrabold">{sheet.skillName}</div>
            </div>
          </div>
          <p className="text-[15px] leading-relaxed text-[#4C6A63]">
            {sheet.attempts} محاولات بإتقان أقل من 50٪ — سنراجع الأساس أولًا ثم نعود إلى هنا.
          </p>
          <div className="flex gap-2.5">
            <PrimaryButton className="flex-1" onClick={goToPrerequisite} disabled={nextAction.isPending}>
              انتقل إلى المهارة
            </PrimaryButton>
            <SecondaryButton className="flex-1" onClick={() => navigate(mapPath)}>
              ليس الآن
            </SecondaryButton>
          </div>
        </BottomSheet>
      )}

      {sheet?.kind === "mastered" && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-[#0b1f1a]/70 p-4" dir="rtl">
          <div className="flex w-full max-w-[340px] flex-col items-stretch gap-3 rounded-[22px] bg-white p-6 text-center">
            <span className="mx-auto grid h-[72px] w-[72px] place-items-center rounded-full bg-[#1B7F5C] text-2xl font-extrabold text-white">✓</span>
            <div className="text-[22px] font-extrabold">أتقنت المهارة!</div>
            <div className="flex flex-wrap justify-center gap-2">
              <Chip bg="#E3F4EC" fg="#1B7F5C">إتقان {pct(sheet.result.progress.mastery)}٪</Chip>
              <Chip bg="#E3F4EC" fg="#1B7F5C">{sheet.result.progress.consecutive_correct} متتالية</Chip>
              {!!sheet.result.points && <Chip bg="#FFF4D6" fg="#8A5A00">+{sheet.result.points} نقطة</Chip>}
            </div>
            {sheet.result.next_skill ? (
              <>
                <div className="text-sm text-[#4C6A63]">المهارة التالية فُتحت لك: {sheet.result.next_skill.name}</div>
                <PrimaryButton onClick={() => navigate(`/learn/${sheet.result.next_skill!.id}`)}>المهارة التالية ←</PrimaryButton>
              </>
            ) : (
              <div className="text-sm text-[#4C6A63]">أكملت كل المهارات المتاحة حاليًا 🎉</div>
            )}
            <SecondaryButton onClick={() => navigate(mapPath)}>العودة إلى الخريطة</SecondaryButton>
          </div>
        </div>
      )}
    </div>
  );
}
