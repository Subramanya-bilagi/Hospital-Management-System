import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { FileText, AlertCircle } from 'lucide-react';

const DoctorRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await api.get('/records/mine');
        setRecords(res.data.data.records || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load records.');
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl">
       <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center">
          <FileText className="mr-3 text-slate-500 h-6 w-6" /> Patient Records
       </h1>

       {error && (
         <div className="bg-red-50 border border-red-100 text-red-700 px-5 py-4 rounded-xl text-sm font-medium flex items-center">
           <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" /> {error}
         </div>
       )}

       <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 overflow-hidden">
         {loading ? (
             <div className="animate-pulse space-y-4"><div className="h-4 bg-slate-100 rounded w-1/4"></div></div>
         ) : !error && records.length === 0 ? (
             <div className="py-12 text-center text-slate-500 font-medium">No records authored yet.</div>
         ) : !error && (
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead>
                   <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400 font-bold">
                     <th className="pb-4 px-3">Patient</th>
                     <th className="pb-4 px-3">Date</th>
                     <th className="pb-4 px-3">Diagnosis</th>
                   </tr>
                 </thead>
                 <tbody>
                   {records.map((rec) => (
                     <tr key={rec.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                       <td className="py-4 px-3 font-semibold text-slate-900 text-sm">{rec.patient_name}</td>
                       <td className="py-4 px-3 text-sm text-slate-500">{new Date(rec.record_date).toLocaleDateString()}</td>
                       <td className="py-4 px-3 text-sm text-slate-500">{rec.diagnosis}</td>
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

export default DoctorRecords;
