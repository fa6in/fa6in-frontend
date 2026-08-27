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
      className="mb-5 rounded-2xl border border-[#e5eee8] shadow-sm"
      styles={{ body: { padding: "16px 20px" } }}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
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
