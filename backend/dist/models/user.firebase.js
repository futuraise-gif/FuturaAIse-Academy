"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const firebase_1 = require("../config/firebase");
const types_1 = require("../types");
const USERS_COLLECTION = 'users';
class UserModel {
    static async create(uid, userData) {
        const userDoc = {
            email: userData.email,
            first_name: userData.first_name,
            last_name: userData.last_name,
            role: userData.role || types_1.UserRole.STUDENT,
            status: userData.status || types_1.UserStatus.ACTIVE,
            student_id: userData.student_id || null,
            instructor_id: userData.instructor_id || null,
            phone: userData.phone || null,
            date_of_birth: userData.date_of_birth || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        await firebase_1.db.collection(USERS_COLLECTION).doc(uid).set(userDoc);
        return {
            id: uid,
            ...userDoc,
        };
    }
    static async findByEmail(email) {
        try {
            const userRecord = await firebase_1.auth.getUserByEmail(email);
            const userDoc = await firebase_1.db.collection(USERS_COLLECTION).doc(userRecord.uid).get();
            if (!userDoc.exists) {
                return null;
            }
            return {
                id: userRecord.uid,
                ...userDoc.data(),
                firebaseUser: userRecord,
            };
        }
        catch (error) {
            return null;
        }
    }
    static async findById(id) {
        try {
            const userDoc = await firebase_1.db.collection(USERS_COLLECTION).doc(id).get();
            if (!userDoc.exists) {
                return null;
            }
            return {
                id: userDoc.id,
                ...userDoc.data(),
            };
        }
        catch (error) {
            return null;
        }
    }
    static async findByStudentId(student_id) {
        try {
            const snapshot = await firebase_1.db.collection(USERS_COLLECTION)
                .where('student_id', '==', student_id)
                .limit(1)
                .get();
            if (snapshot.empty) {
                return null;
            }
            const doc = snapshot.docs[0];
            return {
                id: doc.id,
                ...doc.data(),
            };
        }
        catch (error) {
            return null;
        }
    }
    static async findByInstructorId(instructor_id) {
        try {
            const snapshot = await firebase_1.db.collection(USERS_COLLECTION)
                .where('instructor_id', '==', instructor_id)
                .limit(1)
                .get();
            if (snapshot.empty) {
                return null;
            }
            const doc = snapshot.docs[0];
            return {
                id: doc.id,
                ...doc.data(),
            };
        }
        catch (error) {
            return null;
        }
    }
    static async findAll(filters) {
        let query = firebase_1.db.collection(USERS_COLLECTION);
        if (filters?.role) {
            query = query.where('role', '==', filters.role);
        }
        if (filters?.status) {
            query = query.where('status', '==', filters.status);
        }
        if (filters?.limit) {
            query = query.limit(filters.limit);
        }
        const snapshot = await query.get();
        const users = [];
        snapshot.forEach((doc) => {
            users.push({
                id: doc.id,
                ...doc.data(),
            });
        });
        return users;
    }
    static async update(id, updates) {
        try {
            const allowedFields = ['first_name', 'last_name', 'phone', 'bio', 'profile_image_url', 'date_of_birth', 'role', 'status', 'student_id', 'instructor_id'];
            const updateData = {
                updated_at: new Date().toISOString(),
            };
            Object.keys(updates).forEach((key) => {
                if (allowedFields.includes(key)) {
                    updateData[key] = updates[key];
                }
            });
            await firebase_1.db.collection(USERS_COLLECTION).doc(id).update(updateData);
            if (updates.first_name || updates.last_name) {
                const userDoc = await firebase_1.db.collection(USERS_COLLECTION).doc(id).get();
                const userData = userDoc.data();
                await firebase_1.auth.updateUser(id, {
                    displayName: `${userData?.first_name} ${userData?.last_name}`,
                });
            }
            return this.findById(id);
        }
        catch (error) {
            return null;
        }
    }
    static async updateStatus(id, status) {
        try {
            await firebase_1.db.collection(USERS_COLLECTION).doc(id).update({
                status,
                updated_at: new Date().toISOString(),
            });
            await firebase_1.auth.updateUser(id, {
                disabled: status !== types_1.UserStatus.ACTIVE,
            });
            return this.findById(id);
        }
        catch (error) {
            return null;
        }
    }
    static async updateLastLogin(id) {
        await firebase_1.db.collection(USERS_COLLECTION).doc(id).update({
            last_login: new Date().toISOString(),
        });
    }
    static async delete(id) {
        try {
            await firebase_1.auth.deleteUser(id);
            await firebase_1.db.collection(USERS_COLLECTION).doc(id).delete();
            return true;
        }
        catch (error) {
            return false;
        }
    }
    static async verifyPassword(email, password) {
        return true;
    }
}
exports.UserModel = UserModel;
//# sourceMappingURL=user.firebase.js.map