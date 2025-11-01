import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, Building, Shield, Calendar, Award, CheckCircle, Clock, Edit } from 'lucide-react';
import { ROUTES } from '../utils/constants';

const Profile = () => {
  const { user } = useAuthStore();

  if (!user) return null;

  const formatDate = (date?: Date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case 'carrier':
        return '🚛';
      case 'broker':
        return '📋';
      case 'shipper':
        return '📦';
      default:
        return '👤';
    }
  };

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'carrier':
        return 'from-blue-500 to-blue-600';
      case 'broker':
        return 'from-green-500 to-green-600';
      case 'shipper':
        return 'from-orange-500 to-orange-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getPlanBadgeColor = (plan?: string) => {
    switch (plan) {
      case 'ultima':
        return 'bg-gradient-to-r from-purple-500 to-purple-600';
      case 'premium':
        return 'bg-gradient-to-r from-orange-500 to-orange-600';
      case 'free':
        return 'bg-gradient-to-r from-gray-500 to-gray-600';
      default:
        return 'bg-gradient-to-r from-blue-500 to-blue-600';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600 text-lg">Manage your account information and preferences</p>
        </div>

        {/* Main Profile Card */}
        <div className="card shadow-xl mb-6 overflow-hidden">
          {/* Header with gradient background */}
          <div className={`bg-gradient-to-r ${getAccountTypeColor(user.accountType)} text-white p-8 relative`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="h-24 w-24 rounded-full bg-white bg-opacity-20 backdrop-blur-sm border-4 border-white flex items-center justify-center">
                  {user.profilePhoto ? (
                    <img src={user.profilePhoto} alt={user.company} className="h-full w-full rounded-full object-cover" />
                  ) : (
                    <span className="text-5xl">{getAccountTypeIcon(user.accountType)}</span>
                  )}
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-2">{user.company}</h2>
                  <div className="flex items-center space-x-3">
                    <span className="capitalize bg-black bg-opacity-30 backdrop-blur-sm px-4 py-1 rounded-full text-sm font-semibold border border-white border-opacity-40">
                      {user.accountType}
                    </span>
                    {user.isEmailVerified ? (
                      <span className="bg-green-500 px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                        <CheckCircle className="h-4 w-4" />
                        <span>Verified</span>
                      </span>
                    ) : (
                      <span className="bg-yellow-500 px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>Pending Verification</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <Link to={ROUTES.SETTINGS}>
                <button className="bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center space-x-2 shadow-lg">
                  <Edit className="h-5 w-5" />
                  <span>Edit Profile</span>
                </button>
              </Link>
            </div>
          </div>

          {/* Content Grid */}
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column - Contact Information */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Mail className="h-5 w-5 mr-2 text-primary-blue" />
                    Contact Information
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="mt-0.5">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-1">Email Address</p>
                        <p className="font-medium text-gray-900">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="mt-0.5">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                        <p className="font-medium text-gray-900">{user.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="mt-0.5">
                        <Building className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-1">Company Name</p>
                        <p className="font-medium text-gray-900">{user.company}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Authority Information for Carriers/Brokers */}
                {(user.accountType === 'carrier' || user.accountType === 'broker') && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <Shield className="h-5 w-5 mr-2 text-primary-blue" />
                      Authority & Credentials
                    </h3>
                    <div className="space-y-4">
                      {user.usdotNumber && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-600 font-semibold mb-1">USDOT Number</p>
                          <p className="text-lg font-bold text-blue-900">{user.usdotNumber}</p>
                        </div>
                      )}
                      {user.mcNumber && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm text-green-600 font-semibold mb-1">MC Number</p>
                          <p className="text-lg font-bold text-green-900">{user.mcNumber}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Account Status & Subscription */}
              <div className="space-y-6">
                {/* Subscription Information */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Award className="h-5 w-5 mr-2 text-primary-blue" />
                    Subscription Plan
                  </h3>
                  <div className={`p-6 rounded-lg text-white ${getPlanBadgeColor(user.subscriptionPlan)} shadow-lg`}>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm opacity-90 mb-1">Current Plan</p>
                        <p className="text-3xl font-bold capitalize">{user.subscriptionPlan || 'Ultima'}</p>
                      </div>
                      <Award className="h-12 w-12 opacity-80" />
                    </div>
                    <div className="bg-white bg-opacity-30 backdrop-blur-sm rounded-lg p-3 border border-white border-opacity-30 text-gray-900">
                      <p className="text-sm mb-1 opacity-90 font-semibold">Plan Expires</p>
                      <p className="text-lg font-bold">{formatDate(user.premiumExpires)}</p>
                    </div>
                  </div>
                </div>

                {/* Account Timeline */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-primary-blue" />
                    Account Timeline
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg">
                      <div className="mt-0.5">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-blue-600 font-semibold mb-1">Member Since</p>
                        <p className="font-medium text-blue-900">{formatDate(user.createdAt)}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg">
                      <div className="mt-0.5">
                        <Clock className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-green-600 font-semibold mb-1">Last Login</p>
                        <p className="font-medium text-green-900">{formatDate(user.lastLogin)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Link to={ROUTES.SETTINGS}>
                      <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg hover:shadow-md transition-all cursor-pointer text-center">
                        <User className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-purple-900">Settings</p>
                      </div>
                    </Link>
                    <Link to={ROUTES.DASHBOARD}>
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg hover:shadow-md transition-all cursor-pointer text-center">
                        <Award className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-blue-900">Dashboard</p>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          <div className="card text-center hover:shadow-lg transition-shadow">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {user.isEmailVerified ? '✓' : '⏳'}
            </div>
            <p className="text-sm text-gray-600">Account Status</p>
            <p className="font-semibold text-gray-900 capitalize">
              {user.isEmailVerified ? 'Active' : 'Pending'}
            </p>
          </div>
          <div className="card text-center hover:shadow-lg transition-shadow">
            <div className="text-3xl font-bold text-purple-600 mb-2 capitalize">
              {user.subscriptionPlan || 'Ultima'}
            </div>
            <p className="text-sm text-gray-600">Subscription</p>
            <p className="font-semibold text-gray-900">Current Plan</p>
          </div>
          <div className="card text-center hover:shadow-lg transition-shadow">
            <div className="text-3xl font-bold text-green-600 mb-2 capitalize">
              {user.role}
            </div>
            <p className="text-sm text-gray-600">Account Role</p>
            <p className="font-semibold text-gray-900">User Access</p>
          </div>
          <div className="card text-center hover:shadow-lg transition-shadow">
            <div className="text-3xl font-bold text-orange-600 mb-2 capitalize">
              {user.accountType}
            </div>
            <p className="text-sm text-gray-600">User Type</p>
            <p className="font-semibold text-gray-900">Business Role</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
