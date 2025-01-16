import { Router } from "express";
import ActivityController from "../controllers/activityController";

const router = Router();
const activityController = new ActivityController();

router.get(
    "/activities",
    activityController.getActivities.bind(activityController)
);

export default router;
