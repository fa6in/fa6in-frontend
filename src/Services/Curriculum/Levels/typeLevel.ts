export type Level = {
  id?: number;
  code: string;
  name: string;
  stage: number | { id: number; name?: string; code?: string };
  order_index: number;
  description?: string;
};
