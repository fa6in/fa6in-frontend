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
      className="rounded-2xl border-0 shadow-[0_1px_6px_rgba(0,0,0,0.06)]"
      styles={{
        header: {
          borderBottom: "1px solid #eef4f0",
          fontWeight: 700,
          color: "#12302B",
        },
        body: { padding: title ? "0" : "20px" },
      }}
    >
      {children}
    </Card>
  );
}
