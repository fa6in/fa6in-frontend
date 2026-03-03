

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
    wilaya_id:number
};




export type StudentUser = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "student";
  phone_number: string;
  profile_image: string | null;
  grade: number;
  school: string;
  date_joined: string; // ISO date
  last_login: string | null;
  is_active: boolean;
};

export type Student = {
  id: number;
  user: StudentUser;
  parent_name: string;
  parent_phone: string;
  address: string;
  enrollment_date: string; // YYYY-MM-DD
};

export type StudentsResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Student[];
};
