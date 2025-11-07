import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { useUIStore } from '../../store/uiStore';
import { ROUTES } from '../../utils/constants';
import type { RegisterData } from '../../types/user.types';
import { UserPlus, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    password: '',
    company: '',
    phone: '',
    accountType: 'carrier',
    usdotNumber: '',
    mcNumber: '',
    ein: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { addNotification } = useUIStore();
  const navigate = useNavigate();

  // Auto-format EIN: xx-xxxxxxx
  const formatEIN = (value: string): string => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Limit to 9 digits
    const limitedDigits = digits.slice(0, 9);
    // Add hyphen after 2 digits
    if (limitedDigits.length <= 2) {
      return limitedDigits;
    }
    return `${limitedDigits.slice(0, 2)}-${limitedDigits.slice(2)}`;
  };

  // Auto-format Phone: (xxx) xxx-xxxx
  const formatPhone = (value: string): string => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Limit to 11 digits (US + Canada with country code)
    const limitedDigits = digits.slice(0, 11);
    
    // If starts with 1, treat as country code
    if (limitedDigits.length === 0) return '';
    if (limitedDigits.length === 1) return limitedDigits;
    if (limitedDigits.startsWith('1') && limitedDigits.length > 1) {
      const withoutCountry = limitedDigits.slice(1);
      if (withoutCountry.length === 0) return `+1`;
      if (withoutCountry.length <= 3) return `+1 (${withoutCountry}`;
      if (withoutCountry.length <= 6) return `+1 (${withoutCountry.slice(0, 3)}) ${withoutCountry.slice(3)}`;
      return `+1 (${withoutCountry.slice(0, 3)}) ${withoutCountry.slice(3, 6)}-${withoutCountry.slice(6)}`;
    }
    
    // Regular US/Canada format
    if (limitedDigits.length <= 3) return `(${limitedDigits}`;
    if (limitedDigits.length <= 6) return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3)}`;
    return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6)}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = e.target;
    let value = e.target.value;
    
    // Auto-format EIN and Phone
    if (name === 'ein') {
      value = formatEIN(value);
    } else if (name === 'phone') {
      value = formatPhone(value);
    }

    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear field-level errors when user updates input
    setErrors(prev => {
      if (!prev[name]) return prev;
      const { [name]: _removed, ...rest } = prev;
      return rest;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const trimmedEmail = formData.email.trim().toLowerCase();
    const passwordValue = formData.password.trim();
    const companyValue = formData.company.trim();
    const phoneDigits = formData.phone.replace(/\D/g, '');
    const usdotDigits = (formData.usdotNumber || '').replace(/\D/g, '');
    const mcDigits = (formData.mcNumber || '').replace(/\D/g, '');
    const einDigits = (formData.ein || '').replace(/\D/g, '');

    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!passwordValue || passwordValue.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long.';
    }

    if (!companyValue) {
      newErrors.company = 'Company name is required.';
    }

    if (phoneDigits.length < 10) {
      newErrors.phone = 'Enter a valid 10 digit phone number.';
    }

    if (needsAuthority) {
      if (!usdotDigits || usdotDigits.length < 6) {
        newErrors.usdotNumber = 'USDOT number must have at least 6 digits.';
      }

      if (!einDigits || einDigits.length !== 9) {
        newErrors.ein = 'EIN must contain exactly 9 digits.';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      addNotification({ type: 'error', message: 'Please fix the highlighted fields and try again.' });
      return;
    }

    setIsLoading(true);

    try {
      const payload: RegisterData = {
        email: trimmedEmail,
        password: passwordValue,
        company: companyValue,
        phone: phoneDigits,
        accountType: formData.accountType,
        usdotNumber: needsAuthority ? usdotDigits : undefined,
        mcNumber: mcDigits ? mcDigits : undefined,
        ein: needsAuthority ? einDigits : undefined,
      };

      const response = await authService.register(payload);
      
      // Show verification code if email wasn't sent (for development/testing)
      if (!response.emailSent && response.verification?.code) {
        addNotification({ 
          type: 'warning', 
          message: `Email delivery issue detected. Your verification code is: ${response.verification.code}`,
          duration: 15000 // Show longer
        });
      } else {
        addNotification({ type: 'success', message: response.message || 'Registration successful!' });
      }
      
      // Navigate to verify page with email
      navigate(`${ROUTES.VERIFY}?email=${encodeURIComponent(formData.email)}`);
    } catch (error: unknown) {
      let errorMessage = 'Registration failed. Please try again.';
      
      // Check for specific error messages
      if (error && typeof error === 'object' && 'response' in error) {
        const errorResponse = error as { response?: { data?: { error?: string; message?: string } } };
        if (errorResponse.response?.data?.error || errorResponse.response?.data?.message) {
          const backendError = errorResponse.response.data.error || errorResponse.response.data.message;
          
          // User-friendly duplicate email message
          if (backendError && (backendError.includes('already exists') || backendError.includes('User already exists'))) {
            errorMessage = `A user with the email address ${formData.email} already exists. Please use a different email or try logging in.`;
          } 
          // Other validation errors
          else if (errorResponse.response.data.message) {
            errorMessage = errorResponse.response.data.message;
          } else if (backendError) {
            errorMessage = backendError;
          }
        }
      }
      
      addNotification({ 
        type: 'error', 
        message: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const needsAuthority = formData.accountType === 'carrier' || formData.accountType === 'broker';

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 bg-gray-50">
      <div className="max-w-2xl w-full">
        <div className="card border-2 border-primary-blue/30 shadow-xl animate-scale-in">
          <div className="text-center mb-8">
            <div className="gradient-blue w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 glow-blue">
              <UserPlus className="h-10 w-10 text-orange-accent" />
            </div>
            <h2 className="text-4xl font-heading font-bold text-gray-900">Create Account</h2>
            <p className="text-gray-700 mt-2 text-lg">Join <span className="text-orange-accent font-semibold">CargoLume</span> today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">
                Account Type
              </label>
              <select
                name="accountType"
                className="input"
                value={formData.accountType}
                onChange={handleChange}
                required
              >
                <option value="carrier">Carrier</option>
                <option value="broker">Broker</option>
                <option value="shipper">Shipper</option>
              </select>
            </div>

            {/* Basic Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  className={`input ${errors.email ? 'border-red-500' : ''}`}
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    className={`input pr-10 ${errors.password ? 'border-red-500' : ''}`}
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name *
                </label>
                <input
                  name="company"
                  type="text"
                  required
                  className={`input ${errors.company ? 'border-red-500' : ''}`}
                  value={formData.company}
                  onChange={handleChange}
                />
                {errors.company && <p className="text-red-500 text-xs mt-1">{errors.company}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  name="phone"
                  type="tel"
                  required
                  placeholder="(555) 123-4567"
                  className={`input ${errors.phone ? 'border-red-500' : ''}`}
                  value={formData.phone}
                  onChange={handleChange}
                />
                <p className="text-xs text-gray-500 mt-1">US/Canada format only</p>
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
            </div>

            {/* Authority Info (for carriers/brokers) */}
            {needsAuthority && (
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    USDOT Number *
                  </label>
                  <input
                    name="usdotNumber"
                    type="text"
                    className={`input ${errors.usdotNumber ? 'border-red-500' : ''}`}
                    value={formData.usdotNumber}
                    onChange={handleChange}
                    required={needsAuthority}
                  />
                  {errors.usdotNumber && <p className="text-red-500 text-xs mt-1">{errors.usdotNumber}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    MC Number
                  </label>
                  <input
                    name="mcNumber"
                    type="text"
                    className="input"
                    value={formData.mcNumber}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    EIN *
                  </label>
                  <input
                    name="ein"
                    type="text"
                    placeholder="12-3456789"
                    maxLength={10}
                    className={`input ${errors.ein ? 'border-red-500' : ''}`}
                    value={formData.ein}
                    onChange={handleChange}
                    required={needsAuthority}
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: XX-XXXXXXX</p>
                  {errors.ein && <p className="text-red-500 text-xs mt-1">{errors.ein}</p>}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn btn-accent py-3 text-lg text-white"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
                  Creating Account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;

