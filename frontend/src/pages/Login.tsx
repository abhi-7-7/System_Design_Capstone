import { Component } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import type { AxiosError } from 'axios';
import api from '../api/axios';

interface LoginState {
  email: string;
  password: string;
  isLoading: boolean;
  error: string | null;
}

/**
 * Login — authenticates the user and stores the accessToken.
 *
 * Fix: also stores userName from the register flow if available.
 * Uses navigate via window.location.replace to clear history stack on login.
 */
class Login extends Component<object, LoginState> {
  state: LoginState = {
    email: '',
    password: '',
    isLoading: false,
    error: null,
  };

  validateForm = (): boolean => {
    const { email, password } = this.state;
    if (!email || !password) {
      this.setState({ error: 'Please enter both email and password.' });
      return false;
    }
    this.setState({ error: null });
    return true;
  };

  handleInputChange = (e: ChangeEvent<HTMLInputElement>, field: 'email' | 'password') => {
    this.setState({ [field]: e.target.value, error: null } as Pick<LoginState, 'email' | 'password' | 'error'>);
  };

  handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!this.validateForm()) return;

    this.setState({ isLoading: true, error: null });

    try {
      const { email, password } = this.state;
      const response = await api.post<{ accessToken?: string }>('/auth/login', { email, password });

      const token = response.data?.accessToken;
      if (!token) throw new Error('No access token received from server.');

      localStorage.setItem('accessToken', token);
      localStorage.setItem('userEmail', email);
      // Navigate with replace so the back button doesn't return to login.
      window.location.replace('/dashboard');
    } catch (err: unknown) {
      let message = 'An unexpected error occurred.';

      if (axios.isAxiosError(err)) {
        const axiosErr = err as AxiosError<{ error?: string; message?: string }>;
        message =
          axiosErr.response?.data?.error ||
          axiosErr.response?.data?.message ||
          axiosErr.message;
      } else if (err instanceof Error) {
        message = err.message;
      }

      this.setState({ error: message });
    } finally {
      this.setState({ isLoading: false });
    }
  };

  render() {
    const { email, password, isLoading, error } = this.state;

    return (
      <div className="min-h-screen bg-[#000000] text-gray-300 font-sans selection:bg-indigo-500/30 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#111] border border-[#222] rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] p-8 relative overflow-hidden animate-scale-up">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/20 mx-auto mb-4">
              SF
            </div>
            <h2 className="text-2xl font-semibold text-gray-100 tracking-tight mb-1">Welcome back</h2>
            <p className="text-[13px] text-gray-500 font-medium">Enter your credentials to access SmartFlow</p>
          </div>

          <form onSubmit={this.handleLogin}>
            {error && (
              <div className="mb-5 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg flex items-center gap-2.5 animate-slide-down">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-[13px] font-medium leading-snug">{error}</p>
              </div>
            )}

            <div className="mb-5">
              <label className="block text-[12px] font-medium text-gray-500 mb-2 uppercase tracking-wide">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => this.handleInputChange(e, 'email')}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-[14px] text-gray-100 placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-300"
              />
            </div>

            <div className="mb-8">
              <label className="block text-[12px] font-medium text-gray-500 mb-2 uppercase tracking-wide">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => this.handleInputChange(e, 'password')}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-[14px] text-gray-100 placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-300"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white rounded-lg font-semibold text-[14px] shadow-lg shadow-indigo-500/20 transition-all duration-300 flex justify-center items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Authenticating…
                </>
              ) : 'Sign in to SmartFlow'}
            </button>

            <p className="mt-6 text-center text-[13px] text-gray-500 font-medium">
              Don't have an account?{' '}
              <a href="/register" className="text-gray-300 hover:text-white hover:underline underline-offset-4 transition-colors">
                Create an account
              </a>
            </p>
          </form>
        </div>
      </div>
    );
  }
}

export default Login;
