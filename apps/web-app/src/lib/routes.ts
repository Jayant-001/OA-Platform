export const ROUTES = {
    HOME: "/",
    LOGIN: "/login",
    REGISTER: "/register",
    CONTEST: {
        DETAIL: "/contests/:id",
        PROBLEMS: "/contests/:id/problems",
    },
    ADMIN: {
        DASHBOARD: "/admin",
        CONTESTS: "/admin/contests",
        PROBLEMS: "/admin/problems",
        ADD_PROBLEM: "/admin/problems/add",
    },
    PROBLEM: {
        DESCRIPTION: "/problems/:id",
    },
} as const;

