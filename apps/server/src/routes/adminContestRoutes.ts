import { Router } from 'express';
import { asyncWrapper } from '../utils/asyncWrapper';
import ContestController from '../controllers/contestController';
import ContestSubmissionController from '../controllers/contestSubmissionController';

const router = Router();
const contestController = new ContestController();

router.get(
    '/',
    asyncWrapper(contestController.getAllContests.bind(contestController))
);
router.get(
    '/:contestId',
    asyncWrapper(contestController.getContestById.bind(contestController))
);
router.post(
    '/',
    asyncWrapper(contestController.createContest.bind(contestController))
);
router.put(
    '/:contestId',
    asyncWrapper(contestController.updateContest.bind(contestController))
);
router.delete(
    '/:contestId',
    asyncWrapper(contestController.deleteContest.bind(contestController))
);
router.post(
    '/:contestId/problems/:problemId',
    asyncWrapper(contestController.addProblemToContest.bind(contestController))
);
router.put(
    '/:contestId/problems/:problemId',
    asyncWrapper(contestController.updateProblemInContest.bind(contestController))
);
router.delete(
    '/:contestId/problems/:problemId',
    asyncWrapper(contestController.deleteProblemFromContest.bind(contestController))
);
router.put(
    '/:contestId/users',
    asyncWrapper(contestController.addUsersToContest.bind(contestController))
);
router.put(
    '/:contestId/problems',
    asyncWrapper(contestController.addProblemsToContest.bind(contestController))
);

export default router;
