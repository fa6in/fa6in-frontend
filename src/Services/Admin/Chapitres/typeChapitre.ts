

export type typeChapitre = {
    id?: number;
    subject: number;
    subject_name?: string;
    code?: string;
    title: string;
    description?: string;
    central_question?: string;
    learning_objective?: string;
    duration_minutes?: number;
    difficulty?: string;
    order?: number;
    order_index?: number;
    // thumbnail: string;
    thumbnail?: File | string | null;
    video_url?: string;
    audio_url?: string;
    is_published: boolean;
    created_by?: number;
    created_by_name?: string;
    created_at?: string;
    updated_at?: string;
    activity_count?: number;
}