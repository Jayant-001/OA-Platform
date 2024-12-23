import { Router } from 'express';
import ContestSubmissionController from '../controllers/contestSubmissionController';

import asyncHandler from '../utils/asyncHandler';

const router = Router();
const contestSubmissionController = new ContestSubmissionController();

router.post('/:contestId/problems/:problemId/submissions', asyncHandler(contestSubmissionController.createSubmission.bind(contestSubmissionController)));

export default router;
