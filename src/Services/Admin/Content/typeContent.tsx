

export type ContentStage = {
    id: number;
    name?: string;
    code?: string;
    order_index?: number;
    description?: string;
};

export type ContentLevel = {
    id: number;
    name?: string;
    code?: string;
    stage?: ContentStage;
    stage_name?: string;
    description?: string;
};

export type ContentSubject = {
    id: number;
    name?: string;
    level?: ContentLevel;
    level_name?: string;
    description?: string;
    code?: string;
};

export type ContentUnit = {
    id: number;
    code?: string;
    title?: string;
    subject?: ContentSubject;
    subject_name?: string;
    order_index?: number;
    is_published?: boolean;
    thumbnail?: string | null;
    lessons_count?: number;
};

export type TypeContent = {
    id?: number|string;
    code: string;
    title: string;
    description?: string;
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
    unit: number|string|ContentUnit;
};

export function getContentUnitId(unit: TypeContent["unit"] | undefined): number|string|undefined {
    return typeof unit === "object" ? unit?.id : unit;
}