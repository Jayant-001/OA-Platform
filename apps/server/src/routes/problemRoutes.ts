import { Router } from 'express';
import ProblemController from '../controllers/problemController';

const router = Router();
const problemController = new ProblemController();

router.get('/problems', problemController.getAllProblems.bind(problemController));
router.get('/problems/:id', problemController.getProblemById.bind(problemController));
router.post('/problems', problemController.createProblem.bind(problemController));
router.put('/problems/:id', problemController.updateProblem.bind(problemController));
router.delete('/problems/:id', problemController.deleteProblem.bind(problemController));

export default router;
