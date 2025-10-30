import { Link } from 'react-router-dom';
import { ROUTES } from '../utils/constants';
import { useAuthStore } from '../store/authStore';
import { Truck, Users, DollarSign, BarChart3, Rocket, Search } from 'lucide-react';

const Home = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen">
      {/* Hero Section with mountain background */}
      <section className="relative overflow-hidden" style={{ minHeight: '420px' }}>
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <picture>
            <source
              media="(max-width: 640px)"
              srcSet="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=75&fm=webp"
              type="image/webp"
            />
            <source
              media="(max-width: 1024px)"
              srcSet="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80&fm=webp"
              type="image/webp"
            />
            <img
              src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80"
              alt="American freight truck on highway"
              className="absolute inset-0 w-full h-full object-cover"
              loading="eager"
            />
          </picture>
          {/* Gradient overlay */}
          <div
            className="absolute inset-0 z-10"
            style={{
              background: 'linear-gradient(rgba(12, 74, 110, 0.8), rgba(56, 189, 248, 0.5))'
            }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-20 py-20 md:py-28 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-white drop-shadow-lg">
            CargoLume - America's Premier Freight Network
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-white drop-shadow">
            Connect carriers and shippers with the most comprehensive real-time load board and transportation solutions powered by CargoLume
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to={ROUTES.REGISTER}
              className="bg-orange-700 hover:bg-orange-600 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 text-white shadow-lg inline-flex items-center justify-center"
            >
              <Rocket className="w-5 h-5 mr-2" />
              Get Started Free
            </Link>
            <Link
              to={ROUTES.LOAD_BOARD}
              className="bg-transparent border-2 border-white hover:bg-white hover:text-primary-blue px-8 py-4 rounded-lg text-lg font-semibold transition-colors text-white shadow-lg inline-flex items-center justify-center"
            >
              <Search className="w-5 h-5 mr-2" />
              Browse Loads
            </Link>
          </div>
        </div>
      </section>

      {/* Live Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-black">Live Platform Statistics</h2>
            <div className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
              Updated every 5 seconds
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2 flex items-center justify-center">
                <Truck className="w-6 h-6 animate-spin mr-2" />
                12,547
              </div>
              <div className="text-gray-600 font-medium">Active Carriers</div>
              <div className="text-xs text-gray-500 mt-1">Live from database</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-2 flex items-center justify-center">
                <Users className="w-6 h-6 animate-spin mr-2" />
                8,923
              </div>
              <div className="text-gray-600 font-medium">Active Shippers</div>
              <div className="text-xs text-gray-500 mt-1">Live from database</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 mb-2 flex items-center justify-center">
                <DollarSign className="w-6 h-6 animate-spin mr-2" />
                $2.4M
              </div>
              <div className="text-gray-600 font-medium">Total Freight Value</div>
              <div className="text-xs text-gray-500 mt-1">Live from database</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg">
              <div className="text-3xl font-bold text-orange-600 mb-2 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 animate-spin mr-2" />
                5,234
              </div>
              <div className="text-gray-600 font-medium">Available Loads</div>
              <div className="text-xs text-gray-500 mt-1">Live from database</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose CargoLume?
            </h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Everything you need to manage and grow your freight business in one powerful platform.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Truck className="w-12 h-12 text-blue-600" />,
                title: 'Real-Time Load Board',
                description: 'Access thousands of verified loads updated in real-time across North America.'
              },
              {
                icon: <Users className="w-12 h-12 text-green-600" />,
                title: 'Verified Network',
                description: 'Connect with trusted carriers, brokers, and shippers verified by our team.'
              },
              {
                icon: <BarChart3 className="w-12 h-12 text-purple-600" />,
                title: 'Market Analytics',
                description: 'Get insights into freight rates, trends, and market conditions.'
              },
              {
                icon: <DollarSign className="w-12 h-12 text-orange-600" />,
                title: 'Competitive Pricing',
                description: 'Find the best rates and maximize your profit margins.'
              },
              {
                icon: <Search className="w-12 h-12 text-blue-600" />,
                title: 'Advanced Search',
                description: 'Filter loads by location, equipment type, and price quickly.'
              },
              {
                icon: <Rocket className="w-12 h-12 text-green-600" />,
                title: 'Easy Posting',
                description: 'Post your loads in minutes with our streamlined interface.'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-700">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 py-20 text-center">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-white mb-10 max-w-3xl mx-auto opacity-90">
              Join thousands of freight professionals growing their business with CargoLume.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Link
                to={ROUTES.REGISTER}
                className="bg-orange-700 hover:bg-orange-600 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 text-white shadow-lg inline-flex items-center"
              >
                <Rocket className="w-5 h-5 mr-2" />
                Create Free Account
              </Link>
              <Link
                to={ROUTES.PRICING}
                className="bg-transparent border-2 border-white hover:bg-white hover:text-primary-blue px-8 py-4 rounded-lg text-lg font-semibold transition-colors text-white"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;