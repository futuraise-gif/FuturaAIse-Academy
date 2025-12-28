import { auth, db } from '../config/firebase';
import { SafeUser, UserRole, UserStatus } from '../types';

const USERS_COLLECTION = 'users';

export class UserModel {
  static async create(uid: string, userData: {
    email: string;
    first_name: string;
    last_name: string;
    role?: UserRole;
    student_id?: string;
    instructor_id?: string;
    status?: UserStatus;
    phone?: string;
    date_of_birth?: string;
  }): Promise<SafeUser> {
    const userDoc = {
      email: userData.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      role: userData.role || UserRole.STUDENT,
      status: userData.status || UserStatus.ACTIVE,
      student_id: userData.student_id || null,
      instructor_id: userData.instructor_id || null,
      phone: userData.phone || null,
      date_of_birth: userData.date_of_birth || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await db.collection(USERS_COLLECTION).doc(uid).set(userDoc);

    return {
      id: uid,
      ...userDoc,
    } as SafeUser;
  }

  static async findByEmail(email: string): Promise<any | null> {
    try {
      const userRecord = await auth.getUserByEmail(email);
      const userDoc = await db.collection(USERS_COLLECTION).doc(userRecord.uid).get();

      if (!userDoc.exists) {
        return null;
      }

      return {
        id: userRecord.uid,
        ...userDoc.data(),
        firebaseUser: userRecord,
      };
    } catch (error) {
      return null;
    }
  }

  static async findById(id: string): Promise<SafeUser | null> {
    try {
      const userDoc = await db.collection(USERS_COLLECTION).doc(id).get();

      if (!userDoc.exists) {
        return null;
      }

      return {
        id: userDoc.id,
        ...userDoc.data(),
      } as SafeUser;
    } catch (error) {
      return null;
    }
  }

  static async findByStudentId(student_id: string): Promise<SafeUser | null> {
    try {
      const snapshot = await db.collection(USERS_COLLECTION)
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
      } as SafeUser;
    } catch (error) {
      return null;
    }
  }

  static async findByInstructorId(instructor_id: string): Promise<SafeUser | null> {
    try {
      const snapshot = await db.collection(USERS_COLLECTION)
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
      } as SafeUser;
    } catch (error) {
      return null;
    }
  }

  static async findAll(filters?: {
    role?: UserRole;
    status?: UserStatus;
    limit?: number;
  }): Promise<SafeUser[]> {
    let query: any = db.collection(USERS_COLLECTION);

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
    const users: SafeUser[] = [];

    snapshot.forEach((doc: any) => {
      users.push({
        id: doc.id,
        ...doc.data(),
      } as SafeUser);
    });

    return users;
  }

  static async update(id: string, updates: Partial<SafeUser>): Promise<SafeUser | null> {
    try {
      const allowedFields = ['first_name', 'last_name', 'phone', 'bio', 'profile_image_url', 'date_of_birth', 'role', 'status', 'student_id', 'instructor_id'];
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      Object.keys(updates).forEach((key) => {
        if (allowedFields.includes(key)) {
          updateData[key] = (updates as any)[key];
        }
      });

      await db.collection(USERS_COLLECTION).doc(id).update(updateData);

      if (updates.first_name || updates.last_name) {
        const userDoc = await db.collection(USERS_COLLECTION).doc(id).get();
        const userData = userDoc.data();
        await auth.updateUser(id, {
          displayName: `${userData?.first_name} ${userData?.last_name}`,
        });
      }

      return this.findById(id);
    } catch (error) {
      return null;
    }
  }

  static async updateStatus(id: string, status: UserStatus): Promise<SafeUser | null> {
    try {
      await db.collection(USERS_COLLECTION).doc(id).update({
        status,
        updated_at: new Date().toISOString(),
      });

      await auth.updateUser(id, {
        disabled: status !== UserStatus.ACTIVE,
      });

      return this.findById(id);
    } catch (error) {
      return null;
    }
  }

  static async updateLastLogin(id: string): Promise<void> {
    await db.collection(USERS_COLLECTION).doc(id).update({
      last_login: new Date().toISOString(),
    });
  }

  static async delete(id: string): Promise<boolean> {
    try {
      await auth.deleteUser(id);
      await db.collection(USERS_COLLECTION).doc(id).delete();
      return true;
    } catch (error) {
      return false;
    }
  }

  static async verifyPassword(email: string, password: string): Promise<boolean> {
    return true;
  }
}
