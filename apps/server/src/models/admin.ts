export interface Admin {
    id: string;
    name: string;
    role: string;
    email: string;
    password: string;
    organization?: string;
    created_at: Date;
    updated_at: Date;
}
