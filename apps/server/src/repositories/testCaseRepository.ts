import db from "../config/database";
import { TestCase } from "../models/testCase";

class TestCaseRepository {
    async findAll(): Promise<TestCase[]> {
        return db.any("SELECT * FROM test_cases");
    }

    async findOneByProblemId(problem_id: string): Promise<TestCase | null> {
        return db.oneOrNone(
            `SELECT * FROM test_cases WHERE problem_id = $1 LIMIT 1`,
            [problem_id]
        );
    }

}


export default TestCaseRepository;