import { useAuthStore } from '../store/authStore';
import { User, Mail, Phone, Building, Shield } from 'lucide-react';

const Profile = () => {
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-2">View and manage your account information</p>
        </div>

        <div className="card">
          <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-gray-200">
            <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center">
              <User className="h-10 w-10 text-primary-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user.company}</h2>
              <p className="text-gray-600 capitalize">{user.accountType}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium text-gray-900">{user.phone}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Building className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Company</p>
                <p className="font-medium text-gray-900">{user.company}</p>
              </div>
            </div>

            {(user.accountType === 'carrier' || user.accountType === 'broker') && (
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Authority</p>
                  <div className="flex gap-4 mt-1">
                    {user.usdotNumber && (
                      <span className="text-sm font-medium text-gray-900">
                        USDOT: {user.usdotNumber}
                      </span>
                    )}
                    {user.mcNumber && (
                      <span className="text-sm font-medium text-gray-900">
                        MC: {user.mcNumber}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Subscription Plan</p>
                  <p className="font-bold text-primary-600 capitalize">{user.subscriptionPlan}</p>
                </div>
                {user.isEmailVerified ? (
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    Verified
                  </span>
                ) : (
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                    Not Verified
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;




