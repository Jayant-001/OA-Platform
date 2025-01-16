import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET || "your_jwt_secret";

export const generateToken = (payload: any) => {
    return jwt.sign(payload, secret, { expiresIn: "12h" });
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
