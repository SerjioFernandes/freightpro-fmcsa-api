import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { settingsService } from '../services/settings.service';
import { Settings, Save, Lock, Bell, User as UserIcon, Eye, EyeOff, Camera, Shield } from 'lucide-react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { ROUTES } from '../utils/constants';

const SettingsPage = () => {
  const { user, setUser } = useAuthStore();
  const { addNotification } = useUIStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');
  const [isLoading, setIsLoading] = useState(false);

  // Profile
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    company: ''
  });

  // Security
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Notifications
  const [notificationPrefs, setNotificationPrefs] = useState<{
    emailLoads: boolean;
    emailMessages: boolean;
    emailUpdates: boolean;
    emailMarketing: boolean;
    frequency: 'instant' | 'daily' | 'weekly';
  }>({
    emailLoads: true,
    emailMessages: true,
    emailUpdates: true,
    emailMarketing: false,
    frequency: 'instant'
  });

  // Avatar
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        phone: user.phone || '',
        company: user.company || ''
      });
      
      if (user.notifications) {
        setNotificationPrefs({
          emailLoads: user.notifications.emailLoads ?? true,
          emailMessages: user.notifications.emailBids ?? true,
          emailUpdates: user.notifications.emailUpdates ?? true,
          emailMarketing: user.notifications.emailMarketing ?? false,
          frequency: (user.notifications.frequency === 'instant' || user.notifications.frequency === 'daily' || user.notifications.frequency === 'weekly') 
            ? user.notifications.frequency 
            : 'instant'
        });
      }

      if (user.profilePhoto) {
        setAvatarPreview(user.profilePhoto);
      }
    }
  }, [user]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleNotificationChange = (field: string, value: any) => {
    setNotificationPrefs({
      ...notificationPrefs,
      [field]: value
    });
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await settingsService.updateProfile(formData);
      if (response.success) {
        setUser(response.data);
        addNotification({ type: 'success', message: 'Profile updated successfully!' });
      }
    } catch (error: any) {
      addNotification({ 
        type: 'error', 
        message: error.response?.data?.error || 'Failed to update profile' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      addNotification({ type: 'error', message: 'New passwords do not match' });
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.put('/settings/password', {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });
      
      if (response.data.success) {
        addNotification({ type: 'success', message: 'Password changed successfully!' });
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error: any) {
      addNotification({ 
        type: 'error', 
        message: error.response?.data?.error || 'Failed to change password' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.put('/settings/notifications', {
        notifications: notificationPrefs
      });
      
      if (response.data.success) {
        if (user) {
          setUser({ ...user, notifications: response.data.data as any });
        }
        addNotification({ type: 'success', message: 'Notification preferences saved!' });
      }
    } catch (error: any) {
      addNotification({ 
        type: 'error', 
        message: 'Failed to save notification preferences' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.includes('image')) {
      addNotification({ type: 'error', message: 'Please select an image file' });
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      addNotification({ type: 'error', message: 'Image size must be less than 2MB' });
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);

      const response = await api.post('/settings/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        if (user) {
          setUser({ ...user, profilePhoto: response.data.data.profilePhoto });
        }
        addNotification({ type: 'success', message: 'Profile photo updated!' });
        setAvatarFile(null);
      }
    } catch (error: any) {
      addNotification({ type: 'error', message: 'Failed to upload photo' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Settings className="h-8 w-8 text-primary-blue" />
            Settings
          </h1>
          <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'profile'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <UserIcon className="h-5 w-5 inline mr-2" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'security'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Lock className="h-5 w-5 inline mr-2" />
              Security
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'notifications'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Bell className="h-5 w-5 inline mr-2" />
              Notifications
            </button>
          </nav>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="card">
            {/* Avatar Upload */}
            <div className="mb-8 pb-8 border-b border-gray-200">
              <label className="block text-sm font-semibold text-gray-900 mb-4">Profile Photo</label>
              <div className="flex items-center gap-6">
                <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <UserIcon className="h-12 w-12 text-gray-400" />
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    id="avatar"
                    accept="image/*"
                    onChange={handleAvatarSelect}
                    className="hidden"
                  />
                  <label
                    htmlFor="avatar"
                    className="btn btn-secondary flex items-center gap-2 cursor-pointer"
                  >
                    <Camera className="h-4 w-4" />
                    {avatarPreview ? 'Change Photo' : 'Upload Photo'}
                  </label>
                  {avatarFile && (
                    <button
                      onClick={handleAvatarUpload}
                      disabled={isLoading}
                      className="btn btn-primary ml-2 flex items-center gap-2"
                    >
                      {isLoading ? 'Uploading...' : 'Save Photo'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="input"
                  value={formData.email}
                  onChange={handleProfileChange}
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-2">
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  className="input"
                  value={formData.phone}
                  onChange={handleProfileChange}
                />
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-semibold text-gray-900 mb-2">
                  Company Name
                </label>
                <input
                  id="company"
                  name="company"
                  type="text"
                  required
                  className="input"
                  value={formData.company}
                  onChange={handleProfileChange}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full py-3 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    Save Changes
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="card">
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <label htmlFor="oldPassword" className="block text-sm font-semibold text-gray-900 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    id="oldPassword"
                    name="oldPassword"
                    type={showOldPassword ? 'text' : 'password'}
                    required
                    className="input pr-10"
                    value={passwordData.oldPassword}
                    onChange={handlePasswordChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showOldPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-900 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    className="input pr-10"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-900 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    className="input pr-10"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full py-3 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
                    Changing...
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5" />
                    Change Password
                  </>
                )}
              </button>

              {/* Active Sessions Link */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <Link
                  to={ROUTES.ACTIVE_SESSIONS}
                  className="card card-hover bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-primary-blue/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary-blue/10 rounded-lg">
                        <Shield className="h-6 w-6 text-primary-blue" />
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-gray-900">Manage Active Sessions</h3>
                        <p className="text-sm text-gray-600">View and logout from active devices</p>
                      </div>
                    </div>
                    <svg className="h-5 w-5 text-primary-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              </div>
            </form>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="card">
            <form onSubmit={handleNotificationSubmit} className="space-y-6">
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-900 mb-4">Email Preferences</label>
                
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="font-medium text-gray-900">New Loads</span>
                    <p className="text-sm text-gray-600">Get notified when new loads are posted</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationPrefs.emailLoads}
                    onChange={(e) => handleNotificationChange('emailLoads', e.target.checked)}
                    className="toggle"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="font-medium text-gray-900">Messages</span>
                    <p className="text-sm text-gray-600">Get notified when you receive messages</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationPrefs.emailMessages}
                    onChange={(e) => handleNotificationChange('emailMessages', e.target.checked)}
                    className="toggle"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="font-medium text-gray-900">Updates</span>
                    <p className="text-sm text-gray-600">Get notified about important updates</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationPrefs.emailUpdates}
                    onChange={(e) => handleNotificationChange('emailUpdates', e.target.checked)}
                    className="toggle"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="font-medium text-gray-900">Marketing</span>
                    <p className="text-sm text-gray-600">Receive promotional emails</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationPrefs.emailMarketing}
                    onChange={(e) => handleNotificationChange('emailMarketing', e.target.checked)}
                    className="toggle"
                  />
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Notification Frequency
                </label>
                <select
                  value={notificationPrefs.frequency}
                  onChange={(e) => handleNotificationChange('frequency', e.target.value)}
                  className="input"
                >
                  <option value="instant">Instant</option>
                  <option value="daily">Daily Digest</option>
                  <option value="weekly">Weekly Digest</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full py-3 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <Bell className="h-5 w-5" />
                    Save Preferences
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
