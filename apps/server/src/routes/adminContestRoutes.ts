import { Router } from 'express';
import ContestController from '../controllers/contestController';
import ContestSubmissionController from '../controllers/contestSubmissionController';

import asyncHandler from '../utils/asyncHandler';

const router = Router();
const contestController = new ContestController();


router.get('/', asyncHandler(contestController.getAllContests.bind(contestController)));
router.get('/:contestId', asyncHandler(contestController.getContestById.bind(contestController)));
router.post('/', asyncHandler(contestController.createContest.bind(contestController)));
router.put('/:contestId', asyncHandler(contestController.updateContest.bind(contestController)));
router.delete('/:contestId', asyncHandler(contestController.deleteContest.bind(contestController)));
router.post('/:contestId/problems/:problemId', asyncHandler(contestController.addProblemToContest.bind(contestController)));
router.put('/:contestId/problems/:problemId', asyncHandler(contestController.updateProblemInContest.bind(contestController)));
router.delete('/:contestId/problems/:problemId', asyncHandler(contestController.deleteProblemFromContest.bind(contestController)));
router.post('/:contestId/users', asyncHandler(contestController.addUsersToContest.bind(contestController)));

export default router;
