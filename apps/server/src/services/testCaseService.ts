import { TestCase } from "../models/testCase";
import TestCaseRepository from "../repositories/testCaseRepository";

class TestCaseService {
    private testCaseRepository = new TestCaseRepository();

    async findAllByProblemId(problem_id: string):Promise<TestCase> {
        return await this.testCaseRepository.findOneByProblemId(problem_id);
    }
}

export default TestCaseService;
