import { Select } from "antd";
import type { SelectProps } from "antd";

export type RelationItem = {
  id: number;
  label: string;
  description?: string;
};

export function toRelationItems<T extends { id?: number }>(
  items: T[],
  getLabel: (item: T) => string,
  getDescription?: (item: T) => string | undefined
): RelationItem[] {
  return items
    .filter((item): item is T & { id: number } => item.id != null)
    .map((item) => ({
      id: item.id,
      label: getLabel(item),
      description: getDescription?.(item),
    }));
}

export function getRelationLabel(
  items: RelationItem[],
  id: number | null | undefined
): string {
  if (id == null) return "—";
  return items.find((item) => item.id === id)?.label ?? `#${id}`;
}

/** Normalize API FK values (id number or nested { id }). */
export function normalizeRelationId(value: unknown): number | undefined {
  if (value == null) return undefined;
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) {
    return Number(value);
  }
  if (typeof value === "object" && value !== null && "id" in value) {
    const id = (value as { id?: number }).id;
    return typeof id === "number" ? id : undefined;
  }
  return undefined;
}

type RelationSelectProps = Omit<SelectProps, "options"> & {
  items: RelationItem[];
  loading?: boolean;
};

export default function RelationSelect({
  items,
  loading,
  placeholder,
  showSearch = true,
  optionFilterProp = "label",
  allowClear = false,
  size = "large",
  className = "w-full",
  ...rest
}: RelationSelectProps) {
  return (
    <Select
      placeholder={placeholder}
      loading={loading}
      showSearch={showSearch}
      optionFilterProp={optionFilterProp}
      allowClear={allowClear}
      size={size}
      className={className}
      options={items.map((item) => ({
        value: item.id,
        label: item.label,
      }))}
      {...rest}
    />
  );
}
