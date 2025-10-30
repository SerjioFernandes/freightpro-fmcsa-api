import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { useUIStore } from '../../store/uiStore';
import { ROUTES } from '../../utils/constants';
import type { RegisterData } from '../../types/user.types';
import { UserPlus } from 'lucide-react';

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
  const [isLoading, setIsLoading] = useState(false);
  
  const { addNotification } = useUIStore();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authService.register(formData);
      addNotification({ type: 'success', message: response.message || 'Registration successful!' });
      // Navigate to verify page with email
      navigate(`${ROUTES.VERIFY}?email=${encodeURIComponent(formData.email)}`);
    } catch (error: any) {
      addNotification({ 
        type: 'error', 
        message: error.response?.data?.message || 'Registration failed. Please try again.' 
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
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  className="input"
                  value={formData.password}
                  onChange={handleChange}
                />
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
                  className="input"
                  value={formData.phone}
                  onChange={handleChange}
                />
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
                    className="input"
                    value={formData.ein}
                    onChange={handleChange}
                  />
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

