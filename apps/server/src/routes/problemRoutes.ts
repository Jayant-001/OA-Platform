import { Router } from 'express';
import ProblemController from '../controllers/problemController';
import asyncHandler from '../utils/asyncHandler';

const router = Router();
const problemController = new ProblemController();

router.get('/problems', asyncHandler(problemController.getAllProblems.bind(problemController)));
router.get('/problems/:id', asyncHandler(problemController.getProblemById.bind(problemController)));
router.post('/problems', asyncHandler(problemController.createProblem.bind(problemController)));
router.put('/problems/:id', asyncHandler(problemController.updateProblem.bind(problemController)));
router.delete('/problems/:id', asyncHandler(problemController.deleteProblem.bind(problemController)));

export default router;
