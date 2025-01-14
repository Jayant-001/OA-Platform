import ActivityRepository from "../repositories/ActivityRepository";

class ActivityService {

    private activityRepository;

    constructor() {
        this.activityRepository = new ActivityRepository();
    }

    async getAllActivities () {
        const data = await this.activityRepository.getAllActivities();
        return data?.map(e => ({id: e[0], contest_id: e[1], user_id: e[2], activity: e[3], timestamp: new Date(e[4])}))
    }

    async getContestActivties(contestId: string) {
        const data = await this.activityRepository.getActivitiesByContestId(contestId);
        return data?.map(e => ({id: e[0], contest_id: e[1], user_id: e[2], activity: e[3], times_tamp: new Date(e[4] as number)}))
    }

    async getUserActivities (contestId: string, userId: string) {
        const data = await this.activityRepository.getContestActivitiesByUserId(contestId, userId);
        return data?.map(e => ({id: e[0], contest_id: e[1], user_id: e[2], activity: e[3], times_tamp: new Date(e[4] as number)}))
    }
}

export default ActivityService;