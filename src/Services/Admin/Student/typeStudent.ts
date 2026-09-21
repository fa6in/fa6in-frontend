export type AddPersonne = {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    password: string;
    password_confirm: string;
    phone_number: string;
    grade?: number;
    school: string;
    wilaya_id: number;
};

export type StudentProfile = {
  id: number;
  user: number;
  level: number | null;
  address: string | null;
  enrollment_date: string; // YYYY-MM-DD
  parent_name: string;
  parent_phone: string;
};

// NOTE: the backend does NOT nest student fields under a `user` key.
// Each item in `results` IS the user, with `student_profile` nested inside it.
export type Student = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "student";
  wilaya: number | null;
  wilaya_name?: string;
  phone_number: string;
  profile_image: string | null;
  date_of_birth: string | null;
  school: string;
  is_active: boolean;
  date_joined: string; // ISO date
  last_login: string | null;
  student_profile: StudentProfile | null;
  teacher_profile: unknown | null;
};

export type StudentsResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Student[];
};
