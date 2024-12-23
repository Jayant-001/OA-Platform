import { Router } from 'express';
import ProblemController from '../controllers/problemController';
import asyncHandler from '../utils/asyncHandler';

const router = Router();
const problemController = new ProblemController();

router.get('/', asyncHandler(problemController.getAllProblems.bind(problemController)));
router.get('/:problemId', asyncHandler(problemController.getProblemById.bind(problemController)));
router.post('/', asyncHandler(problemController.createProblem.bind(problemController)));
router.put('/:problemId', asyncHandler(problemController.updateProblem.bind(problemController)));
router.delete('/:problemId', asyncHandler(problemController.deleteProblem.bind(problemController)));
router.post('/:problemId/submissions', asyncHandler(problemController.createSubmission.bind(problemController)));

export default router;
