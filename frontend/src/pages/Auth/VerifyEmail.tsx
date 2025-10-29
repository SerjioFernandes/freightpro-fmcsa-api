import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { useUIStore } from '../../store/uiStore';
import { ROUTES } from '../../utils/constants';
import { Mail } from 'lucide-react';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const emailFromUrl = searchParams.get('email') || '';
  
  const [email, setEmail] = useState(emailFromUrl);
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { addNotification } = useUIStore();
  const navigate = useNavigate();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authService.verifyEmail(email, code);
      addNotification({ type: 'success', message: 'Email verified successfully!' });
      navigate(ROUTES.LOGIN);
    } catch (error: any) {
      addNotification({ 
        type: 'error', 
        message: error.response?.data?.message || 'Verification failed. Please check your code.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      await authService.resendCode(email);
      addNotification({ type: 'success', message: 'Verification code resent!' });
    } catch (error: any) {
      addNotification({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to resend code.' 
      });
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
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Verification Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                className="input text-center text-2xl tracking-widest"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
              />
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
              className="text-primary-600 font-semibold hover:text-primary-700"
            >
              Resend Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;

