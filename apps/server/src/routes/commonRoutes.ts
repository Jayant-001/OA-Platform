import { Router } from 'express';
import ContestSubmissionController from '../controllers/contestSubmissionController';
import ContestController from '../controllers/contestController';
import CommonController from '../controllers/commonController';


const router = Router();
const contestSubmissionController = new ContestSubmissionController();
const contestController = new ContestController();
const commonController = new CommonController();


router.post('/run-code', (contestSubmissionController.runCode.bind(contestSubmissionController)));

router.get('/run-code/:submissionId/result', (contestSubmissionController.getRunCodeStatus.bind(contestSubmissionController)));

router.get('/leaderboard/:contestId', (contestController.getLeaderboard.bind(contestController)));

router.get('/get-user', (contestController.getLeaderboard.bind(contestController)));

router.get('/me', (commonController.getUser.bind(commonController)));



export default router;
