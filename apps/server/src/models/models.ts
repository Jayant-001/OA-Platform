export interface Admin {
    id: string;
    name: string;
    role: "admin" | "panel";
    email: string;
    password: string;
    organization?: string;
    created_at: string;
    updated_at: string;
}
