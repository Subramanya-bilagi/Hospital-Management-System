import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Receipt, AlertCircle } from 'lucide-react';

const Billing = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const res = await api.get('/billing/mine');
        setBills(res.data.data.bills || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load billing records.');
      } finally {
        setLoading(false);
      }
    };
    fetchBills();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl">
       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
         <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center">
            <Receipt className="mr-3 text-slate-500 h-6 w-6" /> My Bills
         </h1>
       </div>

       {error && (
         <div className="bg-red-50 border border-red-100 text-red-700 px-5 py-4 rounded-xl text-sm font-medium flex items-center">
           <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" /> {error}
         </div>
       )}

       <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 overflow-hidden">
         {loading ? (
             <div className="animate-pulse space-y-4">
               <div className="h-4 bg-slate-100 rounded w-1/4"></div>
               <div className="h-10 bg-slate-50 rounded w-full"></div>
             </div>
         ) : !error && bills.length === 0 ? (
             <div className="py-12 text-center text-slate-500 font-medium">No bills found.</div>
         ) : !error && (
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead>
                   <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400 font-bold">
                     <th className="pb-4 px-3">Date</th>
                     <th className="pb-4 px-3 text-right">Amount</th>
                     <th className="pb-4 px-3 text-right">Status</th>
                   </tr>
                 </thead>
                 <tbody>
                   {bills.map((bill) => (
                     <tr key={bill.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                       <td className="py-4 px-3 font-semibold text-slate-700 text-sm">
                          {new Date(bill.generated_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                       </td>
                       <td className="py-4 px-3 font-bold text-slate-900 text-right text-[15px]">
                          ₹{bill.total_amount}
                       </td>
                       <td className="py-4 px-3 text-right">
                         <span className={`px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${bill.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                           {bill.payment_status}
                         </span>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
         )}
       </div>
    </div>
  );
};
export default Billing;
