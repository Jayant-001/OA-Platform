import { ContestRepository } from '../repositories/contestRepository';
import { ProblemRepository } from '../repositories/problemRepository';
import { ContestSubmissionRepository } from '../repositories/contestSubmissionRepository';

class LeaderboardService {

    private contestRepository = new ContestRepository();
    private problemRepository = new ProblemRepository();
    private contestSubmissionRepository = new ContestSubmissionRepository();  

    async fetchLeaderboardData(contestId: string, page_size: number, page_number: number): Promise<{ leaderboard: any[]; pagination: any }> {
        // Step 1: Fetch required data
        const contestUsers = await this.contestRepository.findAllUsersOfContest(contestId);
        const problems = await this.problemRepository.findByContestId(contestId);
        const submissions = await this.contestSubmissionRepository.findByContestId(contestId);

        // Step 2: Create necessary maps
        const submissionsMap = new Map<string, Map<string, any[]>>(); // <userId, Map<problemId, submissions[]>>
        const statusMap = new Map<string, Map<string, { verdict: string; noOfAttempts: number }>>(); // <userId, Map<problemId, status>>
        const incorrectAttemptsMap = new Map<string, number>(); // <userId, no. of incorrect attempts>
        const lastAcceptedSolutionMap = new Map<string, Date>(); // <userId, last accepted solution timestamp>
        const problemPoints = new Map<string, number>(); // <problemId, points>

        problems?.forEach((problem) => {
            problemPoints.set(problem.id, problem.points || 0);
        });

        contestUsers?.forEach((user) => {
            statusMap.set(user.id, new Map());
            submissionsMap.set(user.id, new Map());
            incorrectAttemptsMap.set(user.id, 0);
            lastAcceptedSolutionMap.set(user.id, new Date(0));

            problems.forEach((problem) => {
                statusMap.get(user.id)!.set(problem.id, { verdict: "notAttempted", noOfAttempts: 0 });
                submissionsMap.get(user.id)!.set(problem.id, []);
            });
        });

        // Step 3: Populate submissionsMap
        submissions.forEach((submission) => {
            const { user_id, problem_id } = submission;

            const userProblems = submissionsMap.get(user_id)!;

            userProblems.get(problem_id)!.push(submission);
        });

        // Step 4: Process submissions for each user and problem
        submissionsMap.forEach((userProblems, userId) => {

            let userIncorrectAttempts = 0;
            let userLastAcceptedTime = new Date(0);

            userProblems.forEach((submissions, problemId) => {
                let verdict = "notAttempted";
                let noOfAttempts = 0;
                let problemSolved = false;

                submissions.forEach((submission) => {
                    if (!problemSolved)
                    {
                        noOfAttempts++;
                        if (submission.verdict === "accepted") {
                            problemSolved = true;
                            userLastAcceptedTime = new Date(Math.max(userLastAcceptedTime.getTime(), submission.submitted_at.getTime()));
                            return;
                        } else {
                            userIncorrectAttempts++;
                        }
                    }
                });

                if (problemSolved) {
                    verdict = "solved";
                } else if (noOfAttempts > 0) {
                    verdict = "unSolved";
                }

                statusMap.get(userId)!.set(problemId, { verdict, noOfAttempts });
            });

            incorrectAttemptsMap.set(userId, userIncorrectAttempts);
            lastAcceptedSolutionMap.set(userId, userLastAcceptedTime);
        });


        const leaderboard = contestUsers?.map((user) => {
            const userId = user.id;
            const userProblems = statusMap.get(userId);

            let totalPoints = 0;
            let finishTime = lastAcceptedSolutionMap.get(userId) || new Date(0);
            const problems: { problemId: string; verdict: string; noOfAttempts: number; }[] = [];

            userProblems?.forEach((status, problemId) => {
                const problemScore = problemPoints.get(problemId) || 0;

                if (status.verdict === "solved") {
                    totalPoints += problemScore;
                }

                problems.push({
                    problemId,
                    verdict: status.verdict,
                    noOfAttempts: status.noOfAttempts,
                });
            });

            // Convert penalty time from minutes to milliseconds and add to finishTime
            const penaltyTimeInMs = (incorrectAttemptsMap.get(userId) || 0) * 5 * 60 * 1000; // 5 minutes per incorrect attempt
            finishTime = new Date(finishTime.getTime() + penaltyTimeInMs);

            return {
                userId,
                userName: user.name,
                rank: 0, // Placeholder, will sort later
                problems: problems,
                totalPoints,
                finishTime,
            };
        });

        // Step 6: Sort and assign ranks
        leaderboard?.sort((a, b) => {
            if (a.totalPoints !== b.totalPoints) {
                return b.totalPoints - a.totalPoints; // Higher score first
            }
            return a.finishTime.getTime() - b.finishTime.getTime(); // Lower finish time first
        });

        leaderboard?.forEach((entry, index) => {
            if (index > 0 && leaderboard[index - 1].totalPoints === entry.totalPoints && leaderboard[index - 1].finishTime === entry.finishTime) {
                entry.rank = leaderboard[index - 1].rank; // Same rank for tied scores
            } else {
                entry.rank = index + 1; // Regular rank assignment
            }
        });

        // console.log(leaderboard);

        const total_records = leaderboard?.length || 0;
        const total_pages = Math.ceil(total_records / page_size);
        if (page_number > total_pages) page_number = total_pages;
        const start_index = (page_number - 1) * page_size;
        const end_index = start_index + page_size;
        const paginatedLeaderboard = leaderboard?.slice(start_index, end_index) || [];
        // Pagination Metadata
        const pagination = {
            total_records,
            page_number,
            page_size,
            total_pages,
            next_page: page_number < total_pages ? page_number + 1 : null,
            prev_page: page_number > 1 ? page_number - 1 : null,
        };
        return {
            leaderboard: paginatedLeaderboard,
            pagination,
        };

    }

}

export default LeaderboardService;  

