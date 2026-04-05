import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Receipt, AlertCircle, Plus, X, QrCode } from 'lucide-react';

const StaffBilling = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Bill Generation State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ appointment_id: '', items: '', total_amount: '' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // QR Generation State
  const [showQR, setShowQR] = useState(false);
  const [activeBillId, setActiveBillId] = useState(null);
  
  // Dynamic Appts loader
  const [billableApps, setBillableApps] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);

  const fetchBills = async () => {
    try {
      const res = await api.get('/billing');
      setBills(res.data.data.bills || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load billing records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const updatePaymentStatus = async (id, status) => {
    try {
      await api.put(`/billing/${id}/status`, { payment_status: status });
      setBills(prev => prev.map(bill => bill.id === id ? { ...bill, payment_status: status } : bill));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update payment status.');
    }
  };

  const openQR = (id) => {
    setActiveBillId(id);
    setShowQR(true);
  };

  const openModal = async () => {
    setFormData({ appointment_id: '', items: '', total_amount: '' });
    setFormError('');
    setShowModal(true);
    setLoadingApps(true);
    try {
      const res = await api.get('/appointments?status=pending,confirmed');
      setBillableApps(res.data.data.appointments || []);
    } catch (err) {
      setFormError('Failed to fetch billable appointments from backend parameters explicitly.');
    } finally {
      setLoadingApps(false);
    }
  };

  const handleCreateBill = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (!formData.appointment_id || !formData.items || !formData.total_amount) {
      return setFormError('All fields are logically required properly.');
    }

    let parsedItems;
    try {
      // Clean comma-separated strings into parsed array arrays natively
      parsedItems = formData.items.split(',').map(item => item.trim()).filter(Boolean);
      if(parsedItems.length === 0) parsedItems = [formData.items];
    } catch(err) {
      parsedItems = [formData.items];
    }

    setSubmitting(true);
    try {
      await api.post('/billing', { 
        appointment_id: Number(formData.appointment_id), 
        items: parsedItems, 
        total_amount: Number(formData.total_amount) 
      });
      setShowModal(false);
      setLoading(true);
      fetchBills();
    } catch(err) {
       setFormError(err.response?.data?.message || 'Failed to mechanically generate structural bill.');
    } finally {
       setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
         <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center">
            <Receipt className="mr-3 text-slate-500 h-6 w-6" /> Billing Management
         </h1>
         <button onClick={openModal} className="flex items-center px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-medium transition-colors shadow-sm text-sm">
            <Plus className="w-4 h-4 mr-2" /> Generate Bill
         </button>
       </div>

       {error && (
         <div className="bg-red-50 border border-red-100 text-red-700 px-5 py-4 rounded-xl text-sm font-medium flex items-center">
           <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" /> {error}
         </div>
       )}

       <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 overflow-hidden">
         {loading ? (
             <div className="animate-pulse space-y-4"><div className="h-4 bg-slate-100 rounded w-1/4"></div></div>
         ) : !error && bills.length === 0 ? (
             <div className="py-12 text-center text-slate-500 font-medium">No bills in the system yet.</div>
         ) : !error && (
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead>
                   <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400 font-bold">
                     <th className="pb-4 px-3 w-1/5">Patient</th>
                     <th className="pb-4 px-3 w-1/6">Date</th>
                     <th className="pb-4 px-3">Itemized Charges</th>
                     <th className="pb-4 px-3 text-right">Amount</th>
                     <th className="pb-4 px-3 text-right">Payment Status</th>
                   </tr>
                 </thead>
                 <tbody>
                   {bills.map((bill) => (
                     <tr key={bill.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                       <td className="py-4 px-3 font-semibold text-slate-900 text-sm">{bill.patient_name}</td>
                       <td className="py-4 px-3 text-sm text-slate-500">{new Date(bill.generated_date).toLocaleDateString()}</td>
                       <td className="py-4 px-3 text-xs text-slate-500 max-w-xs truncate">
                         {Array.isArray(bill.items) ? bill.items.join(' • ') : (typeof bill.items === 'string' ? bill.items : JSON.stringify(bill.items))}
                       </td>
                       <td className="py-4 px-3 font-bold text-slate-900 text-right text-[15px]">₹{bill.total_amount}</td>
                       <td className="py-4 px-3 text-right flex justify-end items-center gap-3">
                          {bill.payment_status === 'unpaid' && (
                             <button
                               onClick={() => openQR(bill.id)}
                               className="text-[11px] font-bold uppercase tracking-wider bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-3 py-1.5 rounded-lg transition-colors"
                             >
                               Get QR
                             </button>
                          )}
                          <select
                            value={bill.payment_status}
                            onChange={(e) => updatePaymentStatus(bill.id, e.target.value)}
                            className={`text-xs font-bold uppercase tracking-wider border rounded-lg px-2.5 py-1.5 outline-none cursor-pointer appearance-none ${bill.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}
                          >
                            <option value="paid">PAID</option>
                            <option value="unpaid">UNPAID</option>
                          </select>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           )}
       </div>

       {/* QR Target Extraction Display Modal */}
       {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => { setShowQR(false); fetchBills(); }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 sm:p-8 relative flex flex-col items-center text-center max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => { setShowQR(false); fetchBills(); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 rounded-full p-1 border border-gray-100">
              <X className="w-4 h-4" />
            </button>

            <div className="w-16 h-16 bg-purple-100/50 border border-purple-100 text-purple-600 flex items-center justify-center rounded-2xl mb-4 shadow-inner">
              <QrCode className="w-8 h-8" />
            </div>

            <h2 className="text-xl font-extrabold text-textDark mb-1">Scan to Pay</h2>
            <p className="text-sm text-textSoft font-medium mb-6">Patient can safely scan this visual artifact directly securely paying seamlessly.</p>

            <div className="bg-white p-3 rounded-2xl border-2 border-gray-100 shadow-sm mb-4 inline-block">
              {/* Reliable safe external imaging payload securely implicitly encapsulating tracking variables locally linearly explicitly definitively implicitly */}
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=2e1065&data=${encodeURIComponent(`${import.meta.env.VITE_PUBLIC_URL || window.location.protocol + '//' + window.location.host}/payment/${activeBillId}`)}`} 
                alt="Payment Structural QR Engine Code Image" 
                className="w-48 h-48 mix-blend-multiply rounded-xl"
              />
            </div>

            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">Entity: {activeBillId}</p>
          </div>
        </div>
       )}

       {/* Generate Bill Modal Overlay */}
       {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
              <Receipt className="w-5 h-5 mr-2 text-slate-500" /> Issue Invoice
            </h2>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm font-medium border border-red-100 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" /> {formError}
              </div>
            )}

            <form onSubmit={handleCreateBill} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">Select Patient Appointment <span className="text-red-500">*</span></label>
                {loadingApps ? (
                  <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 animate-pulse text-sm">Validating endpoints...</div>
                ) : (
                  <select
                    value={formData.appointment_id}
                    onChange={(e) => setFormData({ ...formData, appointment_id: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-800 transition-colors font-medium appearance-none"
                  >
                    <option value="">-- Choose an Appointment --</option>
                    {billableApps.map(apt => (
                      <option key={apt.id} value={apt.id}>
                        {apt.patient_name} — {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)} ({new Date(apt.date_time).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">Itemized Mapping Strings <span className="text-slate-400 font-normal">(comma separated)</span></label>
                <textarea
                  value={formData.items}
                  onChange={(e) => setFormData({ ...formData, items: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-800 transition-colors resize-none h-24"
                  placeholder="Consultation Fee, Blood Test, X-Ray Scan..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">Total Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-500">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.total_amount}
                    onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                    className="w-full pl-8 pr-4 py-3 bg-white border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-800 transition-colors font-bold"
                    placeholder="150.00"
                    min="0"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium py-3 rounded-xl transition-colors shadow-sm flex justify-center items-center disabled:opacity-60"
              >
                {submitting ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white"></div> : 'Publish Billing Pipeline'}
              </button>
            </form>
          </div>
        </div>
       )}
    </div>
  );
};
export default StaffBilling;
