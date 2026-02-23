
import { useQuery } from '@tanstack/react-query';
import api from '../../../Auth-service/axios';

export type ActivityAllType = {
    id: number;
    activity_title: string;
    activity_type: string;
    student_name: string;
    answer: string;
    is_correct: false,
    score: number,
    time_taken: number,
    attempted_at: string,
    student: number,
    activity: number

}
export const ALL_ACTIVITY_ETUDIANT_KEY = ['allactivityEtudiant'];

const fetchAssignmentActivities = async (): Promise<ActivityAllType[]> => {
    const { data } = await api.get(`api/assessment/attempts/`);
    return data;
};

const useGetAllActivityEtudiant = () => {
    return useQuery({
        queryKey: ALL_ACTIVITY_ETUDIANT_KEY,
        queryFn: fetchAssignmentActivities,
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
    });
};

export default useGetAllActivityEtudiant;

