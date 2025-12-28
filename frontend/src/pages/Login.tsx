import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore.firebase';
import api from '@/config/api';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/config/firebase';

export default function Login() {
  const [loginMethod, setLoginMethod] = useState<'email' | 'id'>('email');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setUser, setToken, setIsAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('Attempting Firebase login...');

      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Firebase login successful');

      const idToken = await userCredential.user.getIdToken();

      // Call backend to get user profile
      console.log('Fetching user profile from backend...');
      const response = await api.post('/auth/login', {
        email,
        idToken,
      });

      setUser(response.data.user);
      setToken(idToken); // Store ID token (not custom token)
      setIsAuthenticated(true);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);

      // Better error messages
      let errorMessage = 'Login failed';

      if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Network error: Cannot connect to authentication server. Please check your internet connection and try again.';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later.';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleIdLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Call backend to get email for student/instructor ID
      const response = await api.post('/auth/login-with-id', {
        user_id: userId,
        password,
      });

      // Sign in with Firebase using the returned email
      const userCredential = await signInWithEmailAndPassword(
        auth,
        response.data.email,
        password
      );
      const idToken = await userCredential.user.getIdToken();

      // Get final user profile
      const profileResponse = await api.post('/auth/login', {
        email: response.data.email,
        idToken,
      });

      setUser(profileResponse.data.user);
      setToken(idToken); // Store ID token (not custom token)
      setIsAuthenticated(true);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login with ID error:', err);
      setError(err.response?.data?.error || err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = loginMethod === 'email' ? handleEmailLogin : handleIdLogin;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-gray-900">
            FuturaAIse Academy
          </h2>
          <p className="mt-2 text-center text-xs sm:text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>

        {/* Login Method Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setLoginMethod('email')}
            className={`flex-1 py-2 px-2 sm:px-4 text-center text-xs sm:text-sm font-medium ${
              loginMethod === 'email'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Email Login
          </button>
          <button
            onClick={() => setLoginMethod('id')}
            className={`flex-1 py-2 px-2 sm:px-4 text-center text-xs sm:text-sm font-medium ${
              loginMethod === 'id'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Student/Instructor ID
          </button>
        </div>

        <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded text-xs sm:text-sm">
              {error}
            </div>
          )}

          <div className="space-y-3 sm:space-y-4">
            {loginMethod === 'email' ? (
              <div>
                <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter your email"
                />
              </div>
            ) : (
              <div>
                <label htmlFor="userId" className="block text-xs sm:text-sm font-medium text-gray-700">
                  Student ID or Instructor ID
                </label>
                <input
                  id="userId"
                  name="userId"
                  type="text"
                  required
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., STU20250001 or INS20250001"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Use your Student ID (STU...) or Instructor ID (INS...)
                </p>
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2.5 sm:py-2 px-4 border border-transparent rounded-md shadow-sm text-sm sm:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                Register here (Students only)
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
