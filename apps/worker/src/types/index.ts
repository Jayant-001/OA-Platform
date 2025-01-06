export interface CodeExecutionJob {
    id: string;
    language: string;
    code: string;
    input?: string;
    timeout?: number;
    submissionType?: string;
}

export interface ExecutionResult {
    jobId: string;
    success: boolean;
    output?: string;
    error?: string;
    executionTime?: number;
    submissionType?: string;
}

export interface ContainerPool {
    initialize(): Promise<void>;
    processCode(content: string, input?: string): Promise<{ result: string; executionTimeMs: number }>;
    shutdown(): Promise<void>;
}

export class ExecutionTimeoutError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ExecutionTimeoutError';
    }
}

export class CompilationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'CompilationError';
    }
}
