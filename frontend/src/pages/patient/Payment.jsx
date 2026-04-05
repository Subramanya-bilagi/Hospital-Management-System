import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { CreditCard, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

const Payment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchBill = async () => {
      try {
        const res = await api.get(`/billing/${id}`);
        setBill(res.data.data.bill);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to locate distinct billing entity naturally.');
      } finally {
        setLoading(false);
      }
    };
    fetchBill();
  }, [id]);

  const handlePayment = async () => {
    setProcessing(true);
    setError('');
    try {
      await api.post(`/billing/${id}/pay`);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Underlying payment transaction failed organically.');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-white"></div>
      </div>
    );
  }

  if (error && !bill) {
    return (
      <div className="max-w-xl mx-auto mt-10">
        <div className="bg-red-50 border border-red-100 text-red-700 px-6 py-5 rounded-2xl text-center text-sm font-bold flex flex-col items-center">
          <AlertCircle className="w-8 h-8 mb-3 opacity-80" />
          {error}
        </div>
      </div>
    );
  }

  const isPaid = bill.payment_status === 'paid' || success;

  return (
    <div className="w-full max-w-lg mx-auto space-y-6 mt-2 sm:mt-6 p-4 sm:p-0">
       <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative">
         {/* Top Banner Block */}
         <div className={`p-8 text-center ${isPaid ? 'bg-emerald-600' : 'bg-slate-800'} text-white transition-colors duration-500`}>
           <div className="w-16 h-16 bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4">
              {isPaid ? <CheckCircle2 className="w-8 h-8 text-white" /> : <CreditCard className="w-8 h-8 text-white" />}
           </div>
           <h1 className="text-2xl font-extrabold tracking-tight">
             {isPaid ? 'Payment Confirmed' : 'Secure Checkout'}
           </h1>
           <p className="text-white/80 font-medium text-sm mt-1">
             {isPaid ? 'Your transaction mapped structurally elegantly.' : 'Complete your pending medical bill seamlessly.'}
           </p>
         </div>

         {/* Content Block */}
         <div className="p-8">
           {error && (
             <div className="mb-6 bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm font-medium border border-red-100 flex items-center">
               <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" /> {error}
             </div>
           )}

           <div className="space-y-4">
              <div className="flex justify-between items-end border-b border-slate-100 pb-4">
                 <p className="text-xs tracking-widest text-slate-400 font-bold uppercase">Patient Name</p>
                 <p className="font-semibold text-slate-900">{bill.patient_name}</p>
              </div>

              <div className="flex justify-between items-end border-b border-slate-100 pb-4">
                 <p className="text-xs tracking-widest text-slate-400 font-bold uppercase">Date Generated</p>
                 <p className="font-semibold text-slate-500 text-sm">{new Date(bill.generated_date).toLocaleDateString()}</p>
              </div>

              <div className="flex justify-between items-end pb-2 pt-2">
                 <p className="text-xs tracking-widest text-slate-400 font-bold uppercase">Total Due</p>
                 <p className="text-3xl font-extrabold text-slate-900">₹{bill.total_amount}</p>
              </div>
           </div>

           {!isPaid ? (
             <button
               onClick={handlePayment}
               disabled={processing}
               className="w-full mt-8 bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 rounded-xl transition-colors flex justify-center items-center disabled:opacity-75"
             >
               {processing ? (
                 <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white"></div>
               ) : (
                 <>
                   <ShieldCheck className="w-5 h-5 mr-2" /> Pay ₹{bill.total_amount} Now
                 </>
               )}
             </button>
           ) : (
             <div className="w-full mt-8 bg-green-50 text-green-700 font-bold py-4 rounded-xl text-center border border-green-200">
               Transaction Processed Successfully
             </div>
           )}
         </div>
       </div>
    </div>
  );
};

export default Payment;
