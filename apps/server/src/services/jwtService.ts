import jwt from "jsonwebtoken";
import { JWT_EXPIRATION } from "../types/constants";

const secret = process.env.JWT_SECRET || "your_jwt_secret";

export const generateToken = (payload: any) => {
    return jwt.sign(payload, secret, { expiresIn: JWT_EXPIRATION });
};

export const verifyToken = (token: string) => {
    return jwt.verify(token, secret);
};

class JwtService {
    generateToken(payload: any) {
        return generateToken(payload);
    }

    verifyToken(token: string) {
        return verifyToken(token);
    }
}

export default JwtService;
