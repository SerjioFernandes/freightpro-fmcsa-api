import { Link, useNavigate } from 'react-router-dom';
import { Check, X, Zap, Shield, Truck, Star, ArrowRight } from 'lucide-react';
import Button from '../components/common/Button';
import { ROUTES } from '../utils/constants';
import { useState } from 'react';
import { useAuthStore } from '../store/authStore';

const Pricing = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  const handlePlanClick = (planLink: string) => {
    if (isAuthenticated && user) {
      setShowSubscriptionModal(true);
    } else {
      navigate(planLink);
    }
  };

  const formatExpiryDate = (date?: Date) => {
    if (!date) return 'N/A';
    const expiry = new Date(date);
    return expiry.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const plans = [
    {
      name: 'Basic',
      price: 'Free',
      period: 'Forever',
      monthlyPrice: 0,
      yearlyPrice: 0,
      description: 'Perfect for getting started',
      features: [
        { name: 'Up to 10 loads per month', included: true },
        { name: 'Basic load board access', included: true },
        { name: 'Email support', included: true },
        { name: 'Standard search filters', included: true },
        { name: 'Mobile app access', included: false },
        { name: 'Priority support', included: false },
        { name: 'Advanced analytics', included: false },
        { name: 'API access', included: false },
      ],
      cta: 'Get Started Free',
      link: ROUTES.REGISTER,
      popular: false,
    },
    {
      name: 'Premium',
      price: '$49',
      period: 'per month',
      monthlyPrice: 49,
      yearlyPrice: 39,
      description: 'Most popular for growing businesses',
      features: [
        { name: 'Unlimited loads', included: true },
        { name: 'Full load board access', included: true },
        { name: 'Priority email & chat support', included: true },
        { name: 'Advanced search filters', included: true },
        { name: 'Mobile app access', included: true },
        { name: 'Real-time notifications', included: true },
        { name: 'Advanced analytics dashboard', included: true },
        { name: 'API access', included: false },
      ],
      cta: 'Start Premium Trial',
      link: ROUTES.REGISTER,
      popular: true,
    },
    {
      name: 'Ultima',
      price: '$99',
      period: 'per month',
      monthlyPrice: 99,
      yearlyPrice: 79,
      description: 'For growing businesses that need more',
      features: [
        { name: 'Unlimited everything', included: true },
        { name: 'Advanced load board access', included: true },
        { name: 'Priority support + dedicated account manager', included: true },
        { name: 'Custom integrations', included: true },
        { name: 'White-label mobile app', included: true },
        { name: 'Real-time notifications', included: true },
        { name: 'Advanced analytics & reporting', included: true },
        { name: 'Full API access', included: true },
      ],
      cta: 'Start Ultima Trial',
      link: ROUTES.REGISTER,
      popular: false,
    },
  ];

  const getDisplayPrice = (plan: typeof plans[0]) => {
    if (plan.price === 'Free') return plan.price;
    
    const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
    return `$${price}`;
  };

  const getDisplayPeriod = (plan: typeof plans[0]) => {
    if (plan.price === 'Free') return 'Forever';
    return billingCycle === 'monthly' ? 'per month' : 'per year';
  };

  const faqs = [
    {
      question: 'Can I change plans later?',
      answer: 'Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express) and PayPal.',
    },
    {
      question: 'Is there a contract or can I cancel anytime?',
      answer: 'No long-term contracts required. You can cancel your subscription at any time. Your access will continue until the end of your current billing period.',
    },
    {
      question: 'Do you offer refunds?',
      answer: 'We offer a 30-day money-back guarantee for Premium and Ultima plans. If you\'re not satisfied, contact us for a full refund within the first 30 days.',
    },
    {
      question: 'What\'s included in the free plan?',
      answer: 'The free plan includes access to post and view up to 10 loads per month, basic search functionality, and email support. It\'s perfect for trying out CargoLume.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 md:mb-6">
            Choose Your Plan
          </h1>
          <p className="text-base md:text-xl text-gray-100 max-w-3xl mx-auto mb-6 md:mb-8">
            Scale your freight business with CargoLume's premium platform.
            <br />
            Start free, upgrade when you're ready.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          {/* Billing Cycle Toggle */}
          <div className="flex justify-center mb-8 md:mb-12">
            <div className="inline-flex items-center bg-white rounded-xl p-1.5 shadow-md border border-gray-200">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-5 md:px-6 py-2 md:py-2.5 rounded-lg font-semibold text-sm md:text-base transition-all duration-300 ${
                  billingCycle === 'monthly'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-5 md:px-6 py-2 md:py-2.5 rounded-lg font-semibold text-sm md:text-base transition-all duration-300 flex items-center gap-2 ${
                  billingCycle === 'yearly'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Yearly
                <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-bold">
                  20% Off
                </span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={plan.name}
                className={`relative bg-white rounded-xl shadow-lg border-2 h-full flex flex-col hover:shadow-2xl transition-all duration-300 ${
                  plan.popular ? 'border-blue-500' : 'border-gray-200'
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2 rounded-full shadow-lg flex items-center gap-1.5">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="font-bold text-sm">Most Popular</span>
                    </div>
                  </div>
                )}

                {/* Plan Header */}
                <div className={`text-center p-6 md:p-8 ${plan.popular ? 'bg-gradient-to-br from-blue-50 to-blue-100' : 'bg-gray-50'} rounded-t-xl`}>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">{plan.description}</p>
                  <div className="mb-2">
                    <span className="text-4xl md:text-5xl font-bold text-blue-700">
                      {getDisplayPrice(plan)}
                    </span>
                    {plan.price !== 'Free' && (
                      <span className="text-gray-600 text-base"> / {billingCycle === 'monthly' ? 'month' : 'year'}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{getDisplayPeriod(plan)}</p>
                </div>

                {/* Features List */}
                <ul className="space-y-3 p-6 md:p-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature.name} className="flex items-start gap-3">
                      {feature.included ? (
                        <div className="bg-blue-100 rounded-full p-1">
                          <Check className="h-4 w-4 text-blue-700 flex-shrink-0" />
                        </div>
                      ) : (
                        <div className="bg-gray-100 rounded-full p-1">
                          <X className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        </div>
                      )}
                      <span className={`text-sm ${feature.included ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <div className="p-6 md:p-8 pt-0">
                  <button 
                    onClick={() => handlePlanClick(plan.link)} 
                    className={`w-full py-3 md:py-3.5 rounded-lg font-bold text-base shadow-lg hover:shadow-xl transition-all duration-300 ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
                        : 'bg-white border-2 border-gray-300 hover:border-blue-500 text-gray-900 hover:bg-blue-50'
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-4xl font-bold text-gray-900 text-center mb-8 md:mb-12">
            Compare Plans
          </h2>
          <div className="max-w-6xl mx-auto overflow-x-auto">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-900 to-gray-800">
                    <th className="py-4 px-4 md:px-6 text-left font-bold text-white">Feature</th>
                    <th className="py-4 px-4 md:px-6 text-center font-bold text-white">Basic</th>
                    <th className="py-4 px-4 md:px-6 text-center font-bold bg-blue-600 text-white">Premium</th>
                    <th className="py-4 px-4 md:px-6 text-center font-bold text-white">Ultima</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    ['Monthly loads', '10', 'Unlimited', 'Unlimited'],
                    ['Load board access', 'Basic', 'Full', 'Advanced'],
                    ['Support', 'Email', 'Email & Chat', 'Priority + Manager'],
                    ['Mobile app', '—', '✓', '✓ White-label'],
                    ['Analytics', '—', 'Advanced', 'Advanced + Reports'],
                    ['API access', '—', '—', 'Full API'],
                  ].map((row, index) => (
                    <tr key={index} className="hover:bg-blue-50/50 transition-colors">
                      <td className="py-4 px-4 md:px-6 font-semibold text-gray-900">{row[0]}</td>
                      <td className="py-4 px-4 md:px-6 text-center text-gray-700">{row[1]}</td>
                      <td className="py-4 px-4 md:px-6 text-center font-bold text-blue-700 bg-blue-50/50">{row[2]}</td>
                      <td className="py-4 px-4 md:px-6 text-center text-gray-700">{row[3]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 md:py-16 bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 md:gap-8 text-center">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Shield className="h-8 w-8 text-blue-700" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-white mb-2">Secure & Reliable</h3>
              <p className="text-gray-300 text-sm md:text-base">Bank-level encryption for all transactions</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Zap className="h-8 w-8 text-blue-700" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-white mb-2">Lightning Fast</h3>
              <p className="text-gray-300 text-sm md:text-base">Real-time updates and instant notifications</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Truck className="h-8 w-8 text-blue-700" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-white mb-2">Industry Leading</h3>
              <p className="text-gray-300 text-sm md:text-base">Trusted by thousands of freight companies</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-4xl font-bold text-gray-900 text-center mb-8 md:mb-12">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl border-2 border-gray-200 p-5 md:p-6 hover:border-blue-400 hover:shadow-lg transition-all duration-300">
                <button
                  className="w-full text-left flex justify-between items-center"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <h3 className="text-base md:text-lg font-bold text-gray-900 pr-4">
                    {faq.question}
                  </h3>
                  <span className="text-blue-600 text-2xl font-bold flex-shrink-0">
                    {openFaq === index ? '−' : '+'}
                  </span>
                </button>
                {openFaq === index && (
                  <p className="mt-4 text-gray-700 text-sm md:text-base">
                    {faq.answer}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 md:mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-base md:text-xl text-gray-100 max-w-2xl mx-auto mb-6 md:mb-8">
            Join thousands of carriers, brokers, and shippers growing their business with CargoLume.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <button 
              onClick={() => handlePlanClick(ROUTES.REGISTER)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-lg font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              Start Free Trial
              <ArrowRight className="h-5 w-5" />
            </button>
            <Link to={ROUTES.CONTACT}>
              <button className="bg-white hover:bg-gray-100 text-gray-900 px-8 py-4 rounded-lg font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 w-full md:w-auto">
                Contact Sales
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Subscription Modal */}
      {showSubscriptionModal && user && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 animate-scale-in">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Current Subscription
              </h3>
              <p className="text-lg text-gray-700 mb-2">
                You are already using the{' '}
                <span className="font-bold text-orange-600 capitalize">
                  {user.subscriptionPlan || 'Ultima'}
                </span>{' '}
                plan
              </p>
              <p className="text-sm text-gray-600 mb-6">
                Your plan will expire on{' '}
                <span className="font-semibold text-blue-600">
                  {formatExpiryDate(user.premiumExpires)}
                </span>
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>Special Offer:</strong> All new users get 3 months of free Ultima access!
                </p>
              </div>
              <button
                onClick={() => setShowSubscriptionModal(false)}
                className="w-full btn btn-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pricing;
