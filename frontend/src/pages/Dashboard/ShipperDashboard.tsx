import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import { Package, TrendingUp, DollarSign, Users, Plus, MapPin, ArrowRight } from 'lucide-react';

const ShipperDashboard = () => {
  const { user } = useAuthStore();
  
  // TODO: Fetch real shipment data from API
  const [shipments, setShipments] = useState<any[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);

  useEffect(() => {
    // TODO: Fetch shipments for this shipper
    // For now, using placeholder data
    setShipments([]);
    setProposals([]);
  }, []);

  // Calculate stats (placeholder for now)
  const totalShipments = shipments.length;
  const activeShipments = shipments.filter(s => s.status === 'open' || s.status === 'proposal_received').length;
  const totalProposals = proposals.length;
  const totalCosts = proposals.reduce((sum, p) => sum + (p.rate || 0), 0);

  const stats = [
    {
      label: 'Shipment Requests',
      value: totalShipments,
      icon: <Package className="h-12 w-12" />,
      color: 'text-orange-accent',
      bgColor: 'bg-orange-accent/10'
    },
    {
      label: 'Active Shipments',
      value: activeShipments,
      icon: <TrendingUp className="h-12 w-12" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-600/10'
    },
    {
      label: 'Broker Proposals',
      value: totalProposals,
      icon: <Users className="h-12 w-12" />,
      color: 'text-green-600',
      bgColor: 'bg-green-600/10'
    },
    {
      label: 'Total Costs',
      value: `$${totalCosts.toLocaleString()}`,
      icon: <DollarSign className="h-12 w-12" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-600/10'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-gray-900">
            Shipper Dashboard
          </h1>
          <p className="text-xl text-gray-700 mt-2">
            Welcome back, <span className="text-orange-accent font-semibold">{user?.company}</span>! 📦
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div 
              key={stat.label}
              className="card card-hover group animate-scale-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium uppercase tracking-wide mb-2">
                    {stat.label}
                  </p>
                  <p className="text-3xl md:text-4xl font-heading font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color} ${stat.bgColor} p-3 rounded-lg transition-transform group-hover:scale-110 group-hover:rotate-6`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Shipment Requests */}
        <div className="card animate-slide-up">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-heading font-bold text-gray-900">
              My Shipments
            </h2>
            <Link to={ROUTES.SHIPMENTS} className="btn btn-accent text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create New Shipment
            </Link>
          </div>
          
          {shipments.length > 0 ? (
            <div className="space-y-4">
              {shipments.slice(0, 5).map((shipment, index) => (
                <div 
                  key={shipment._id} 
                  className="border-2 border-primary-blue/30 rounded-lg p-5 hover:border-orange-accent hover:shadow-lg transition-all duration-200 bg-white animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex justify-between items-start flex-wrap gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-heading font-semibold text-gray-900 text-lg">
                          {shipment.commodity}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          shipment.status === 'open' ? 'bg-green-100 text-green-800' : 
                          shipment.status === 'proposal_received' ? 'bg-blue-100 text-blue-800' : 
                          shipment.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {shipment.status?.toUpperCase().replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPin className="h-4 w-4 text-primary-blue flex-shrink-0" />
                        <p className="text-sm">
                          <span className="font-medium">{shipment.origin?.city}, {shipment.origin?.state}</span>
                          {' → '}
                          <span className="font-medium">{shipment.destination?.city}, {shipment.destination?.state}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">
                        {shipment.proposals?.length || 0} proposals
                      </p>
                      <Link to={`${ROUTES.SHIPMENTS}/${shipment._id}`} className="text-primary-blue hover:text-orange-accent font-medium text-sm flex items-center justify-end gap-1">
                        View Details <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-4">No shipments yet</p>
              <Link to={ROUTES.SHIPMENTS}>
                <button className="btn btn-accent text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Shipment
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* Broker Proposals */}
        {proposals.length > 0 && (
          <div className="card animate-slide-up mt-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-heading font-bold text-gray-900">
                Broker Proposals
              </h2>
              <Link to={ROUTES.SHIPMENTS} className="text-primary-blue hover:text-orange-accent font-medium flex items-center gap-2 transition-colors">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            
            <div className="space-y-4">
              {proposals.slice(0, 3).map((proposal, index) => (
                <div 
                  key={proposal._id} 
                  className="border-2 border-green-200 rounded-lg p-5 hover:border-green-400 hover:shadow-lg transition-all duration-200 bg-green-50 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex justify-between items-start flex-wrap gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading font-semibold text-gray-900 text-lg mb-2">
                        {proposal.brokerName}
                      </h3>
                      <p className="text-sm text-gray-700 mb-2">{proposal.message}</p>
                      <p className="text-xs text-gray-500">
                        For shipment: {proposal.shipmentTitle}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-heading font-bold text-green-600">
                        ${proposal.rate?.toLocaleString()}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <button className="btn btn-primary text-sm">Accept</button>
                        <button className="btn btn-secondary text-sm">Reject</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShipperDashboard;
