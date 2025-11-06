import { useAuthStore } from '../store/authStore';
import { canPostLoad } from '../utils/permissions';
import { Lock, Plus } from 'lucide-react';
import PostLoadForm from '../components/forms/PostLoadForm';

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
        <div className="max-w-4xl mx-auto">
          <div className="card border-2 border-primary-blue/30 shadow-xl animate-scale-in">
            <div className="text-center mb-8">
              <div className="gradient-blue w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 glow-blue">
                <Plus className="h-10 w-10 text-orange-accent" />
              </div>
              <h2 className="text-4xl font-heading font-bold text-gray-900">Post New Load</h2>
              <p className="text-gray-700 mt-2 text-lg">Fill in the details to post your load</p>
            </div>

            <PostLoadForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostLoad;
