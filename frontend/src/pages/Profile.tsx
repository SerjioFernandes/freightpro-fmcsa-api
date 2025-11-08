import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, Building, Shield, Calendar, Award, CheckCircle, Clock, Edit, LifeBuoy, Activity, Lock, Copy, Check } from 'lucide-react';
import { ROUTES } from '../utils/constants';
import { useUIStore } from '../store/uiStore';
import { useState } from 'react';

const Profile = () => {
  const { user } = useAuthStore();
  const { addNotification } = useUIStore();
  const [copiedUserId, setCopiedUserId] = useState(false);

  if (!user) return null;

  const handleCopyUserId = () => {
    const userId = user.uniqueUserId || `CL-${user.id.slice(0, 6).toUpperCase()}`;
    navigator.clipboard.writeText(userId);
    setCopiedUserId(true);
    addNotification({ type: 'success', message: 'User ID copied to clipboard!' });
    setTimeout(() => setCopiedUserId(false), 2000);
  };

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

  const accountSnapshot = [
    {
      title: 'Account Status',
      value: user.isEmailVerified ? 'Active' : 'Pending Verification',
      description: user.isEmailVerified ? 'All systems are ready.' : 'Finish verifying your email to unlock everything.',
      accent: 'bg-blue-50 text-blue-700',
      icon: CheckCircle,
    },
    {
      title: 'User Role',
      value: user.role,
      description: 'Determines what administrative features you can access.',
      accent: 'bg-purple-50 text-purple-700',
      icon: Shield,
    },
    {
      title: 'Business Type',
      value: user.accountType,
      description: 'Controls which dashboards and workflows you see.',
      accent: 'bg-orange-50 text-orange-700',
      icon: Building,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600 text-lg">Manage your account information and preferences</p>
        </div>

        {/* Main Profile Card */}
        <div className="card shadow-xl mb-6 overflow-hidden">
          {/* Header with gradient background */}
          <div className={`bg-gradient-to-r ${getAccountTypeColor(user.accountType)} text-white p-10 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-72 h-72 bg-white opacity-10 rounded-full -mr-36 -mt-36"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -ml-32 -mb-32"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center space-x-8">
                <div className="h-28 w-28 rounded-full bg-white bg-opacity-25 backdrop-blur-sm border-4 border-white shadow-xl flex items-center justify-center ring-4 ring-white ring-opacity-20">
                  {user.profilePhoto ? (
                    <img src={user.profilePhoto} alt={user.company} className="h-full w-full rounded-full object-cover" />
                  ) : (
                    <span className="text-5xl drop-shadow-lg">{getAccountTypeIcon(user.accountType)}</span>
                  )}
                </div>
                <div>
                  <h2 className="text-4xl font-bold mb-3 drop-shadow-lg">{user.company}</h2>
                  <div className="flex items-center space-x-3">
                    <span className="capitalize bg-white bg-opacity-95 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold shadow-lg border-2 border-white">
                      <span className={`${user.accountType === 'carrier' ? 'text-blue-600' : user.accountType === 'broker' ? 'text-green-600' : 'text-purple-600'}`}>
                        {user.accountType.toUpperCase()}
                      </span>
                    </span>
                    {user.isEmailVerified ? (
                      <span className="bg-green-500 px-3 py-2 rounded-full text-sm font-semibold flex items-center space-x-1 shadow-lg">
                        <CheckCircle className="h-4 w-4" />
                        <span>Verified</span>
                      </span>
                    ) : (
                      <span className="bg-yellow-500 px-3 py-2 rounded-full text-sm font-semibold flex items-center space-x-1 shadow-lg">
                        <Clock className="h-4 w-4" />
                        <span>Pending Verification</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <Link to={ROUTES.SETTINGS}>
                <button className="bg-white bg-opacity-95 backdrop-blur-sm text-gray-900 px-8 py-4 rounded-xl font-bold hover:bg-white hover:scale-105 transition-all flex items-center space-x-2 shadow-xl border-2 border-white border-opacity-50">
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
                    {/* User ID Card */}
                    <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg shadow-sm">
                      <div className="mt-0.5">
                        <Shield className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-blue-600 font-semibold mb-1">Your Unique User ID</p>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-blue-900 font-mono tracking-wider text-lg">
                            {user.uniqueUserId || `CL-${user.id.slice(0, 6).toUpperCase()}`}
                          </p>
                          <button
                            onClick={handleCopyUserId}
                            className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all"
                            title="Copy User ID"
                          >
                            {copiedUserId ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </button>
                        </div>
                        <p className="text-xs text-blue-700 mt-2">
                          Share this ID with others so they can add you as a connection
                        </p>
                      </div>
                    </div>

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
                  <div className={`p-6 rounded-xl text-white ${getPlanBadgeColor(user.subscriptionPlan)} shadow-xl border border-white border-opacity-20`}>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="text-sm opacity-90 mb-2 uppercase tracking-wide font-semibold">Current Plan</p>
                        <p className="text-3xl font-bold capitalize drop-shadow-lg">{user.subscriptionPlan || 'Ultima'}</p>
                      </div>
                      <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-3 border-2 border-white border-opacity-30">
                        <Award className="h-10 w-10" />
                      </div>
                    </div>
                    <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-lg p-4 border-2 border-white border-opacity-50 shadow-lg">
                      <p className="text-xs mb-1 text-gray-600 font-semibold uppercase tracking-wide">Plan Expires</p>
                      <p className="text-2xl font-bold text-gray-900">{formatDate(user.premiumExpires)}</p>
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

        {/* Experience Footer */}
        <div className="mt-10 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="card p-6 lg:p-8 shadow-xl border border-blue-100/60 bg-white/90 backdrop-blur">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
              <div>
                <p className="text-xs font-semibold tracking-[0.25em] text-blue-400 uppercase">Account Snapshot</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">Your control center looks great</h3>
                <p className="text-sm text-gray-600 mt-1">Here’s a quick status report across your profile, roles, and capabilities.</p>
              </div>
              <Link
                to={ROUTES.SETTINGS}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold shadow-md hover:bg-blue-700 transition-colors"
              >
                <Edit className="h-4 w-4" />
                Update details
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {accountSnapshot.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="p-4 rounded-xl border border-gray-200/70 bg-white hover:shadow-lg transition-all">
                    <div className={`w-10 h-10 rounded-lg ${item.accent} flex items-center justify-center mb-3`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">{item.title}</p>
                    <p className="text-lg font-semibold text-gray-900 capitalize">{item.value}</p>
                    <p className="text-xs text-gray-500 mt-2 leading-relaxed">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="card p-6 shadow-lg border border-blue-100/70 bg-white/95 backdrop-blur">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <LifeBuoy className="h-5 w-5 text-blue-500" />
                Need a hand?
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Our support team is on standby to help complete your profile, connect accounts, or resolve onboarding questions.
              </p>
              <Link
                to={ROUTES.MESSAGES}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <LifeBuoy className="h-4 w-4" />
                Contact Support
              </Link>
            </div>

            <div className="card p-6 shadow-lg border border-gray-200 bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Lock className="h-5 w-5 text-emerald-300" />
                Security Monitor
              </h3>
              <p className="text-sm text-slate-200/80">
                We continuously watch for unusual activity. Review active sessions or reset passwords anytime from settings.
              </p>
              <Link
                to={ROUTES.ACTIVE_SESSIONS}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-emerald-300 bg-white/10 rounded-lg hover:bg-white/15 transition-all"
              >
                <Activity className="h-4 w-4" />
                View Active Sessions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
