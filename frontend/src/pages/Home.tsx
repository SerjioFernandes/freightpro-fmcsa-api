import { Link } from 'react-router-dom';
import { ROUTES } from '../utils/constants';
import { useAuthStore } from '../store/authStore';
import { Truck, Users, Shield, TrendingUp, Zap, Globe, Award, ArrowRight, CheckCircle } from 'lucide-react';
import Button from '../components/common/Button';

const Home = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-bg-dark relative overflow-hidden py-20 md:py-32">
        {/* Animated background patterns */}
          <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-primary-blue rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-accent rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6 animate-fade-in">
              <span className="inline-block px-6 py-2 bg-saffron-gold/20 backdrop-blur-sm rounded-full text-saffron-gold font-semibold text-sm uppercase tracking-wider border border-saffron-gold/30">
                🚀 Premium Freight Platform
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-heading font-bold text-saffron-gold mb-6 animate-slide-up">
              Welcome to <span className="text-gradient-gold">CargoLume</span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-soft-ivory leading-relaxed animate-slide-up">
              The Professional Load Board Platform connecting <span className="text-emerald-whisper font-semibold">shippers</span>, <span className="text-emerald-whisper font-semibold">brokers</span>, and <span className="text-emerald-whisper font-semibold">carriers</span> across North America.
            </p>
            
            {!isAuthenticated && (
              <div className="flex gap-4 justify-center flex-wrap animate-scale-in">
                <Link to={ROUTES.REGISTER}>
                  <Button variant="accent" size="lg" icon={<ArrowRight className="h-6 w-6" />} iconPosition="right">
                    Get Started Free
                  </Button>
                </Link>
                <Link to={ROUTES.LOGIN}>
                  <Button variant="secondary" size="lg">
                    Sign In
                  </Button>
                </Link>
              </div>
            )}
            
            {isAuthenticated && (
              <Link to={ROUTES.DASHBOARD}>
                <Button variant="accent" size="lg" icon={<ArrowRight className="h-6 w-6" />} iconPosition="right">
                  Go to Dashboard
                </Button>
              </Link>
            )}
            
            <div className="mt-12 flex justify-center gap-8 text-white flex-wrap">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-orange-accent" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-orange-accent" />
                <span>Free plan available</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-orange-accent" />
                <span>24/7 support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary-blue-darker border-y border-primary-blue/20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { number: '10,000+', label: 'Active Users' },
              { number: '50,000+', label: 'Loads Posted' },
              { number: '99.9%', label: 'Uptime' },
              { number: '24/7', label: 'Support' },
            ].map((stat, index) => (
              <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="text-4xl md:text-5xl font-heading font-bold text-orange-accent mb-2">
                  {stat.number}
                </div>
                <div className="text-white font-body">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-4">
              Why Choose <span className="text-gradient-blue">CargoLume</span>?
            </h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Everything you need to manage and grow your freight business in one powerful platform.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Truck className="h-12 w-12" />,
                title: 'Real-Time Load Matching',
                description: 'Find and post loads instantly with our advanced AI-powered matching system.',
                color: 'text-saffron-gold'
              },
              {
                icon: <Users className="h-12 w-12" />,
                title: 'Verified Network',
                description: 'Connect with verified carriers, brokers, and shippers you can trust.',
                color: 'text-primary-blue'
              },
              {
                icon: <Shield className="h-12 w-12" />,
                title: 'Secure Platform',
                description: 'Enterprise-grade security and encryption for all your transactions.',
                color: 'text-saffron-gold'
              },
              {
                icon: <TrendingUp className="h-12 w-12" />,
                title: 'Analytics & Insights',
                description: 'Track performance with comprehensive analytics and reporting.',
                color: 'text-primary-blue'
              },
              {
                icon: <Zap className="h-12 w-12" />,
                title: 'Lightning Fast',
                description: 'Real-time updates and instant notifications for time-sensitive loads.',
                color: 'text-saffron-gold'
              },
              {
                icon: <Globe className="h-12 w-12" />,
                title: 'North America Coverage',
                description: 'Connect with partners across the US, Canada, and Mexico.',
                color: 'text-primary-blue'
              },
              {
                icon: <Award className="h-12 w-12" />,
                title: 'Industry Leading',
                description: 'Trusted by thousands of freight professionals nationwide.',
                color: 'text-saffron-gold'
              },
              {
                icon: <CheckCircle className="h-12 w-12" />,
                title: 'Easy Integration',
                description: 'API access and integrations with your existing TMS and tools.',
                color: 'text-primary-blue'
              },
            ].map((feature, index) => (
              <div 
                key={index} 
                className="card card-hover group text-center animate-scale-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={`${feature.color} mx-auto mb-4 transition-transform group-hover:scale-110 group-hover:rotate-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-heading font-semibold text-midnight-ocean mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-700">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-midnight-ocean mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {[
              {
                step: '1',
                title: 'Create Account',
                description: 'Sign up for free and verify your company information.',
              },
              {
                step: '2',
                title: 'Post or Find Loads',
                description: 'Browse available loads or post your own freight needs.',
              },
              {
                step: '3',
                title: 'Connect & Ship',
                description: 'Match with partners and coordinate your shipments.',
              },
            ].map((item, index) => (
              <div key={index} className="text-center relative">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-ocean rounded-full flex items-center justify-center shadow-glow">
                  <span className="text-4xl font-heading font-bold text-saffron-gold">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-2xl font-heading font-semibold text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-700">{item.description}</p>
                {index < 2 && (
                  <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-primary-blue -z-10"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="gradient-bg-dark py-20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-saffron-gold rounded-full blur-3xl"></div>
          </div>
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-saffron-gold mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl md:text-2xl text-soft-ivory mb-10 max-w-3xl mx-auto">
              Join thousands of carriers, brokers, and shippers growing their business with CargoLume.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link to={ROUTES.REGISTER}>
                <Button variant="accent" size="lg" icon={<ArrowRight className="h-6 w-6" />} iconPosition="right">
                  Create Free Account
                </Button>
              </Link>
              <Link to={ROUTES.PRICING}>
                <Button variant="secondary" size="lg">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;


