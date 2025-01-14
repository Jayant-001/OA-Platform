import { Router } from 'express';
import ContestController from '../controllers/contestController';
import ActivityController from '../controllers/activityController';

const router = Router();
const contestController = new ContestController();
const activityController = new ActivityController();

router.get(
    '/',
    contestController.getAllContests.bind(contestController)
);
router.get(
    '/:contestId',
    contestController.getContestById.bind(contestController)
);
router.post(
    '/',
    contestController.createContest.bind(contestController)
);
router.put(
    '/:contestId',
    contestController.updateContest.bind(contestController)
);
router.delete(
    '/:contestId',
    contestController.deleteContest.bind(contestController)
);
router.post(
    '/:contestId/problems/:problemId',
    contestController.addProblemToContest.bind(contestController)
);
router.put(
    '/:contestId/problems/:problemId',
    contestController.updateProblemInContest.bind(contestController)
);
router.delete(
    '/:contestId/problems/:problemId',
    contestController.deleteProblemFromContest.bind(contestController)
);
router.put(
    '/:contestId/users',
    contestController.addUsersToContest.bind(contestController)
);
router.put(
    '/:contestId/problems',
    contestController.addProblemsToContest.bind(contestController)
);

router.get(
    "/:contest_id/activities",
    activityController.getContestActivities.bind(activityController)
);

router.get(
    "/contests/:contest_id/activities/:user_id",
    activityController.getUserActivities.bind(activityController)
);

export default router;
