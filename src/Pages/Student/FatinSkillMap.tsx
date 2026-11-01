import { Link, useParams } from "react-router-dom";
import { useSkillMap } from "../../Services/Fatin/useStudentLearning";
import type { MapSkill } from "../../Services/Fatin/types";
import { useFatinChrome } from "../../ui/FatinChrome";
import { Chip, EmptyNote, Loading, SKILL_STATUS, StudentBanner, pct } from "./fatinStudentUi";

function skillCaption(skill: MapSkill) {
  if (skill.status === "mastered") return `متقنة ${pct(skill.mastery)}٪`;
  if (skill.status === "in_progress") return `قيد التقدم ${pct(skill.mastery)}٪`;
  if (skill.status === "locked" && skill.locked_by.length) {
    return `يتطلب: ${skill.locked_by.map((item) => item.name).join("، ")}`;
  }
  return SKILL_STATUS[skill.status].label;
}

function NodeIcon({ status }: { status: MapSkill["status"] }) {
  if (status === "mastered") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 12l5 5 9-10" />
      </svg>
    );
  }
  if (status === "locked") {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 11h12v9H6zM8 11V8a4 4 0 018 0v3" />
      </svg>
    );
  }
  return <span>{status === "in_progress" ? "●" : "▶"}</span>;
}

// Écran S3 du design : chemin des skills d'une unité, avec verrouillage.
export default function FatinSkillMap() {
  const { unitId } = useParams();
  const { data, isLoading } = useSkillMap(Number(unitId));
  useFatinChrome({ subtitle: data ? `${data.subject.name} › ${data.unit.code}` : "" });

  if (isLoading || !data) return <Loading />;
  const skills = data.lessons.flatMap((lesson) => lesson.skills.map((skill) => ({ skill, lesson })));

  return (
    <div className="pb-6">
      <StudentBanner kicker={`${data.subject.name} › ${data.unit.code}`} title="خريطة المهارات" />
      <div className="space-y-3 px-4 pt-4 lg:px-7">
        <div className="flex flex-wrap gap-2">
          {(["mastered", "in_progress", "locked"] as const).map((status) => (
            <Chip key={status} bg={SKILL_STATUS[status].bg} fg={SKILL_STATUS[status].fg}>
              {SKILL_STATUS[status].label}
            </Chip>
          ))}
        </div>

        {skills.length === 0 && <EmptyNote>لا توجد مهارات منشورة في هذه الوحدة.</EmptyNote>}

        <div className="flex flex-col px-1 py-2 lg:max-w-xl">
          {skills.map(({ skill, lesson }, index) => {
            const style = SKILL_STATUS[skill.status];
            const firstOfLesson = index === 0 || skills[index - 1].lesson.id !== lesson.id;
            const node = (
              <div className="flex items-center gap-3">
                <div
                  className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-full text-white"
                  style={{ background: style.dot, boxShadow: `0 0 0 5px ${style.bg}` }}
                >
                  <NodeIcon status={skill.status} />
                </div>
                <div>
                  <div className="text-[15px] font-extrabold text-[#12302B]">{skill.name}</div>
                  <div className="text-xs text-[#4C6A63]">{skillCaption(skill)}</div>
                </div>
              </div>
            );
            return (
              <div key={skill.id}>
                {firstOfLesson && (
                  <p className="mb-2 mt-1 text-xs font-bold text-[#8CA39C]">
                    {lesson.code} · {lesson.title}
                  </p>
                )}
                {index > 0 && !firstOfLesson && (
                  <div
                    className="ms-[25px] h-[22px] w-[3px]"
                    style={{ background: skills[index - 1].skill.status === "mastered" ? "#1B7F5C" : "#DCE8E3" }}
                  />
                )}
                <div className={`flex ${index % 2 ? "justify-end" : "justify-start"}`}>
                  {skill.status === "locked" ? (
                    <div className="cursor-not-allowed" aria-disabled="true">{node}</div>
                  ) : (
                    <Link to={`/learn/${skill.id}`} state={{ unitId: data.unit.id }}>{node}</Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
