import { Router } from 'express';
import { asyncWrapper } from '../utils/asyncWrapper';
import ContestSubmissionController from '../controllers/contestSubmissionController';
import ContestController from '../controllers/contestController';

const router = Router();
const contestSubmissionController = new ContestSubmissionController();
const contestController = new ContestController();

router.post(
    '/:contestId/problems/:problemId/submit',
    asyncWrapper(contestSubmissionController.createSubmission.bind(contestSubmissionController))
);

router.get(
    '/submit/:submissionId/result',
    asyncWrapper(contestSubmissionController.getSubmitCodeStatus.bind(contestSubmissionController))
);

router.get(
    '/:contestId/problems/:problemId/submissions',
    asyncWrapper(contestSubmissionController.getUserSubmissionsForContest.bind(contestSubmissionController))
);

// DOn't use this route (use the below one instead)
router.get(
    '/upcoming-contests',
    asyncWrapper(contestController.getUpcomingContests.bind(contestController))
);

// Route to get registered upcoming contests for a user
router.get(
    '/registered-upcoming-contests',
    asyncWrapper(contestController.getRegisteredUpcomingContests.bind(contestController))
);

// Route to get contest by code
router.get(
    '/search',
    asyncWrapper(contestController.getContestByCode.bind(contestController))
);

// Route to register user for a contest
router.post(
    '/:contestId/register',
    asyncWrapper(contestController.registerUserForContest.bind(contestController))
);

router.get(
    '/:contestId',
    asyncWrapper(contestController.getUserContest.bind(contestController))
);

router.get(
    '/:contestId/problems',
    asyncWrapper(contestController.getUserContestProblems.bind(contestController))
);

router.get(
    '/:contestId/problems/:problemId',
    asyncWrapper(contestController.getUserContestProblem.bind(contestController))
);

// Get all the contests in which user is registered
router.get(
    '/',
    asyncWrapper(contestController.getUserAllContest.bind(contestController))
);

// Route to get submission details by submission ID
router.get(
    '/submissions/:submissionId',
    asyncWrapper(contestSubmissionController.getSubmissionById.bind(contestSubmissionController))
);

export default router;
