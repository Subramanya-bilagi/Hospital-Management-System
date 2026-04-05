import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Calendar, AlertCircle, CheckCircle2, X } from 'lucide-react';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  // Record modal states
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [selectedAptId, setSelectedAptId] = useState(null);
  const [recordData, setRecordData] = useState({ diagnosis: '', prescription: '', notes: '' });
  const [recordError, setRecordError] = useState('');
  const [submittingRecord, setSubmittingRecord] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await api.get('/appointments/mine');
        setAppointments(res.data.data.appointments || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load appointments.');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/appointments/${id}`, { status });
      setAppointments(prev => prev.map(apt => apt.id === id ? { ...apt, status } : apt));
      setToast(`Appointment marked as ${status}.`);
      setTimeout(() => setToast(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const openRecordModal = (aptId) => {
    setSelectedAptId(aptId);
    setRecordData({ diagnosis: '', prescription: '', notes: '' });
    setRecordError('');
    setShowRecordModal(true);
  };

  const handleCreateRecord = async (e) => {
    e.preventDefault();
    setRecordError('');
    if (!recordData.diagnosis) return setRecordError('Diagnosis is legally required.');

    setSubmittingRecord(true);
    try {
      await api.post('/records', { appointment_id: selectedAptId, ...recordData });
      setToast('Medical record securely authored.');
      setTimeout(() => setToast(''), 3000);
      setShowRecordModal(false);
    } catch (err) {
      setRecordError(err.response?.data?.message || 'Failed to author record natively.');
    } finally {
      setSubmittingRecord(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center">
        <Calendar className="mr-3 text-slate-500 h-6 w-6" /> Assigned Appointments
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 px-5 py-4 rounded-xl text-sm font-medium flex items-center">
          <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" /> {error}
        </div>
      )}

      {toast && (
        <div className="bg-green-50 border border-green-100 text-green-700 px-5 py-4 rounded-xl text-sm font-medium flex items-center animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 className="w-4 h-4 mr-2 flex-shrink-0" /> {toast}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 overflow-hidden">
        {loading ? (
          <div className="animate-pulse space-y-4"><div className="h-4 bg-slate-100 rounded w-1/4"></div><div className="h-10 bg-slate-50 rounded w-full mt-4"></div></div>
        ) : !error && appointments.length === 0 ? (
          <div className="py-12 text-center text-slate-500 font-medium">No appointments assigned to you yet.</div>
        ) : !error && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400 font-bold">
                  <th className="pb-4 px-3">Patient</th>
                  <th className="pb-4 px-3">Date & Time</th>
                  <th className="pb-4 px-3">Reason</th>
                  <th className="pb-4 px-3">Status</th>
                  <th className="pb-4 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt) => (
                  <tr key={apt.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-3 font-semibold text-slate-900">
                      <div className="flex items-center text-sm">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center mr-3 text-xs font-bold border border-slate-200">
                          {apt.patient_name?.charAt(0) || 'P'}
                        </div>
                        {apt.patient_name}
                      </div>
                    </td>
                    <td className="py-4 px-3 text-sm text-slate-500 font-medium">
                      {new Date(apt.date_time).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </td>
                    <td className="py-4 px-3 text-sm text-slate-500 max-w-[200px] truncate">{apt.reason || '—'}</td>
                    <td className="py-4 px-3">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${apt.status === 'confirmed' ? 'bg-sky-50 text-sky-700 border-sky-100' : apt.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : apt.status === 'cancelled' ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="py-4 px-3 text-right">
                      {(apt.status === 'pending' || apt.status === 'confirmed') && (
                        <div className="flex items-center justify-end gap-2">
                          {apt.status === 'pending' && (
                            <button
                              onClick={() => updateStatus(apt.id, 'confirmed')}
                              className="text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Confirm
                            </button>
                          )}

                          <button
                            onClick={() => updateStatus(apt.id, 'cancelled')}
                            className="text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                      
                      {(apt.status === 'completed' || apt.status === 'confirmed') && (
                        <div className="flex items-center justify-end mt-2">
                           <button
                             onClick={() => openRecordModal(apt.id)}
                             className="text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 border border-slate-800 shadow-sm px-3 py-1.5 rounded-lg transition-colors w-full sm:w-auto"
                           >
                             + Record
                           </button>
                        </div>
                      )}

                      {apt.status === 'cancelled' && (
                        <span className="text-xs text-slate-400">No actions</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Record Modal Overlay */}
      {showRecordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={() => setShowRecordModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowRecordModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-slate-900 mb-6">Author Medical Record</h2>

            {recordError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm font-medium border border-red-100 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" /> {recordError}
              </div>
            )}

            <form onSubmit={handleCreateRecord} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">Diagnosis <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={recordData.diagnosis}
                  onChange={(e) => setRecordData({ ...recordData, diagnosis: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-800 transition-colors"
                  placeholder="Primary diagnosis securely mapped"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">Prescription <span className="text-slate-400 font-normal">(optional)</span></label>
                <textarea
                  value={recordData.prescription}
                  onChange={(e) => setRecordData({ ...recordData, prescription: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-800 transition-colors resize-none h-24"
                  placeholder="Medications and dosage metrics..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">Consultation Notes <span className="text-slate-400 font-normal">(optional)</span></label>
                <textarea
                  value={recordData.notes}
                  onChange={(e) => setRecordData({ ...recordData, notes: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-800 transition-colors resize-none h-24"
                  placeholder="General tracking parameters..."
                />
              </div>

              <button
                type="submit"
                disabled={submittingRecord}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium py-3 rounded-xl transition-colors shadow-sm flex justify-center items-center disabled:opacity-60"
              >
                {submittingRecord ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white"></div> : 'Save Secure Record'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;
