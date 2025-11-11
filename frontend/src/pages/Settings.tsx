import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { settingsService } from '../services/settings.service';
import { Settings, Save, Lock, Bell, User as UserIcon, Eye, EyeOff, Camera, Shield, Sparkles, LifeBuoy, Activity, MessageSquare, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { ROUTES } from '../utils/constants';
import { sessionService, type Session } from '../services/session.service';
import type { NotificationPreferences } from '../types/user.types';
import { getErrorMessage } from '../utils/errors';

type NotificationPreferencesState = {
  emailLoads: boolean;
  emailMessages: boolean;
  emailUpdates: boolean;
  emailMarketing: boolean;
  frequency: 'instant' | 'daily' | 'weekly';
};

const SettingsPage = () => {
  const { user, setUser } = useAuthStore();
  const { addNotification } = useUIStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmittingSupport, setIsSubmittingSupport] = useState(false);
  const [sessionPreview, setSessionPreview] = useState<Session[]>([]);
  const [isSessionLoading, setIsSessionLoading] = useState(false);

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
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferencesState>({
    emailLoads: true,
    emailMessages: true,
    emailUpdates: true,
    emailMarketing: false,
    frequency: 'instant'
  });

  // Support draft
  const [supportDraft, setSupportDraft] = useState({
    subject: 'Need help with my CargoLume account',
    message: '',
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

  useEffect(() => {
    const loadSessionsPreview = async () => {
      setIsSessionLoading(true);
      try {
        const response = await sessionService.getSessions();
        if (response.success && response.data) {
          setSessionPreview(response.data.slice(0, 3));
        }
      } catch {
        // Silently fail - session preview is optional
      } finally {
        setIsSessionLoading(false);
      }
    };

    loadSessionsPreview();
  }, []);

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

  const handleNotificationChange = <K extends keyof NotificationPreferencesState>(
    field: K,
    value: NotificationPreferencesState[K]
  ) => {
    setNotificationPrefs((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await settingsService.updateProfile(formData);
      if (response.success && response.data) {
        setUser(response.data);
        addNotification({ type: 'success', message: 'Profile updated successfully!' });
      }
    } catch (error: unknown) {
      addNotification({ type: 'error', message: getErrorMessage(error, 'Failed to update profile') });
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
    } catch (error: unknown) {
      addNotification({ type: 'error', message: getErrorMessage(error, 'Failed to change password') });
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
          const updatedNotifications = response.data.data as NotificationPreferences | undefined;
          setUser({ ...user, notifications: updatedNotifications ?? user.notifications });
        }
        addNotification({ type: 'success', message: 'Notification preferences saved!' });
      }
    } catch (error: unknown) {
      addNotification({ type: 'error', message: getErrorMessage(error, 'Failed to save notification preferences') });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportDraft.message.trim()) {
      addNotification({ type: 'error', message: 'Please describe the issue you need help with.' });
      return;
    }

    setIsSubmittingSupport(true);
    try {
      // Placeholder for future email/service integration
      await new Promise((resolve) => setTimeout(resolve, 800));
      addNotification({
        type: 'success',
        message: 'Support request drafted. We will route emails to your upcoming support inbox.',
      });
      setSupportDraft((prev) => ({ ...prev, message: '' }));
    } finally {
      setIsSubmittingSupport(false);
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
    } catch (error: unknown) {
      addNotification({ type: 'error', message: getErrorMessage(error, 'Failed to upload photo') });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <header className="mb-10">
          <div className="rounded-3xl border border-blue-100 bg-white/90 backdrop-blur shadow-lg px-6 py-6 md:px-10 md:py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-[11px] font-semibold text-blue-700 uppercase tracking-[0.3em]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Settings
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-4 flex items-center gap-3">
                  <Settings className="h-8 w-8 text-blue-600" />
                  Account Control Center
                </h1>
                <p className="text-sm md:text-base text-gray-600 mt-3 max-w-xl">
                  Keep your profile details accurate, strengthen security, and choose when you want CargoLume updates. All edits are saved instantly.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full md:w-auto">
                <Link
                  to={ROUTES.PROFILE}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors shadow-sm"
                >
                  View Profile
                </Link>
                <Link
                  to={ROUTES.ACTIVE_SESSIONS}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-100 hover:bg-slate-800 transition-colors shadow"
                >
                  Security Center
                </Link>
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold mb-1">Identity</p>
                <p className="text-lg font-semibold text-gray-900">{user.company}</p>
                <p className="text-xs text-gray-600 mt-1 truncate">Primary email: {user.email}</p>
              </div>
              <div className="rounded-2xl border border-purple-100 bg-purple-50/70 p-4">
                <p className="text-xs uppercase tracking-wide text-purple-600 font-semibold mb-1">Plan</p>
                <p className="text-lg font-semibold text-gray-900 capitalize">{user.subscriptionPlan || 'Ultima'}</p>
                <p className="text-xs text-gray-600 mt-1">View add-ons from Pricing</p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                <p className="text-xs uppercase tracking-wide text-emerald-600 font-semibold mb-1">Status</p>
                <p className="text-lg font-semibold text-gray-900">{user.isEmailVerified ? 'Verified' : 'Awaiting verification'}</p>
                <p className="text-xs text-gray-600 mt-1">
                  Last login {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="border-b border-gray-200/70 mb-6 overflow-x-auto">
          <nav className="flex gap-3">
            <button
              onClick={() => setActiveTab('profile')}
              className={`relative py-3 px-4 rounded-t-xl font-semibold text-sm transition-colors ${
                activeTab === 'profile' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {activeTab === 'profile' && <span className="absolute inset-x-0 bottom-0 h-1 bg-blue-600 rounded-t-full"></span>}
              <UserIcon className="h-5 w-5 inline mr-2" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`relative py-3 px-4 rounded-t-xl font-semibold text-sm transition-colors ${
                activeTab === 'security' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {activeTab === 'security' && <span className="absolute inset-x-0 bottom-0 h-1 bg-blue-600 rounded-t-full"></span>}
              <Lock className="h-5 w-5 inline mr-2" />
              Security
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`relative py-3 px-4 rounded-t-xl font-semibold text-sm transition-colors ${
                activeTab === 'notifications' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {activeTab === 'notifications' && <span className="absolute inset-x-0 bottom-0 h-1 bg-blue-600 rounded-t-full"></span>}
              <Bell className="h-5 w-5 inline mr-2" />
              Notifications
            </button>
          </nav>
        </div>

        {activeTab === 'profile' && (
          <div className="rounded-3xl shadow-xl border border-blue-100 bg-white overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 md:px-8 py-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Profile Information
              </h2>
              <p className="text-blue-100 text-sm mt-1">Update your personal details and photo</p>
            </div>

            <div className="p-6 md:p-8">
              <div className="mb-8 pb-8 border-b border-gray-100">
                <label className="block text-xs uppercase tracking-wide font-semibold text-gray-500 mb-4">Profile Photo</label>
                <div className="flex flex-wrap items-center gap-6">
                  <div className="relative h-28 w-28 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center overflow-hidden shadow-xl ring-4 ring-blue-100">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <UserIcon className="h-14 w-14 text-white" />
                    )}
                    {avatarPreview && (
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
                        <Camera className="h-6 w-6 text-white opacity-0 hover:opacity-100 transition-opacity" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-3">
                    <p className="text-sm text-gray-600">JPG, PNG or GIF (max. 2MB). Recommended 400x400px.</p>
                    <div className="flex flex-wrap items-center gap-3">
                      <input
                        type="file"
                        id="avatar"
                        accept="image/*"
                        onChange={handleAvatarSelect}
                        className="hidden"
                      />
                      <label
                        htmlFor="avatar"
                        className="inline-flex items-center gap-2 rounded-xl border-2 border-blue-200 bg-blue-50 px-5 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-all cursor-pointer"
                      >
                        <Camera className="h-4 w-4" />
                        {avatarPreview ? 'Change Photo' : 'Upload Photo'}
                      </label>
                      {avatarFile && (
                        <button
                          onClick={handleAvatarUpload}
                          disabled={isLoading}
                          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? (
                            <>
                              <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4" />
                              Save Photo
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="email" className="block text-xs uppercase tracking-wide font-semibold text-gray-500 mb-2">
                      Email Address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      value={formData.email}
                      onChange={handleProfileChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-xs uppercase tracking-wide font-semibold text-gray-500 mb-2">
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      value={formData.phone}
                      onChange={handleProfileChange}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="company" className="block text-xs uppercase tracking-wide font-semibold text-gray-500 mb-2">
                    Company Name
                  </label>
                  <input
                    id="company"
                    name="company"
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  value={formData.company}
                  onChange={handleProfileChange}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-blue-700 transition-colors disabled:opacity-70"
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
          </div>
        )}

        {activeTab === 'security' && (
          <div className="card shadow-xl border border-blue-100/70 bg-white/95 backdrop-blur">
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
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-blue-700 transition-colors disabled:opacity-70"
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

              <div className="mt-8 pt-8 border-t border-gray-200">
                <Link
                  to={ROUTES.ACTIVE_SESSIONS}
                  className="block rounded-2xl border border-blue-200/70 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-5 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-600/10 rounded-lg">
                        <Shield className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-gray-900">Manage Active Sessions</h3>
                        <p className="text-sm text-gray-600">View and log out of active devices</p>
                      </div>
                    </div>
                    <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="card shadow-xl border border-blue-100/70 bg-white/95 backdrop-blur">
            <form onSubmit={handleNotificationSubmit} className="space-y-6">
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-900 mb-4">Email Preferences</label>

                <label className="flex items-center justify-between cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-3 hover:bg-blue-50 transition-colors">
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

                <label className="flex items-center justify-between cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-3 hover:bg-blue-50 transition-colors">
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

                <label className="flex items-center justify-between cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-3 hover:bg-blue-50 transition-colors">
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

                <label className="flex items-center justify-between cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-3 hover:bg-blue-50 transition-colors">
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
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-blue-700 transition-colors disabled:opacity-70"
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

        <div className="mt-10 grid gap-6 md:grid-cols-[1.8fr_minmax(0,1fr)] items-stretch">
          <div className="rounded-3xl border border-blue-100 bg-white shadow-xl p-6 md:p-8 flex flex-col">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-blue-400 font-semibold flex items-center gap-2">
                  <LifeBuoy className="h-4 w-4" />
                  CargoLume Care
                </p>
                <h3 className="text-2xl font-semibold text-gray-900 mt-2">Need assistance?</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Choose a support lane or send us all the detail—we'll wire email routing as soon as you hand over the mailbox.
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <Link
                to={ROUTES.MESSAGES}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                Support Inbox
              </Link>
              <button
                type="button"
                onClick={() =>
                  addNotification({
                    type: 'info',
                    message: 'Click the blue headset button at bottom-right to launch live chat.',
                  })
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 transition-colors"
              >
                <LifeBuoy className="h-4 w-4" />
                Live Chat
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
              <h4 className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-3">
                Draft support email
              </h4>
              <form onSubmit={handleSupportSubmit} className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Subject</label>
                    <input
                      type="text"
                      value={supportDraft.subject}
                      onChange={(e) => setSupportDraft({ ...supportDraft, subject: e.target.value })}
                      className="input bg-white"
                      placeholder="Subject"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Best callback number</label>
                    <input
                      type="tel"
                      defaultValue={user.phone}
                      disabled
                      className="input bg-slate-100 text-gray-600"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Details</label>
                  <textarea
                    value={supportDraft.message}
                    onChange={(e) => setSupportDraft({ ...supportDraft, message: e.target.value })}
                    className="input h-36 resize-none bg-white"
                    placeholder="Describe the issue, steps to reproduce, and any reference numbers..."
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-[11px] uppercase tracking-wide text-blue-600 font-semibold">
                    Status: awaiting support email hookup
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmittingSupport}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition-colors disabled:opacity-70"
                  >
                    <Send className="h-4 w-4" />
                    {isSubmittingSupport ? 'Saving draft…' : 'Save Draft'}
                  </button>
                </div>
              </form>
            </div>

            <ul className="mt-6 space-y-2 text-xs text-gray-500">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-blue-400"></span>
                Drafts will appear in notifications for now. Once you share the support mailbox we’ll auto-forward them.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-blue-400"></span>
                Attach files inside Messages after creating a support thread.
              </li>
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950 to-slate-900 text-slate-100 px-5 py-4 shadow-2xl flex flex-col gap-4 w-full md:max-w-sm mx-auto md:mx-0">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.35em] text-emerald-300 font-semibold">Security</p>
                <h3 className="text-lg font-semibold flex items-center gap-2 mt-2">
                  <Activity className="h-5 w-5 text-emerald-300" />
                  Activity Watch
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-[10px] font-semibold uppercase tracking-wide text-emerald-200">
                Live
              </span>
            </div>
            <div className="flex-1 rounded-2xl border border-slate-800/60 bg-slate-900/60 px-3 py-3 space-y-2">
              {isSessionLoading ? (
                <p className="text-[11px] text-slate-400 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                  Checking sessions…
                </p>
              ) : sessionPreview.length === 0 ? (
                <p className="text-[11px] text-slate-300">No other devices are signed in.</p>
              ) : (
                sessionPreview.map((session) => (
                  <div key={session.token} className="flex items-center justify-between text-[11px] text-slate-200">
                    <span className="truncate pr-2">{session.device}</span>
                    <span className="text-emerald-200/80">
                      {formatDistanceToNow(new Date(session.lastActivity), { addSuffix: true })}
                    </span>
                  </div>
                ))
              )}
              <p className="text-[11px] text-slate-400 mt-2">24/7 login monitoring with instant alerts.</p>
            </div>
            <Link
              to={ROUTES.ACTIVE_SESSIONS}
              className="inline-flex items-center justify-center gap-1 rounded-lg bg-emerald-600/20 px-4 py-2.5 text-xs font-semibold text-emerald-200 hover:bg-emerald-600/30 transition-colors border border-emerald-600/30 w-full"
            >
              View All Sessions
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
