

export type AddTeacher = {
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
};




export type TeacherUser = {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: "teacher";
    phone_number: string;
    profile_image: string | null;
    grade: number;
    school: string;
    date_joined: string; // ISO 8601 format
    last_login: string | null;
    is_active: boolean;
};




export type Teacher = {
    id: number;
    user: TeacherUser;
    subjects: string;
    years_of_experience: number;
    qualification: string;
    is_active: boolean;
};

export type TeachersResponse = {
    count: number;
    next: string | null;
    previous: string | null;
    results: Teacher[];
};