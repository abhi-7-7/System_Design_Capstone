import { Component } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import type { AxiosError } from 'axios';
import api from '../api/axios';

interface RegisterState {
  name: string;
  email: string;
  password: string;
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

/**
 * Register — creates a new user account.
 *
 * Fix: Replaced window.alert() with an inline success message and
 * auto-redirect. alert() blocks the thread and looks unprofessional.
 */
class Register extends Component<object, RegisterState> {
  state: RegisterState = {
    name: '',
    email: '',
    password: '',
    isLoading: false,
    error: null,
    success: false,
  };

  validateForm = (): boolean => {
    const { name, email, password } = this.state;
    if (!name || !email || !password) {
      this.setState({ error: 'Please fill out all required fields.' });
      return false;
    }
    if (password.length < 6) {
      this.setState({ error: 'Password must be at least 6 characters.' });
      return false;
    }
    this.setState({ error: null });
    return true;
  };

  handleInputChange = (e: ChangeEvent<HTMLInputElement>, field: 'name' | 'email' | 'password') => {
    this.setState({ [field]: e.target.value, error: null } as Pick<RegisterState, 'name' | 'email' | 'password' | 'error'>);
  };

  handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (!this.validateForm()) return;

    this.setState({ isLoading: true, error: null });

    try {
      const { name, email, password } = this.state;
      await api.post('/auth/register', { email, password, name });

      // Store name for a smoother first-login experience.
      localStorage.setItem('userName', name);

      this.setState({ success: true });

      // Redirect to login after short delay so the user sees the success message.
      setTimeout(() => window.location.replace('/'), 1500);
    } catch (err: unknown) {
      let message = 'An unexpected error occurred during registration.';

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
    const { name, email, password, isLoading, error, success } = this.state;

    return (
      <div className="min-h-screen bg-[#000000] text-gray-300 font-sans selection:bg-indigo-500/30 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#111] border border-[#222] rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] p-8 relative overflow-hidden animate-scale-up">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/20 mx-auto mb-4">
              SF
            </div>
            <h2 className="text-2xl font-semibold text-gray-100 tracking-tight mb-1">Create an account</h2>
            <p className="text-[13px] text-gray-500 font-medium">Join SmartFlow to supercharge your productivity</p>
          </div>

          {success && (
            <div className="mb-5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-lg flex items-center gap-2.5 animate-slide-down">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-[13px] font-medium">Account created! Redirecting to login…</p>
            </div>
          )}

          <form onSubmit={this.handleRegister}>
            {error && (
              <div className="mb-5 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg flex items-center gap-2.5 animate-slide-down">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-[13px] font-medium leading-snug">{error}</p>
              </div>
            )}

            <div className="mb-5">
              <label className="block text-[12px] font-medium text-gray-500 mb-2 uppercase tracking-wide">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => this.handleInputChange(e, 'name')}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-[14px] text-gray-100 placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-300"
              />
            </div>

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
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => this.handleInputChange(e, 'password')}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-[14px] text-gray-100 placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-300"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || success}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white rounded-lg font-semibold text-[14px] shadow-lg shadow-indigo-500/20 transition-all duration-300 flex justify-center items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating account…
                </>
              ) : 'Register for SmartFlow'}
            </button>

            <p className="mt-6 text-center text-[13px] text-gray-500 font-medium">
              Already have an account?{' '}
              <a href="/" className="text-gray-300 hover:text-white hover:underline underline-offset-4 transition-colors">
                Sign in here
              </a>
            </p>
          </form>
        </div>
      </div>
    );
  }
}

export default Register;
