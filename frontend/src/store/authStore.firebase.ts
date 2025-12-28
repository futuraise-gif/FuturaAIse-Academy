import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { AuthState, RegisterData, User, UserRole, UserStatus } from '@/types';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user: User | null) => set({ user }),
      setToken: (token: string | null) => set({ token }),
      setIsAuthenticated: (isAuthenticated: boolean) => set({ isAuthenticated }),

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const uid = userCredential.user.uid;

          const userDoc = await getDoc(doc(db, 'users', uid));

          if (!userDoc.exists()) {
            throw new Error('User profile not found');
          }

          const userData = userDoc.data() as User;

          if (userData.status !== UserStatus.ACTIVE) {
            throw new Error('Account is not active');
          }

          await updateDoc(doc(db, 'users', uid), {
            last_login: new Date().toISOString(),
          });

          const token = await userCredential.user.getIdToken();

          const user: User = {
            id: uid,
            ...userData,
          };

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(error.message || 'Login failed');
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true });
        try {
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            data.email,
            data.password
          );
          const uid = userCredential.user.uid;

          const userDoc = {
            email: data.email,
            first_name: data.first_name,
            last_name: data.last_name,
            role: data.role || UserRole.STUDENT,
            status: UserStatus.ACTIVE,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          await setDoc(doc(db, 'users', uid), userDoc);

          const token = await userCredential.user.getIdToken();

          const user: User = {
            id: uid,
            ...userDoc,
          };

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(error.message || 'Registration failed');
        }
      },

      logout: async () => {
        try {
          await signOut(auth);
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        } catch (error) {
          console.error('Logout error:', error);
        }
      },

      updateProfile: async (updates: Partial<User>) => {
        set({ isLoading: true });
        try {
          const currentUser = get().user;
          if (!currentUser) {
            throw new Error('Not authenticated');
          }

          await updateDoc(doc(db, 'users', currentUser.id), {
            ...updates,
            updated_at: new Date().toISOString(),
          });

          const userDoc = await getDoc(doc(db, 'users', currentUser.id));
          const userData = userDoc.data() as User;

          const user: User = {
            id: currentUser.id,
            ...userData,
          };

          set({
            user,
            isLoading: false,
          });
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(error.message || 'Profile update failed');
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

onAuthStateChanged(auth, async (firebaseUser) => {
  if (firebaseUser) {
    const token = await firebaseUser.getIdToken();
    useAuthStore.setState({ token });
  }
});
