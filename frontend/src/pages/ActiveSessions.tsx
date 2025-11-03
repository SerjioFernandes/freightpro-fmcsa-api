import { useEffect, useState } from 'react';
import { useUIStore } from '../store/uiStore';
import { sessionService, type Session } from '../services/session.service';
import { Smartphone, Monitor, Tablet, Trash2, AlertTriangle, CheckCircle, Shield } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ActiveSessions = () => {
  const { addNotification } = useUIStore();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [securityInfo, setSecurityInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const [sessionsResponse, securityResponse] = await Promise.all([
        sessionService.getSessions(),
        sessionService.getSecurityInfo()
      ]);

      if (sessionsResponse.success && sessionsResponse.data) {
        setSessions(sessionsResponse.data);
      }

      if (securityResponse.success && securityResponse.data) {
        setSecurityInfo(securityResponse.data);
      }
    } catch (error: any) {
      addNotification({ type: 'error', message: 'Failed to load active sessions' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = async (token: string) => {
    if (!window.confirm('Are you sure you want to log out this device?')) return;

    try {
      const response = await sessionService.deleteSession(token);
      if (response.success) {
        setSessions(prev => prev.filter(s => s.token !== token));
        addNotification({ type: 'success', message: 'Device logged out successfully' });
      } else {
        addNotification({ type: 'error', message: 'Failed to log out device' });
      }
    } catch (error) {
      addNotification({ type: 'error', message: 'Failed to log out device' });
    }
  };

  const handleLogoutAll = async () => {
    if (!window.confirm('Are you sure you want to log out from ALL devices? This will log you out here too!')) return;

    setIsDeleting(true);
    try {
      const response = await sessionService.deleteAllSessions();
      if (response.success) {
        addNotification({ type: 'success', message: 'Logged out from all devices' });
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        addNotification({ type: 'error', message: 'Failed to log out all devices' });
      }
    } catch (error) {
      addNotification({ type: 'error', message: 'Failed to log out all devices' });
    } finally {
      setIsDeleting(false);
    }
  };

  const getDeviceIcon = (device: string) => {
    const lower = device.toLowerCase();
    if (lower.includes('mobile') || lower.includes('phone')) {
      return <Smartphone className="h-5 w-5" />;
    } else if (lower.includes('tablet')) {
      return <Tablet className="h-5 w-5" />;
    } else {
      return <Monitor className="h-5 w-5" />;
    }
  };

  const getCurrentToken = () => {
    return localStorage.getItem('token') || '';
  };

  const isCurrentSession = (session: Session) => {
    return session.token === getCurrentToken();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-gray-900">
            Active Sessions
          </h1>
          <p className="text-xl text-gray-700 mt-2">
            Manage your device sessions and security settings
          </p>
        </div>

        {/* Security Info */}
        {securityInfo && (
          <div className={`mb-8 card border-2 animate-slide-up ${
            securityInfo.hasSuspiciousActivity
              ? 'border-red-300 bg-red-50'
              : 'border-green-300 bg-green-50'
          }`}>
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${
                securityInfo.hasSuspiciousActivity ? 'bg-red-200' : 'bg-green-200'
              }`}>
                {securityInfo.hasSuspiciousActivity ? (
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                ) : (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-heading font-bold text-gray-900 mb-1">
                  {securityInfo.hasSuspiciousActivity ? 'Security Alert' : 'All Clear'}
                </h3>
                <p className="text-gray-700">
                  {securityInfo.hasSuspiciousActivity
                    ? `Suspicious activity detected: ${securityInfo.suspiciousIPs.length} suspicious IP address(es)`
                    : 'No suspicious activity detected in your account'
                  }
                </p>
                {securityInfo.suspiciousIPs && securityInfo.suspiciousIPs.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-semibold text-gray-700">Suspicious IPs:</p>
                    <ul className="list-disc list-inside text-sm text-red-600 mt-1">
                      {securityInfo.suspiciousIPs.map((ip: string) => (
                        <li key={ip}>{ip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sessions List */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-heading font-bold text-gray-900">
              Current Sessions ({sessions.length})
            </h2>
            {sessions.length > 1 && (
              <button
                onClick={handleLogoutAll}
                disabled={isDeleting}
                className="btn btn-danger flex items-center gap-2"
              >
                <Trash2 className="h-5 w-5" />
                Logout All Devices
              </button>
            )}
          </div>

          {sessions.length === 0 ? (
            <div className="card text-center py-12">
              <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-heading font-bold text-gray-900 mb-2">
                No Active Sessions
              </h3>
              <p className="text-gray-600">
                You are not logged in on any devices
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session, index) => (
                <div
                  key={session.token}
                  className={`card border-2 animate-slide-up ${
                    isCurrentSession(session)
                      ? 'border-primary-blue bg-blue-50/30'
                      : 'border-gray-200'
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Device Icon */}
                      <div className={`p-3 rounded-lg ${
                        isCurrentSession(session)
                          ? 'bg-primary-blue text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {getDeviceIcon(session.device)}
                      </div>

                      {/* Session Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-heading font-bold text-gray-900">
                            {session.device}
                          </h3>
                          {isCurrentSession(session) && (
                            <span className="badge badge-success">
                              Current Device
                            </span>
                          )}
                        </div>

                        <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">IP Address:</span>
                            <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                              {session.ip}
                            </code>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">Last Active:</span>
                            <span className="text-gray-700">
                              {formatDistanceToNow(new Date(session.lastActivity), { addSuffix: true })}
                            </span>
                          </div>
                          {session.userAgent && (
                            <div className="md:col-span-2">
                              <span className="font-semibold">User Agent:</span>
                              <p className="text-xs text-gray-500 mt-1 truncate">
                                {session.userAgent}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {!isCurrentSession(session) && (
                      <button
                        onClick={() => handleDeleteSession(session.token)}
                        className="btn btn-danger btn-sm flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Logout
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Security Tips */}
        <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 animate-fade-in">
          <div className="flex items-start gap-4">
            <Shield className="h-6 w-6 text-primary-blue flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-heading font-bold text-gray-900 mb-2">
                Security Tips
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-primary-blue mt-1">•</span>
                  <span>Log out from devices you no longer use</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-blue mt-1">•</span>
                  <span>If you notice suspicious activity, log out all devices immediately</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-blue mt-1">•</span>
                  <span>Use strong, unique passwords and enable 2FA when available</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-blue mt-1">•</span>
                  <span>Report any unauthorized access to support immediately</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveSessions;

