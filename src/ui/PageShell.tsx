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
    <div className="mx-auto max-w-[1600px] p-4 md:p-6 lg:p-8">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a3d24] via-main-color to-emerald-500 p-6 text-white shadow-card md:p-8"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -end-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 start-1/3 h-48 w-48 rounded-full bg-secondary-color/20 blur-3xl"
        />

        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            {icon && (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-2xl backdrop-blur-sm">
                {icon}
              </div>
            )}
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                Ed-Tech
              </p>
              <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/85 md:text-base">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {extra && <div className="flex flex-wrap gap-2">{extra}</div>}
        </div>
      </motion.div>

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
