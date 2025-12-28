"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const firebase_1 = require("../config/firebase");
const user_firebase_1 = require("../models/user.firebase");
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'No token provided' });
            return;
        }
        const token = authHeader.substring(7);
        const decodedToken = await firebase_1.auth.verifyIdToken(token);
        // Fetch full user data from database to get role and other info
        const userData = await user_firebase_1.UserModel.findById(decodedToken.uid);
        if (!userData) {
            res.status(401).json({ error: 'User not found' });
            return;
        }
        // Attach both token data and user data
        req.user = {
            ...decodedToken,
            userId: decodedToken.uid,
            role: userData.role,
            email: userData.email,
            status: userData.status,
            first_name: userData.first_name,
            last_name: userData.last_name,
        };
        next();
    }
    catch (error) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};
exports.authenticate = authenticate;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({ error: 'Insufficient permissions' });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
//# sourceMappingURL=auth.firebase.js.map