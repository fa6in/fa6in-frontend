import { motion } from "framer-motion";
import type { ReactNode } from "react";

type PageShellProps = {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  extra?: ReactNode;
  children: ReactNode;
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function PageShell({
  title,
  subtitle,
  icon,
  extra,
  children,
}: PageShellProps) {
  return (
    <div aria-label={title} className="mx-auto max-w-[1400px] px-4 pb-8 md:px-7">
      {(subtitle || extra || icon) && (
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E7F2ED] text-lg text-main-deep">
              {icon}
            </div>
          )}
          {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
        </div>
        {extra && <div className="flex flex-wrap gap-2">{extra}</div>}
      </motion.div>
      )}

      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.08 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
