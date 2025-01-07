import { Router } from 'express';
import ContestSubmissionController from '../controllers/contestSubmissionController';
import asyncHandler from '../utils/asyncHandler';
import { asyncWrapper } from '../utils/asyncWrapper';

const router = Router();
const contestSubmissionController = new ContestSubmissionController();

router.post('/run-code', asyncWrapper(contestSubmissionController.runCode.bind(contestSubmissionController)));

router.get('/run-code/:submissionId/result', asyncWrapper(contestSubmissionController.getRunCodeStatus.bind(contestSubmissionController)));


export default router;
