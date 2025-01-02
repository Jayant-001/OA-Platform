import { Router } from 'express';
import ContestSubmissionController from '../controllers/contestSubmissionController';
import ContestController from '../controllers/contestController';
import asyncHandler from '../utils/asyncHandler';

const router = Router();
const contestSubmissionController = new ContestSubmissionController();
const contestController = new ContestController();

router.post('/:contestId/problems/:problemId/submissions', asyncHandler(contestSubmissionController.createSubmission.bind(contestSubmissionController)));

router.get('/:contestId/problems/:problemId/submissions', asyncHandler(contestSubmissionController.getUserSubmissionsForContest.bind(contestSubmissionController)));

// DOn't use this route (use the below one instead)
router.get('/upcoming-contests', asyncHandler(contestController.getUpcomingContests.bind(contestController)));

// Route to get registered upcoming contests for a user
router.get('/registered-upcoming-contests', asyncHandler(contestController.getRegisteredUpcomingContests.bind(contestController)));

// Route to get contest by code
router.get('/search', asyncHandler(contestController.getContestByCode.bind(contestController)));

// Route to register user for a contest
router.post('/:contestId/register', asyncHandler(contestController.registerUserForContest.bind(contestController)));

router.get('/:contestId', asyncHandler(contestController.getUserContest.bind(contestController)));

router.get('/:contestId/problems', asyncHandler(contestController.getUserContestProblems.bind(contestController)));

router.get('/:contestId/problems/:problemId', asyncHandler(contestController.getUserContestProblem.bind(contestController)));

// Get all the contests in which user is registered
router.get('/', asyncHandler(contestController.getUserAllContest.bind(contestController)));

// Route to get submission details by submission ID
router.get('/submissions/:submissionId', asyncHandler(contestSubmissionController.getSubmissionById.bind(contestSubmissionController)));

export default router;
