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
    result?: string;
    error?: string | null;
    executionTime?: number;
    submissionType?: string;
}

export interface ContainerPool {
    initialize(): Promise<void>;
    processRunCode(content: string, input?: string): Promise<{ result: string; executionTimeMs: number, error:string | null }>;
    shutdown(): Promise<void>;
    processSubmitCode(code: string, testCases: any): Promise<{ result: string; executionTimeMs: number,error:string | null }>;
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
