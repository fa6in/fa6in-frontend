

export type AddPersonne = {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: "student" | "teacher";
    password: string;
    password_confirm: string;
    phone_number: string;
    grade?: number;
    school: string;
};