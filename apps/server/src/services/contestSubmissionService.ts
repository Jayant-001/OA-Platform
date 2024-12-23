import { ContestSubmissionRepository } from "../repositories/contestSubmissionRepository";
import { ContestSubmissions } from "../models/contestSubmissions";

class ContestSubmissionService {
    private contestSubmissionRepository = new ContestSubmissionRepository();

    async createSubmission(
        contest_id: string,
        problem_id: string,
        submissionData: Omit<ContestSubmissions, "id" | "submitted_at" | "contest_id">
    ): Promise<ContestSubmissions> {
        return this.contestSubmissionRepository.create({ ...submissionData, contest_id,problem_id });
    }

 
}

export default ContestSubmissionService;
