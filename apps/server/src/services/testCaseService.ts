import TestCaseRepository from "../repositories/testCaseRepository";

class TestCaseService {
    private testCaseRepository = new TestCaseRepository();

    async findAllByProblemId(problem_id: string) {
        return await this.testCaseRepository.findAllByProblemId(problem_id);
    }
}

export default TestCaseService;
