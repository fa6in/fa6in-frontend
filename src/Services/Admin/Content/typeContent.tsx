

export type TypeContent = {
    id: number;
    title: string;
    content_type: string;
    content: string;
    order: number;
    metadata: {
        font_size: string;
        has_quiz: boolean;
    };
    unit: number;
};