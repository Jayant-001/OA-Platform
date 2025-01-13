import { Router } from 'express';
import ProblemController from '../controllers/problemController';

const router = Router();
const problemController = new ProblemController();

router.post(
    '/',
    problemController.createProblem.bind(problemController)
);

router.get(
    '/',
    problemController.getAllProblems.bind(problemController)
);

router.get(
    '/:problemId',
    problemController.getProblemById.bind(problemController)
);

router.put(
    '/:problemId',
    problemController.updateProblem.bind(problemController)
);

router.delete(
    '/:problemId',
    problemController.deleteProblem.bind(problemController)
);

router.post(
    '/:problemId/test-cases',
    problemController.addTestCase.bind(problemController)
);

router.get(
    '/:problemId/test-cases',
    problemController.getTestCases.bind(problemController)
);

router.post(
    '/:problemId/test-cases/bulk',
    problemController.addBulkTestCases.bind(problemController)
);

router.put(
    '/:problemId/test-cases/:testCaseId',
    problemController.updateTestCase.bind(problemController)
);

router.delete(
    '/:problemId/test-cases/:testCaseId',
    problemController.deleteTestCase.bind(problemController)
);

export default router;
