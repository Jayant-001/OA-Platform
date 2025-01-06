import { Router } from 'express';
import ContestSubmissionController from '../controllers/contestSubmissionController';
import asyncHandler from '../utils/asyncHandler';

const router = Router();
const contestSubmissionController = new ContestSubmissionController();

router.post('/run-code', asyncHandler(contestSubmissionController.runCode.bind(contestSubmissionController)));



export default router;
