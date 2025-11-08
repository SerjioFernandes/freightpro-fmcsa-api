import { useAuthStore } from '../store/authStore';
import { canPostLoad } from '../utils/permissions';
import { Lock, Plus, Truck } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-xs font-semibold text-blue-700 uppercase tracking-wider mb-4">
              <Plus className="h-4 w-4" />
              Create Load
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">Post New Load</h1>
            <p className="text-lg text-gray-600 max-w-2xl">
              Enter accurate shipment details to connect with qualified carriers. All fields marked with * are required.
            </p>
          </div>

          {/* Form Card */}
          <div className="rounded-3xl shadow-2xl border border-blue-100 bg-white overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 md:px-8 py-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Truck className="h-6 w-6" />
                Load Details
              </h2>
              <p className="text-blue-100 text-sm mt-2">Complete all sections to publish your load to the marketplace</p>
            </div>

            <div className="p-6 md:p-8">
              <PostLoadForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostLoad;
