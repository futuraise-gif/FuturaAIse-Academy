"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_firebase_1 = require("../middleware/auth.firebase");
const types_1 = require("../types");
const router = (0, express_1.Router)();
router.get('/', auth_firebase_1.authenticate, (0, auth_firebase_1.authorize)(types_1.UserRole.ADMIN, types_1.UserRole.INSTRUCTOR), user_controller_1.UserController.getAllUsers);
router.get('/:id', auth_firebase_1.authenticate, (0, auth_firebase_1.authorize)(types_1.UserRole.ADMIN, types_1.UserRole.INSTRUCTOR), user_controller_1.UserController.getUserById);
router.patch('/:id/status', auth_firebase_1.authenticate, (0, auth_firebase_1.authorize)(types_1.UserRole.ADMIN), user_controller_1.UserController.updateUserStatus);
router.delete('/:id', auth_firebase_1.authenticate, (0, auth_firebase_1.authorize)(types_1.UserRole.ADMIN), user_controller_1.UserController.deleteUser);
exports.default = router;
//# sourceMappingURL=user.firebase.js.map