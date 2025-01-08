import { Router } from 'express';
import ContestSubmissionController from '../controllers/contestSubmissionController';
import ContestController from '../controllers/contestController';
import asyncHandler from '../utils/asyncHandler';
import { asyncWrapper } from '../utils/asyncWrapper';

const router = Router();
const contestSubmissionController = new ContestSubmissionController();
const contestController = new ContestController();

router.post('/run-code', asyncWrapper(contestSubmissionController.runCode.bind(contestSubmissionController)));

router.get('/run-code/:submissionId/result', asyncWrapper(contestSubmissionController.getRunCodeStatus.bind(contestSubmissionController)));

router.get('/leaderboard/:contestId', asyncWrapper(contestController.getLeaderboard.bind(contestController)));

export default router;
