import { Card, Statistic } from "antd";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

type StatCardProps = {
  title: string;
  value: number | string;
  icon?: ReactNode;
  suffix?: string;
  color?: string;
  loading?: boolean;
  trend?: string;
};

export default function StatCard({
  title,
  value,
  icon,
  suffix,
  color = "#0F5C47",
  loading,
  trend,
}: StatCardProps) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Card
        loading={loading}
        bordered={false}
        className="group h-full rounded-2xl border-0 shadow-[0_1px_6px_rgba(0,0,0,0.06)]"
        styles={{ body: { padding: "20px 22px" } }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Statistic
              title={
                <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                  {title}
                </span>
              }
              value={value}
              suffix={suffix}
              valueStyle={{
                color: "#0F5C47",
                fontWeight: 800,
                fontSize: 28,
                lineHeight: 1.2,
              }}
            />
            {trend && (
              <p className="mt-2 text-xs font-medium text-main-color">{trend}</p>
            )}
          </div>
          {icon && (
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg transition-transform group-hover:scale-105"
              style={{ backgroundColor: `${color}14`, color }}
            >
              {icon}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
