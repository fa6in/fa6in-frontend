

export type TypeContent = {
    id?: number|string;
    code: string;
    title: string;
    content: string;
    is_published: boolean;
    goals_complete?: boolean;
    content_type?: string;
    order?: number;
    order_index?: number;
    metadata?: {
        font_size: string;
        has_quiz: boolean;
        duration: number;
        alt_text?: string;
    };
    unit: number|string|{ id: number; code?: string; title?: string };
};

export function getContentUnitId(unit: TypeContent["unit"] | undefined): number|string|undefined {
    return typeof unit === "object" ? unit?.id : unit;
}