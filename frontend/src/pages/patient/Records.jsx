import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { FileText, ClipboardList, AlertCircle } from 'lucide-react';

const Records = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await api.get('/records/mine');
        setRecords(res.data.data.records || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load medical records.');
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl">
       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
         <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center">
            <ClipboardList className="mr-3 text-slate-500 h-6 w-6" /> Medical Records
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
               <div className="h-24 bg-slate-50 rounded-xl w-full"></div>
             </div>
         ) : !error && records.length === 0 ? (
             <div className="py-12 text-center text-slate-500 font-medium">No medical records found yet.</div>
         ) : !error && (
             <div className="space-y-5">
                 {records.map((rec) => (
                    <div key={rec.id} className="border border-slate-100 rounded-2xl p-6 hover:shadow-sm hover:border-slate-200 transition-colors bg-white relative overflow-hidden group">
                       <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-800 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                       <div className="flex justify-between items-start mb-5 pl-2">
                           <div className="flex items-center space-x-3">
                              <div className="bg-slate-50 border border-slate-100 p-2 rounded-lg text-slate-700">
                                 <FileText className="w-5 h-5"/>
                              </div>
                              <div>
                                <p className="text-xs tracking-widest text-slate-400 font-bold uppercase mb-0.5">Doctor</p>
                                <p className="text-[15px] font-bold text-slate-900">Dr. {rec.doctor_name}</p>
                              </div>
                           </div>
                           <p className="text-xs font-semibold px-3 py-1 bg-slate-50 border border-slate-100 rounded-md text-slate-500">
                             {new Date(rec.record_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric'})}
                           </p>
                       </div>

                       <div className="pl-2 pr-4 space-y-4">
                         <div>
                           <h4 className="text-[11px] font-bold tracking-wider uppercase text-slate-400 mb-2">Diagnosis</h4>
                           <p className="text-sm font-semibold bg-slate-50 text-slate-800 px-3 py-2 inline-block rounded-lg shadow-sm border border-slate-200/60">
                             {rec.diagnosis}
                           </p>
                         </div>
                         {rec.prescription && (
                             <div>
                               <h4 className="text-[11px] font-bold tracking-wider uppercase text-slate-400 mb-2 mt-4">Prescription</h4>
                               <p className="text-sm text-slate-600 bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl">
                                 {rec.prescription}
                               </p>
                             </div>
                         )}
                       </div>
                    </div>
                 ))}
             </div>
         )}
       </div>
    </div>
  );
};
export default Records;
