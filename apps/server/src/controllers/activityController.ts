import { Request, Response } from "express";
import { CustomException } from "../errors/CustomException";
import ActivityService from "../services/activityService";

class ActivityController {
    private activityService: ActivityService;
    constructor() {
        this.activityService = new ActivityService();
    }

    async getActivities (req: Request, res: Response) {
        const activities = await this.activityService.getAllActivities();
        res.json({activities})
    }

    async getContestActivities(req: Request, res: Response) {
        const { contest_id } = req.params;
        const activities = await this.activityService.getContestActivtiesSummary(
            contest_id
        );
        return res.json(activities);
    }

    async getUserActivities(req: Request, res: Response) {
        const { contest_id, user_id } = req.params;
        const activities = await this.activityService.getUserActivities(
            contest_id,
            user_id
        );
        res.json(activities);
    }
}

export default ActivityController;
