export const ROUTES = {
    HOME: "/",
    LOGIN: "/login",
    REGISTER: "/register",
    ADMIN_LOGIN: "/admin/login",
    ADMIN_REGISTER: "/admin/register",
    CONTEST: {
        DETAIL: "/contests/:contest_id",
        PROBLEMS: "/contests/:contest_id/problems",
        SOLVE_PROBLEMS: "contests/:contest_id/problems/:problem_id/solve",
        LEADERBOARD: "/contests/:contest_id/leaderboard",
    },
    DASHBOARD: {
        HOME: "/dashboard",
        LOGIN: "/dashboard/login",
        REGISTER: "/dashboard/register",

        CONTESTS: "/dashboard/contests",
        ADD_CONTEST: "/dashboard/contests/add",
        CONTEST: "/dashboard/contests/:contest_id",
        UPDATE_CONTEST: "/dashboard/contests/:contest_id/update",
        LEADERBOARD_CONTEST: "/dashboard/contests/:contest_id/leaderboard",

        PROBLEMS: "/dashboard/problems",
        ADD_PROBLEM: "/dashboard/problems/add",
        PROBLEM: "/dashboard/problems/:problem_id",
        UPDATE_PROBLEM: "/dashboard/problems/:problem_id/update",
    },
    PROBLEM: {
        DESCRIPTION: "/problems/:id",
    },
} as const;
