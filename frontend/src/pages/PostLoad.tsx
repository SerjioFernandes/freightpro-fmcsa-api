import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Plus, Truck, CheckCircle, FileText, ArrowRight, CreditCard } from 'lucide-react';
import PostLoadForm from '../components/forms/PostLoadForm';
import { useAuthStore } from '../store/authStore';
import { canPostLoad } from '../utils/permissions';
import type { Load } from '../types/load.types';
import type { Shipment } from '../types/shipment.types';
import { ROUTES } from '../utils/constants';

const PostLoad = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [postedLoad, setPostedLoad] = useState<Load | null>(null);
  const [linkedShipment, setLinkedShipment] = useState<Shipment | null>(null);

  const estimatedLinehaul = useMemo(() => {
    if (!postedLoad) return null;
    if (postedLoad.rateType === 'per_mile') {
      if (typeof postedLoad.distance === 'number' && postedLoad.distance > 0) {
        return postedLoad.distance * postedLoad.rate;
      }
      return null;
    }
    return postedLoad.rate;
  }, [postedLoad]);

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
              <PostLoadForm
                onLoadPosted={(load, context) => {
                  setPostedLoad(load);
                  setLinkedShipment(context?.shipment ?? null);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {postedLoad && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center px-4 z-50">
          <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
            <div className="bg-gradient-to-r from-emerald-600 to-blue-600 px-6 py-5 flex items-center gap-3 text-white">
              <CheckCircle className="h-7 w-7" />
              <div>
                <h3 className="text-xl font-semibold">Load published successfully</h3>
                <p className="text-sm text-emerald-100">Share details with carriers and prepare compliance docs.</p>
              </div>
            </div>
            <div className="p-6 md:p-8 space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-500 mb-2">Load Summary</p>
                <h4 className="text-2xl font-bold text-slate-900">{postedLoad.title}</h4>
                <p className="text-slate-600 mt-2 leading-relaxed">{postedLoad.description}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div className="rounded-2xl border border-slate-200 p-5">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Lane</p>
                  <p className="text-slate-900 font-medium">
                    {postedLoad.origin.city}, {postedLoad.origin.state} → {postedLoad.destination.city}, {postedLoad.destination.state}
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    Pickup {new Date(postedLoad.pickupDate).toLocaleDateString()} • Delivery {new Date(postedLoad.deliveryDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-5 space-y-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Billing Snapshot</p>
                  <p className="text-3xl font-heading font-bold text-emerald-600">
                    ${postedLoad.rate.toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    {postedLoad.rateType === 'per_mile' ? 'Per-mile rate' : 'Flat line-haul rate'} • Equipment {postedLoad.equipmentType}
                  </p>
                  <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                    <CreditCard className="h-3.5 w-3.5" />
                    Billing status: {(postedLoad.billingStatus || 'not_ready').replace(/_/g, ' ')}
                  </div>
                  {typeof postedLoad.distance === 'number' && postedLoad.distance > 0 && (
                    <p className="text-xs text-slate-500 mt-2">
                      Distance: {postedLoad.distance.toLocaleString()} miles
                    </p>
                  )}
                  {typeof estimatedLinehaul === 'number' && (
                    <p className="text-sm font-semibold text-slate-900 mt-2">
                      Estimated line-haul total: ${estimatedLinehaul.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </p>
                  )}
                  {postedLoad.shipmentId && (
                    <p className="mt-3 text-xs font-semibold text-blue-600 uppercase tracking-wide">
                      Linked Shipment: {postedLoad.shipmentId}
                    </p>
                  )}
                </div>
              </div>

              {linkedShipment && (
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
                  <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-2">
                    Shipment Linked
                  </p>
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                    <div>
                      <h4 className="text-lg font-semibold text-slate-900">{linkedShipment.title}</h4>
                      <p className="text-sm text-slate-600">{linkedShipment.description}</p>
                    </div>
                    <div className="text-sm text-slate-700 space-y-1">
                      <p>
                        <span className="font-semibold text-slate-900">Pickup:</span> {linkedShipment.pickup.city},{' '}
                        {linkedShipment.pickup.state}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-900">Delivery:</span> {linkedShipment.delivery.city},{' '}
                        {linkedShipment.delivery.state}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-600/10 p-2 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">Next steps</p>
                    <ul className="mt-2 text-sm text-slate-600 space-y-1.5 list-disc list-inside">
                      <li>Attach BOL/POD templates and carrier packets to this load.</li>
                      <li>Share lane with preferred carriers or invite via messaging.</li>
                      <li>Confirm payment terms so invoices can auto-fill once the load is delivered.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setPostedLoad(null);
                    setLinkedShipment(null);
                    navigate(ROUTES.LOAD_BOARD);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-blue-700 transition-colors"
                >
                  View on Load Board
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPostedLoad(null);
                    setLinkedShipment(null);
                    navigate(`${ROUTES.DOCUMENTS}?prefill=${postedLoad._id}`);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border-2 border-blue-200 px-4 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-50 transition-colors"
                >
                  Attach Documents
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostLoad;
