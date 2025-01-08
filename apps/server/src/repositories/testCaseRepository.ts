import db from "../config/database";
import { TestCase } from "../models/testCase";

class TestCaseRepository {
    async findAll(): Promise<TestCase[]> {
        return db.any("SELECT * FROM test_cases");
    }

    async findAllByProblemId(problem_id: string): Promise<TestCase[]> {
        return db.any(`select * from test_cases where problem_id = $1`, [problem_id])
    }

}


export default TestCaseRepository;