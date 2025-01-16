import { Router } from 'express';
import ContestSubmissionController from '../controllers/contestSubmissionController';
import ContestController from '../controllers/contestController';

const router = Router();
const contestSubmissionController = new ContestSubmissionController();
const contestController = new ContestController();

router.post(
    '/:contestId/problems/:problemId/submit',
    contestSubmissionController.createSubmission.bind(contestSubmissionController)
);

router.get(
    '/submit/:submissionId/result',
    contestSubmissionController.getSubmitCodeStatus.bind(contestSubmissionController)
);

router.get(
    '/:contestId/problems/:problemId/submissions',
    contestSubmissionController.getUserSubmissionsForContest.bind(contestSubmissionController)
);

// DOn't use this route (use the below one instead)
router.get(
    '/upcoming-contests',
    contestController.getUpcomingContests.bind(contestController)
);

// Route to get registered upcoming contests for a user
router.get(
    '/registered-upcoming-contests',
    (contestController.getRegisteredUpcomingContests.bind(contestController))
);

// Route to get contest by code
router.get(
    '/search',
    (contestController.getContestByCode.bind(contestController))
);

// Route to register user for a contest
router.post(
    '/:contestId/register',
    contestController.registerUserForContest.bind(contestController)
);

router.get(
    '/:contestId',
    contestController.getUserContest.bind(contestController)
);

router.get(
    '/:contestId/problems',
    (contestController.getUserContestProblems.bind(contestController))
);

router.get(
    '/:contestId/problems/:problemId',
    (contestController.getUserContestProblem.bind(contestController))
);

// Get all the contests in which user is registered
router.get(
    '/',
    (contestController.getUserAllContest.bind(contestController))
);

// Route to get submission details by submission ID
router.get(
    '/submissions/:submissionId',
    (contestSubmissionController.getSubmissionById.bind(contestSubmissionController))
);

router.get(
    '/:contestId/problems/:problemId/leaderboard-submissions',
    (contestSubmissionController.getLeaderboardSubmissions.bind(contestSubmissionController))
);

export default router;
