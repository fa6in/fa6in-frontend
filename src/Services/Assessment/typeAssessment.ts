export type AssessmentError = {
  id?: number;
  skill: number;
  category: string;
  error_type: string;
  code: string;
  root_cause: string;
  severity_level: string;
};

export type LogAnswerParams = {
  student: number;
  skill: number;
  chunk: number;
  is_correct: boolean;
  response_time: number;
  answer: number;
  error_type?: string;
  error_detail?: number;
};

export type ProgressParams = {
  skill?: number;
};
