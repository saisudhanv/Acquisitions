import { jwttoken } from '#utils/jwt.js';
import logger from '#config/logger.js';

/**
 * Middleware to authenticate requests using JWT tokens from cookies
 * Populates req.user if a valid token is found
 */
export const authenticate = (req, res, next) => {
    try {
        const token = req.cookies?.token;

        if (!token) {
            // No token found, proceed without user (will fail on protected routes)
            return next();
        }

        const decoded = jwttoken.verify(token);
        req.user = decoded;
        next();
    } catch (e) {
        logger.warn('Invalid or expired token', { error: e.message });
        // Clear invalid token and proceed without user
        res.clearCookie('token');
        next();
    }
};

export default authenticate;
