import ActivityRepository from "../repositories/ActivityRepository";
import { UserRepository } from "../repositories/userRepository";

class ActivityService {
    private activityRepository;
    private userRepository;

    constructor() {
        this.activityRepository = new ActivityRepository();
        this.userRepository = new UserRepository();
    }

    async getAllActivities() {
        const data = await this.activityRepository.getAllActivities();
        return data?.map((e) => ({
            id: e[0],
            contest_id: e[1],
            user_id: e[2],
            activity: e[3],
            timestamp: new Date(e[4]),
        }));
    }

    async getContestActivties(contestId: string) {
        const data = await this.activityRepository.getActivitiesByContestId(
            contestId
        );
        return data?.map((e) => ({
            id: e[0],
            contest_id: e[1],
            user_id: e[2],
            activity: e[3],
            times_tamp: new Date(e[4] as number),
        }));
    }
    
    async getContestActivtiesSummary(contestId: string) {
        const data = await this.activityRepository.getActivitySummaryByContestId(
            contestId
        );
        const activitiesResult = data?.map((e) => ({
            user_id: e[0],
            totalOfflineTimeInSeconds: e[1],
            current_status: e[2],
        }));

        const userIds = [...new Set(activitiesResult?.map((activity: any) => activity.user_id))];
        const users = await this.userRepository.getUsersEmailAndNameByUserIds(userIds);
        const userDetailsMap = new Map();

        users.forEach(user => {
            userDetailsMap.set(user.id, { name: user.name, email: user.email });
        });

        const result = activitiesResult?.map((activity: any) => {
            const userDetail = userDetailsMap.get(activity.user_id);
            return {
              user_id: activity.user_id,
              current_status: activity.current_status,
              totalOfflineTimeInSeconds: activity.totalOfflineTimeInSeconds,
              name: userDetail?.name ?? 'Unknown',
              email: userDetail?.email ?? 'Unknown',
            };
          });

        return result
    }

    async getUserActivities(contestId: string, userId: string) {
        const allActivities =
            await this.activityRepository.getContestActivitiesByUserId(
                contestId,
                userId
            );
        const activities = allActivities?.map((e) => ({
            id: e[0],
            contest_id: e[1],
            user_id: e[2],
            activity: e[3],
            times_tamp: new Date(e[4] as number),
        }));

        let response = {
            totalOfflineInSeconds: 0,
            activities,
        };
        const activitySummary =
            await this.activityRepository.getOfflineSecondsForUser(
                contestId,
                userId
            );
        if (activitySummary) {
            const seconds = activitySummary[0][0];
            response.totalOfflineInSeconds = Math.ceil(seconds as number);
        }
        return response;
    }
}

export default ActivityService;
