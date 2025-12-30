"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.db = exports.auth = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
if (!firebase_admin_1.default.apps.length) {
    const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || './serviceAccountKey.json';
    try {
        const serviceAccount = require(path_1.default.resolve(serviceAccountPath));
        firebase_admin_1.default.initializeApp({
            credential: firebase_admin_1.default.credential.cert(serviceAccount),
        });
        console.log('✓ Firebase Admin initialized with service account');
    }
    catch (error) {
        console.error('Failed to initialize Firebase Admin:', error);
        throw error;
    }
}
exports.auth = firebase_admin_1.default.auth();
exports.db = firebase_admin_1.default.firestore();
exports.storage = firebase_admin_1.default.storage();
exports.default = firebase_admin_1.default;
//# sourceMappingURL=firebase.js.map