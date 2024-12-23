export interface User {
    id: string;
    email: string;
    name: string;
    role: "user" | "admin";
}

// export interface Contest {
//   id: string;
//   title: string;
//   description: string;
//   startTime: Date;
//   duration: number;
//   rules: string[];
//   problemCount: number;
//   status: 'upcoming' | 'live' | 'past';
// }

export interface Contest {
    id: string;
    title: string; // Contest title (required field)
    description: string; // Contest description (optional)
    duration: number; // Duration in minutes (required field)
    start_time: string; // Start time of the contest (ISO string or Date object)
    contest_code: string; // Unique contest code (required field)
    join_duration?: number; // Duration (in minutes) to join after the contest starts (optional)
    strict_time: boolean; // Boolean indicating whether strict time rules apply
    created_by: string; // The ID of the admin who created the contest (foreign key reference)
    created_at: string; // Timestamp when the contest was created (ISO string)
    updated_at: string; // Timestamp when the contest was last updated (ISO string)
}

export interface Problem {
    id: string;
    title: string;
    problem_statement: string;
    example: string;
    constraints: string;
    difficulty: string;
    input_format: string;
    output_format: string;
    time_limit: string;
    memory_limit: string;
    created_by: string;
    created_at: string;
    updated_at: string;
    tags: string[];
}
