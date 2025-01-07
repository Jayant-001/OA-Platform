import { Router } from 'express';
import ContestSubmissionController from '../controllers/contestSubmissionController';
import asyncHandler from '../utils/asyncHandler';

const router = Router();
const contestSubmissionController = new ContestSubmissionController();

router.post('/run-code', asyncHandler(contestSubmissionController.runCode.bind(contestSubmissionController)));

router.get('/run-code/:submissionId/result', asyncHandler(contestSubmissionController.getRunCodeStatus.bind(contestSubmissionController)));


export default router;
