import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { ROUTES } from '../../utils/constants';
import { Mail } from 'lucide-react';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const emailFromUrl = searchParams.get('email') || '';
  
  const [email, setEmail] = useState(emailFromUrl);
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { addNotification } = useUIStore();
  const { setUser } = useAuthStore();
  const navigate = useNavigate();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedCode = code.trim();
    const newErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      newErrors.email = 'Enter a valid email address.';
    }

    if (!trimmedCode || trimmedCode.length !== 6) {
      newErrors.code = 'Verification code must be 6 digits.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      addNotification({ type: 'error', message: 'Please correct the highlighted fields.' });
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.verifyEmail(trimmedEmail, trimmedCode);
      addNotification({ type: 'success', message: 'Email verified successfully! Please log in.' });
      
      // If response includes user data, update auth store
      if (response.user) {
        setUser(response.user);
      }
      
      // Navigate to login after successful verification
      navigate(ROUTES.LOGIN);
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Verification failed. Please check your code.'
        : 'Verification failed. Please check your code.';
      addNotification({ 
        type: 'error', 
        message: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setErrors(prev => ({ ...prev, email: 'Enter a valid email address before requesting a new code.' }));
      addNotification({ type: 'error', message: 'Enter a valid email address before requesting a new code.' });
      return;
    }

    setIsResending(true);

    try {
      await authService.resendCode(trimmedEmail);
      addNotification({ type: 'success', message: 'Verification code resent!' });
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to resend code.'
        : 'Failed to resend code.';
      addNotification({ 
        type: 'error', 
        message: errorMessage
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="card">
          <div className="text-center mb-8">
            <Mail className="h-12 w-12 text-primary-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900">Verify Your Email</h2>
            <p className="text-gray-600 mt-2">Enter the 6-digit code we sent to your email</p>
          </div>

          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                className={`input ${errors.email ? 'border-red-500' : ''}`}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors(prev => {
                    if (!prev.email) return prev;
                    const { email: _removed, ...rest } = prev;
                    return rest;
                  });
                }}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Verification Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                className={`input text-center text-2xl tracking-widest ${errors.code ? 'border-red-500' : ''}`}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.replace(/\D/g, ''));
                  setErrors(prev => {
                    if (!prev.code) return prev;
                    const { code: _removed, ...rest } = prev;
                    return rest;
                  });
                }}
                placeholder="000000"
              />
              {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn btn-primary py-3 text-lg"
            >
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={handleResendCode}
              className={`text-primary-600 font-semibold hover:text-primary-700 disabled:opacity-60 disabled:cursor-not-allowed`}
              disabled={isResending}
            >
              {isResending ? 'Sending...' : 'Resend Code'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;

