

export type TypeContent = {
    id?: number|string;
    title: string;
    content_type: string;
    content: string;
    order: number;
    metadata: {
        font_size: string;
        has_quiz: boolean;
        duration: number;
        alt_text?: string;
    };
    unit: number|string;
};