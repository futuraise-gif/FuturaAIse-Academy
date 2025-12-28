"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_firebase_1 = require("../controllers/auth.firebase");
const auth_validator_1 = require("../validators/auth.validator");
const validation_middleware_1 = require("../middleware/validation.middleware");
const auth_firebase_2 = require("../middleware/auth.firebase");
const router = (0, express_1.Router)();
router.post('/register', auth_validator_1.registerValidator, validation_middleware_1.validate, auth_firebase_1.AuthController.register);
router.post('/login', auth_firebase_1.AuthController.login);
router.post('/login-with-id', auth_firebase_1.AuthController.loginWithId);
router.get('/profile', auth_firebase_2.authenticate, auth_firebase_1.AuthController.getProfile);
router.put('/profile', auth_firebase_2.authenticate, auth_firebase_1.AuthController.updateProfile);
exports.default = router;
//# sourceMappingURL=auth.firebase.js.map