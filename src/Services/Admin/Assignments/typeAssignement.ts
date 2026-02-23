


export type Activitytype  = {
  id?: number;
//   unit_title: string;
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