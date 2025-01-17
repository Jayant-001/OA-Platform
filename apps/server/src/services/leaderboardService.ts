import { ContestRepository } from '../repositories/contestRepository';
import { ProblemRepository } from '../repositories/problemRepository';
import { ContestSubmissionRepository } from '../repositories/contestSubmissionRepository';

// ...existing code...

class LeaderboardService {

    private contestRepository = new ContestRepository();
    private problemRepository = new ProblemRepository();
    private contestSubmissionRepository = new ContestSubmissionRepository();  

    async fetchLeaderboardData(contestId: string, page_size: number, page_number: number): Promise<{ leaderboard: any[]; pagination: any }> {
        // Step 1: Fetch required data
        const contestData = await this.contestRepository.findById(contestId);
        const contestUsers = await this.contestRepository.findAllUsersOfContest(contestId);
        const problems = await this.problemRepository.findByContestId(contestId);
        const submissions = await this.contestSubmissionRepository.findByContestId(contestId);

        // Step 2: Create necessary maps
        const submissionsMap = new Map<string, Map<string, any[]>>(); // <userId, Map<problemId, submissions[]>>
        const statusMap = new Map<string, Map<string, { verdict: string; noOfAttempts: number; acceptedTime: Date | null }>>(); // <userId, Map<problemId, status>>
        const incorrectAttemptsMap = new Map<string, number>(); // <userId, no. of incorrect attempts>
        const lastAcceptedSolutionMap = new Map<string, Date | null>(); // <userId, last accepted solution timestamp>
        const problemPoints = new Map<string, number>(); // <problemId, points>

        problems?.forEach((problem) => {
            problemPoints.set(problem.id, problem.points || 0);
        });

        contestUsers?.forEach((user) => {
            statusMap.set(user.id, new Map());
            submissionsMap.set(user.id, new Map());
            incorrectAttemptsMap.set(user.id, 0);
            lastAcceptedSolutionMap.set(user.id, null);

            problems.forEach((problem) => {
                statusMap.get(user.id)!.set(problem.id, { verdict: "notAttempted", noOfAttempts: 0,acceptedTime: null });
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
            let userLastAcceptedTime: Date | null;
            userLastAcceptedTime = null;


            userProblems.forEach((submissions, problemId) => {
                let verdict = "notAttempted";
                let noOfAttempts = 0;
                let acceptedTime = null;
                let problemSolved = false;

                submissions.forEach((submission) => {
                    if (!problemSolved)
                    {
                        noOfAttempts++;
                        if (submission.verdict === "accepted") {
                            problemSolved = true;
                            if (userLastAcceptedTime == null)
                                userLastAcceptedTime = submission.submitted_at;
                            else
                                userLastAcceptedTime = new Date(Math.max(userLastAcceptedTime.getTime(), submission.submitted_at.getTime()));
                            acceptedTime = new Date(submission.submitted_at.getTime());
                            return;
                        } 
                    }
                });

                if (problemSolved) {
                    verdict = "solved";
                    userIncorrectAttempts = userIncorrectAttempts + (noOfAttempts - 1);
                } else if (noOfAttempts > 0) {
                    verdict = "unSolved";
                }

                statusMap.get(userId)!.set(problemId, { verdict, noOfAttempts, acceptedTime });
            });

            incorrectAttemptsMap.set(userId, userIncorrectAttempts);
            lastAcceptedSolutionMap.set(userId, userLastAcceptedTime);
        });


        const leaderboard = contestUsers?.map((user) => {
            const userId = user.id;
            const userProblems = statusMap.get(userId);
            let formattedFinishTime = "00:00:00";
            let totalPoints = 0;
            let finishTime = lastAcceptedSolutionMap.get(userId) ;
            const problems: { problemId: string; verdict: string; noOfAttempts: number; acceptedTime:Date|null }[] = [];

            userProblems?.forEach((status, problemId) => {
                const problemScore = problemPoints.get(problemId) || 0;

                if (status.verdict === "solved") {
                    totalPoints += problemScore;
                }

                problems.push({
                    problemId,
                    verdict: status.verdict,
                    noOfAttempts: status.noOfAttempts,
                    acceptedTime: status.acceptedTime
                });
            });

            // Convert penalty time from minutes to milliseconds and add to finishTime
            if (finishTime != null) {
                const penaltyTimeInMs = (incorrectAttemptsMap.get(userId) || 0) * 5 * 60 * 1000; // 5 minutes per incorrect attempt
                finishTime = new Date(finishTime.getTime() + penaltyTimeInMs);

                if (contestData?.start_time != null) {
                    const elapsedMs = finishTime.getTime() - contestData.start_time.getTime();

                    // Convert milliseconds to hh:mm:ss
                    const hours = Math.floor(elapsedMs / (1000 * 60 * 60)).toString().padStart(2, '0');
                    const minutes = Math.floor((elapsedMs % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
                    const seconds = Math.floor((elapsedMs % (1000 * 60)) / 1000).toString().padStart(2, '0');

                    // Format as hh:mm:ss
                    formattedFinishTime = `${hours}:${minutes}:${seconds}`;
                }
            }


            return {
                userId,
                userName: user.name,
                rank: 0, // Placeholder, will sort later
                problems: problems,
                totalPoints,
                finishTime: formattedFinishTime,
            };
        });

        // Step 6: Sort and assign ranks
        leaderboard?.sort((a, b) => {
            // Parse hh:mm:ss into total seconds for comparison
            const getTimeInSeconds = (timeStr: string) => {
                const [hours, minutes, seconds] = timeStr.split(':').map(Number);
                return hours * 3600 + minutes * 60 + seconds;
            };

            if (a.totalPoints !== b.totalPoints) {
                return b.totalPoints - a.totalPoints; // Higher score first
            }

            return getTimeInSeconds(a.finishTime) - getTimeInSeconds(b.finishTime); // Lower finish time first
        });

        leaderboard?.forEach((entry, index) => {
            if (
                index > 0 &&
                leaderboard[index - 1].totalPoints === entry.totalPoints &&
                leaderboard[index - 1].finishTime === entry.finishTime
            ) {
                // Assign the same rank for tied scores and finish times
                entry.rank = leaderboard[index - 1].rank;
            } else {
                // Assign rank based on the current position
                entry.rank = index + 1;
            }
        });


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

