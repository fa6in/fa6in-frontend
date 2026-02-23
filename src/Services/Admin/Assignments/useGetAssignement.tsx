import { useQuery } from '@tanstack/react-query';
import api from '../../../Auth-service/axios';

interface Activity {
  id: number;
  unit_title: string;
  title: string;
  activity_type: 'multiple_choice' | 'true_false' | 'fill_blank';
  question: string;
  options?: string[];
  correct_answer: number | string;
  points: number;
  explanation?: string;
  time_limit?: number;
  order: number;
  is_active: boolean;
  unit: number;
}
export const ASSIGNEMENT_KEY = ['assignmentActivities'];

const fetchAssignmentActivities = async (unitId: number): Promise<Activity[]> => {
  const { data } = await api.get(`/api/assessment/units/${unitId}/activities/`);
  return data;
};

const useGetAssignmentActivity = (unitId: number) => {
  return useQuery({
    queryKey: ['assignmentActivities', unitId],
    queryFn: () => fetchAssignmentActivities(unitId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    enabled: !!unitId, // Ne s'exécute que si unitId est défini
  });
};

export default useGetAssignmentActivity;