// Services/Students/useSubmitAnswer.ts
import { useMutation } from '@tanstack/react-query';
import api from '../../../Auth-service/axios';

export interface SubmitAnswerPayload {
    studentId: number;
    chunk_id: number;
    answer: string;
    time_taken: number;
}

export interface SubmitAnswerResponse {
    is_correct: boolean;
    error_type: string | null;
    error_detail: string | null;
    progress: {
        attempts: number;
        correct_count: number;
        mastery: number;
        consecutive_correct: number;
        status: string;
    };
}

const useSubmitAnswer = () => {
    return useMutation<SubmitAnswerResponse, unknown, SubmitAnswerPayload>({
        mutationFn: async ({ studentId, chunk_id, answer, time_taken }) => {
            const { data } = await api.post(`/api/students/${studentId}/answer/`, {
                chunk_id,
                answer,
                time_taken,
            });
            return data;
        },
    });
};

export default useSubmitAnswer;