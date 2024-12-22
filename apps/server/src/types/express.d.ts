import { ReqUser } from "../models/reqUser";

declare global {
    namespace Express {
        interface Request {
            user?: ReqUser;
        }
    }
}

export {}; // Ensure the file is treated as a module
