import { Link } from 'react-router-dom';
import { Check, X, Zap, Shield, Truck, Star, ArrowRight } from 'lucide-react';
import Button from '../components/common/Button';
import { ROUTES } from '../utils/constants';
import { useState } from 'react';

const Pricing = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const plans = [
    {
      name: 'Basic',
      price: 'Free',
      period: 'Forever',
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
      name: 'Enterprise',
      price: 'Custom',
      period: 'Contact us',
      description: 'For large-scale operations',
      features: [
        { name: 'Unlimited everything', included: true },
        { name: 'Dedicated load board', included: true },
        { name: '24/7 phone & priority support', included: true },
        { name: 'Custom integrations', included: true },
        { name: 'White-label mobile app', included: true },
        { name: 'Real-time notifications', included: true },
        { name: 'Advanced analytics & reporting', included: true },
        { name: 'Full API access', included: true },
      ],
      cta: 'Contact Sales',
      link: ROUTES.CONTACT,
      popular: false,
    },
  ];

  const faqs = [
    {
      question: 'Can I change plans later?',
      answer: 'Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and wire transfers for Enterprise plans.',
    },
    {
      question: 'Is there a contract or can I cancel anytime?',
      answer: 'No long-term contracts required. You can cancel your subscription at any time. Your access will continue until the end of your current billing period.',
    },
    {
      question: 'Do you offer refunds?',
      answer: 'We offer a 30-day money-back guarantee for Premium plans. If you\'re not satisfied, contact us for a full refund within the first 30 days.',
    },
    {
      question: 'What\'s included in the free plan?',
      answer: 'The free plan includes access to post and view up to 10 loads per month, basic search functionality, and email support. It\'s perfect for trying out CargoLume.',
    },
    {
      question: 'How does the Enterprise plan work?',
      answer: 'Enterprise plans are customized to your specific needs. Contact our sales team to discuss volume discounts, custom integrations, and dedicated support options.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="gradient-bg-dark py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-heading font-bold text-white mb-6 animate-fade-in">
            Choose Your Plan
          </h1>
          <p className="text-xl md:text-2xl text-white max-w-3xl mx-auto mb-8 animate-slide-up">
            Scale your freight business with CargoLume's premium platform.
            <br />
            Start free, upgrade when you're ready.
          </p>
          <div className="flex justify-center gap-4 text-white animate-slide-up">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-orange-accent" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-orange-accent" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={plan.name}
                className={`relative card ${plan.popular ? 'ring-4 ring-orange-accent' : ''} hover:shadow-2xl transition-all duration-300 animate-scale-in`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="badge-gold px-6 py-2 glow-orange">
                      <Star className="h-4 w-4 inline-block mr-1" />
                      Most Popular
                    </div>
                  </div>
                )}

                {/* Plan Header */}
                <div className={`text-center pb-6 mb-6 border-b-2 ${plan.popular ? 'border-orange-accent' : 'border-primary-blue/30'}`}>
                  <h3 className="text-2xl font-heading font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                  <div className="mb-2">
                    <span className="text-5xl font-heading font-bold text-orange-accent">
                      {plan.price}
                    </span>
                    {plan.price !== 'Free' && plan.price !== 'Custom' && (
                      <span className="text-gray-600 text-lg"> / month</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{plan.period}</p>
                </div>

                {/* Features List */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature.name} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-primary-blue flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="h-5 w-5 text-gray-300 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={feature.included ? 'text-gray-900' : 'text-gray-400'}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <div className="mt-auto">
                  <Link to={plan.link} className="block">
                    <Button
                      variant={plan.popular ? 'accent' : 'primary'}
                      fullWidth
                      icon={<ArrowRight className="h-5 w-5" />}
                      iconPosition="right"
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-heading font-bold text-gray-900 text-center mb-12">
            Compare Plans
          </h2>
          <div className="max-w-6xl mx-auto overflow-x-auto">
            <table className="w-full bg-soft-ivory rounded-lg shadow-lg">
              <thead>
                <tr className="bg-primary-blue-darker text-white">
                  <th className="py-4 px-6 text-left font-heading">Feature</th>
                  <th className="py-4 px-6 text-center font-heading">Basic</th>
                  <th className="py-4 px-6 text-center font-heading bg-orange-accent text-white">Premium</th>
                  <th className="py-4 px-6 text-center font-heading">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[
                  ['Monthly loads', '10', 'Unlimited', 'Unlimited'],
                  ['Load board access', 'Basic', 'Full', 'Dedicated'],
                  ['Support', 'Email', 'Email & Chat', '24/7 Phone'],
                  ['Mobile app', '—', '✓', '✓ White-label'],
                  ['Analytics', '—', 'Advanced', 'Custom Reports'],
                  ['API access', '—', '—', 'Full API'],
                ].map((row, index) => (
                  <tr key={index} className="hover:bg-light-ivory transition-colors">
                    <td className="py-4 px-6 font-medium text-gray-900">{row[0]}</td>
                    <td className="py-4 px-6 text-center text-gray-600">{row[1]}</td>
                    <td className="py-4 px-6 text-center font-semibold text-orange-accent">{row[2]}</td>
                    <td className="py-4 px-6 text-center text-gray-600">{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16 bg-primary-blue-darker">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="animate-fade-in">
              <Shield className="h-12 w-12 text-orange-accent mx-auto mb-4" />
              <h3 className="text-xl font-heading font-bold text-white mb-2">Secure & Reliable</h3>
              <p className="text-gray-200">Bank-level encryption for all transactions</p>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
              <Zap className="h-12 w-12 text-orange-accent mx-auto mb-4" />
              <h3 className="text-xl font-heading font-bold text-white mb-2">Lightning Fast</h3>
              <p className="text-gray-200">Real-time updates and instant notifications</p>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
              <Truck className="h-12 w-12 text-orange-accent mx-auto mb-4" />
              <h3 className="text-xl font-heading font-bold text-white mb-2">Industry Leading</h3>
              <p className="text-gray-200">Trusted by thousands of freight companies</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-heading font-bold text-midnight-ocean text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="card border border-emerald-whisper/30 hover:border-saffron-gold transition-colors">
                <button
                  className="w-full text-left flex justify-between items-center"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <h3 className="text-lg font-heading font-semibold text-midnight-ocean pr-4">
                    {faq.question}
                  </h3>
                  <span className="text-saffron-gold text-2xl flex-shrink-0">
                    {openFaq === index ? '−' : '+'}
                  </span>
                </button>
                {openFaq === index && (
                  <p className="mt-4 text-gray-700 animate-slide-down">
                    {faq.answer}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="gradient-bg-dark py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-heading font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white max-w-2xl mx-auto mb-8">
            Join thousands of carriers, brokers, and shippers growing their business with CargoLume.
          </p>
          <div className="flex justify-center gap-4">
            <Link to={ROUTES.REGISTER}>
              <Button variant="accent" size="lg" icon={<ArrowRight className="h-6 w-6" />} iconPosition="right">
                Start Free Trial
              </Button>
            </Link>
            <Link to={ROUTES.CONTACT}>
              <Button variant="secondary" size="lg">
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;



