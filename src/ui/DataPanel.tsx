import type { ReactNode } from "react";
import { Card } from "antd";

type DataPanelProps = {
  title?: string;
  extra?: ReactNode;
  children: ReactNode;
  loading?: boolean;
};

export default function DataPanel({
  title,
  extra,
  children,
  loading,
}: DataPanelProps) {
  return (
    <Card
      title={title}
      extra={extra}
      loading={loading}
      bordered={false}
      className="rounded-2xl border border-[#e5eee8] shadow-sm"
      styles={{
        header: {
          borderBottom: "1px solid #eef4f0",
          fontWeight: 700,
          color: "#12261b",
        },
        body: { padding: title ? "0" : "20px" },
      }}
    >
      {children}
    </Card>
  );
}
