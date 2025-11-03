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
    let value = e.target.value;
    
    // Auto-format EIN and Phone
    if (e.target.name === 'ein') {
      value = formatEIN(value);
    } else if (e.target.name === 'phone') {
      value = formatPhone(value);
    }
    
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authService.register(formData);
      
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
    } catch (error: any) {
      let errorMessage = 'Registration failed. Please try again.';
      
      // Check for specific error messages
      if (error.response?.data?.error || error.response?.data?.message) {
        const backendError = error.response.data.error || error.response.data.message;
        
        // User-friendly duplicate email message
        if (backendError.includes('already exists') || backendError.includes('User already exists')) {
          errorMessage = `A user with the email address ${formData.email} already exists. Please use a different email or try logging in.`;
        } 
        // Other validation errors
        else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (backendError) {
          errorMessage = backendError;
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
                  className="input"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
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
                    className="input pr-10"
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
                  className="input"
                  value={formData.company}
                  onChange={handleChange}
                />
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
                  className="input"
                  value={formData.phone}
                  onChange={handleChange}
                />
                <p className="text-xs text-gray-500 mt-1">US/Canada format only</p>
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
                    className="input"
                    value={formData.usdotNumber}
                    onChange={handleChange}
                  />
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
                    className="input"
                    value={formData.ein}
                    onChange={handleChange}
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: XX-XXXXXXX</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn btn-accent py-3 text-lg text-white"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;

