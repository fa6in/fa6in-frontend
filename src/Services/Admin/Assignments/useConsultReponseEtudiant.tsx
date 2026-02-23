import { useQuery } from '@tanstack/react-query';
import api from '../../../Auth-service/axios';

export type ResponseEtudiant = {
    id: number;
    activity_title: string;
    activity_type: 'multiple_choice' | 'true_false' | 'fill_blank';
    student_name: string;
    answer: number | string;
    is_correct: boolean;
    score: number;
    time_taken: number;
    attempted_at: string;
    student: string;
    activity: number;
};

export const CONSULT_RESPONSE_KEY = ['consultResponseEtudiant'];

const fetchConsult = async (activityId: number): Promise<ResponseEtudiant[]> => {
    const { data } = await api.get(
        `/api/assessment/activities/${activityId}/attempts/`
    );
    return data;
};

const useConsultResponseEtudiant = (activityId: number) => {
    return useQuery({
        queryKey: [...CONSULT_RESPONSE_KEY, activityId],
        queryFn: () => fetchConsult(activityId),
        enabled: !!activityId, // seulement si activityId existe
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
};

export default useConsultResponseEtudiant;

