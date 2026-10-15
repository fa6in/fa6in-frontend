import type { ReactNode } from "react";
import { Card } from "antd";

type PageToolbarProps = {
  search?: ReactNode;
  filters?: ReactNode;
  actions?: ReactNode;
};

export default function PageToolbar({ search, filters, actions }: PageToolbarProps) {
  return (
    <Card
      bordered={false}
      className="mb-4 rounded-2xl border-0 shadow-[0_1px_6px_rgba(0,0,0,0.06)]"
      styles={{ body: { padding: "14px 16px" } }}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          {search && <div className="w-full sm:max-w-sm">{search}</div>}
          {filters && (
            <div className="flex flex-wrap items-center gap-2">{filters}</div>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        )}
      </div>
    </Card>
  );
}
