import { Router } from 'express';
import ContestSubmissionController from '../controllers/contestSubmissionController';
import ContestController from '../controllers/contestController';
import asyncHandler from '../utils/asyncHandler';

const router = Router();
const contestSubmissionController = new ContestSubmissionController();
const contestController = new ContestController();

router.post('/:contestId/problems/:problemId/submissions', asyncHandler(contestSubmissionController.createSubmission.bind(contestSubmissionController)));

// Route to get upcoming contests for a user
router.get('/upcoming-contests', asyncHandler(contestController.getUpcomingContests.bind(contestController)));

export default router;
