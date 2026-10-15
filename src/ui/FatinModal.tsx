import type { ReactNode } from "react";

type FatinModalProps = {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  okText: string;
  onOk?: () => void;
  cancelText?: string;
  loading?: boolean;
  wide?: boolean;
};

export default function FatinModal({
  open,
  title,
  subtitle,
  onClose,
  children,
  okText,
  onOk,
  cancelText = "إلغاء",
  loading,
  wide,
}: FatinModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-[#12302B]/50 p-4" onClick={onClose}>
      <div
        dir="rtl"
        onClick={(event) => event.stopPropagation()}
        className={`max-h-[92vh] w-full overflow-auto rounded-2xl bg-white p-4 shadow-2xl sm:rounded-[28px] sm:p-5 ${wide ? "max-w-[760px]" : "max-w-[640px]"}`}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <button type="button" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full text-xl text-[#4C6A63]" aria-label="إغلاق">
            ×
          </button>
          <div className="text-end">
            <h2 className="text-xl font-extrabold text-[#12302B]">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-[#4C6A63]">{subtitle}</p>}
          </div>
        </div>
        {children}
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-start">
          <button
            type="button"
            disabled={loading}
            onClick={onOk}
            className="rounded-full bg-[#0F5C47] px-5 py-2.5 text-sm font-extrabold text-white disabled:opacity-60"
          >
            {loading ? "..." : okText}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#0F5C47] px-5 py-2.5 text-sm font-extrabold text-[#0F5C47]"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}
