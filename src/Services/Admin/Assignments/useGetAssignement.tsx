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

const fetchAssignmentActivities = async (
  studentId: number,
  skillId: number
): Promise<Activity[]> => {
  const { data } = await api.get(`/api/students/${studentId}/next-action/`, {
    params: { skill: skillId },
  });
  return data;
};

const useGetAssignmentActivity = (studentId: number, skillId: number) => {
  return useQuery({
    queryKey: ['assignmentActivities', studentId, skillId],
    queryFn: () => fetchAssignmentActivities(studentId, skillId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    enabled: !!studentId && !!skillId, // ne s'exécute que si les deux sont définis
  });
};

export default useGetAssignmentActivity;
