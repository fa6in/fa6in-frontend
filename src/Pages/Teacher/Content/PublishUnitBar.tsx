import { useState } from "react";
import { message } from "antd";
import { useQueryClient } from "@tanstack/react-query";
import api from "../../../Auth-service/axios";
import { API_ENDPOINTS } from "../../../api/endpoints";
import { CONTENT_KEY, useContentLessons, useContentUnit } from "../../../Services/Fatin/useTeacherContent";
import { apiErrorText } from "../../../Services/Fatin/apiErrorText";
import type { PublicationCheck } from "../../../Services/Fatin/types";
import FatinModal from "../../../ui/FatinModal";

type Props = { unitId: number | null; onDone?: () => void };

// Bannière persistante (visible à chaque étape de l'éditeur) pour publier en
// un clic toutes les leçons prêtes d'une unité, puis l'unité elle-même. Le
// backend n'a pas d'action de publication groupée : on vérifie et publie
// chaque leçon non publiée une par une.
export default function PublishUnitBar({ unitId, onDone }: Props) {
  const { data: unit } = useContentUnit(unitId);
  const { data: lessons = [] } = useContentLessons(unitId);
  const [confirm, setConfirm] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const queryClient = useQueryClient();

  const unpublishedLessons = lessons.filter((item) => !item.is_published);
  if (!unitId || unpublishedLessons.length === 0) return null;

  const publishAll = async () => {
    setPublishing(true);
    let publishedCount = 0;
    const skipped: string[] = [];
    try {
      for (const item of unpublishedLessons) {
        const { data: itemCheck } = await api.get<PublicationCheck>(API_ENDPOINTS.content.lessonCheck(item.id));
        if (itemCheck.ready) {
          await api.post(API_ENDPOINTS.content.lessonPublish(item.id));
          publishedCount += 1;
        } else {
          skipped.push(item.title);
        }
      }
      if (!unit?.is_published) {
        await api.post(API_ENDPOINTS.content.unitPublish(unitId));
      }
      if (publishedCount > 0 || !unit?.is_published) {
        message.success(`تم نشر ${publishedCount} درسًا والوحدة بالكامل`);
      }
      if (skipped.length > 0) {
        message.warning(`لم يُنشر لعدم الجاهزية: ${skipped.join("، ")}`);
      }
      await queryClient.invalidateQueries({ queryKey: CONTENT_KEY });
      setConfirm(false);
      onDone?.();
    } catch (error) {
      message.error(apiErrorText(error));
    } finally {
      setPublishing(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 rounded-full bg-[#0F5C47] py-1 ps-3 pe-1">
        <span className="text-xs font-bold text-white">
          {unpublishedLessons.length} درسًا غير منشور
        </span>
        <button
          type="button"
          onClick={() => setConfirm(true)}
          className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-[#0F5C47]"
        >
          نشر الوحدة كاملة
        </button>
      </div>

      <FatinModal
        open={confirm}
        title="نشر الوحدة كاملة؟"
        subtitle={unit?.title}
        onClose={() => setConfirm(false)}
        okText="نشر الكل"
        loading={publishing}
        onOk={publishAll}
      >
        <p className="text-sm leading-relaxed text-[#4C6A63]">
          {`سيُنشر كل درس جاهز من بين ${unpublishedLessons.length} درسًا غير منشور، ثم تُنشر الوحدة. الدروس غير الجاهزة (ناقصة البنود) لن تُنشر وستظهر لك بعد المحاولة.`}
        </p>
      </FatinModal>
    </>
  );
}
