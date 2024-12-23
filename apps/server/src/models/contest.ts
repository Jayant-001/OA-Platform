export interface Contest {
    id: string;
    title: string;
    description?: string;
    start_time: Date;
    duration: number;
    contest_code: string;
    join_duration: number;
    strict_time: boolean;
    created_by: string;
    created_at: Date;
    updated_at: Date;
}
