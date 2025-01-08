import { Router } from 'express';
import { asyncWrapper } from '../utils/asyncWrapper';
import ProblemController from '../controllers/problemController';

const router = Router();
const problemController = new ProblemController();

router.post(
    '/',
    asyncWrapper(problemController.createProblem.bind(problemController))
);

router.get(
    '/',
    asyncWrapper(problemController.getAllProblems.bind(problemController))
);

router.get(
    '/:problemId',
    asyncWrapper(problemController.getProblemById.bind(problemController))
);

router.put(
    '/:problemId',
    asyncWrapper(problemController.updateProblem.bind(problemController))
);

router.delete(
    '/:problemId',
    asyncWrapper(problemController.deleteProblem.bind(problemController))
);

router.post(
    '/:problemId/test-cases',
    asyncWrapper(problemController.addTestCase.bind(problemController))
);

router.get(
    '/:problemId/test-cases',
    asyncWrapper(problemController.getTestCases.bind(problemController))
);

router.post(
    '/:problemId/test-cases/bulk',
    asyncWrapper(problemController.addBulkTestCases.bind(problemController))
);

router.put(
    '/:problemId/test-cases/:testCaseId',
    asyncWrapper(problemController.updateTestCase.bind(problemController))
);

router.delete(
    '/:problemId/test-cases/:testCaseId',
    asyncWrapper(problemController.deleteTestCase.bind(problemController))
);

export default router;
