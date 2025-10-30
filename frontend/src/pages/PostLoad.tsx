import { useAuthStore } from '../store/authStore';
import { canPostLoad } from '../utils/permissions';
import { Lock } from 'lucide-react';

const PostLoad = () => {
  const { user } = useAuthStore();

  // Access control: Only brokers can post loads
  if (!canPostLoad(user?.accountType)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="card text-center animate-fade-in">
            <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h2>
            <p className="text-gray-600 mb-6">
              Only brokers can post loads.
            </p>
            <p className="text-sm text-gray-500">
              Carriers can browse and book loads. Please check the Load Board instead.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="card text-center animate-fade-in">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Post Load</h2>
          <p className="text-gray-600 mb-6">
            Load posting form coming soon.
          </p>
          <p className="text-sm text-gray-500">
            This feature is under development.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PostLoad;
