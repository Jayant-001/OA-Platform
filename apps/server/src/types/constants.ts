export const ACTIVITY = {
    OFFLINE: 'went offline', 
    ONLINE: 'came online'
}

export const PAGINATION = {
    PAGE_SIZE:10,
    PAGE_NUMBER:1
}

export const SUBMISSION_STATUS = {
    PENDING: 'PENDING',
    COMPLETED: 'COMPLETED',
    PROCESSING: 'PROCESSING'
} as const; 

export const SUBMISSION_TYPE = {
    SUBMIT: 'submit',
    RUN: 'run'
} ;

export const CACHE_PREFIX = {
    SUBMIT: 'submit:',
    RUN: 'run:',
    OUTPUT: 'output:'
};

export const VERDICT = {
    ACCEPTED: 'accepted'
};

export const CACHE_NAMESPACE = "code-execution:";

export const JWT_EXPIRATION = "12h";

export const PROBLEM_CACHE_NAMESPACE = {
    PROBLEM: "problem_cache:",
    PROBLEM_LIST: "problem_list_cache:"
};

export const CACHE_KEYS = {
    ALL_PROBLEMS: "all_problems",
    PROBLEM: (id: string) => `problem:${id}`
};