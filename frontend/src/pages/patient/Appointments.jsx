import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Calendar, Plus, X, AlertCircle, CheckCircle2 } from 'lucide-react';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Booking modal state
  const [showModal, setShowModal] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({ doctor_id: '', date_time: '', reason: '' });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  const fetchDoctors = async () => {
    try {
      const res = await api.get('/doctors');
      setDoctors(res.data.data.doctors || []);
    } catch (err) {
      console.error('Failed to load doctors list', err);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const openModal = () => {
    setFormData({ doctor_id: '', date_time: '', reason: '' });
    setFormError('');
    setFormSuccess('');
    fetchDoctors();
    setShowModal(true);
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!formData.doctor_id) return setFormError('Please select a doctor.');
    if (!formData.date_time) return setFormError('Please select a date and time.');

    setSubmitting(true);
    try {
      await api.post('/appointments', formData);
      setFormSuccess('Appointment booked successfully!');
      setFormData({ doctor_id: '', date_time: '', reason: '' });
      setLoading(true);
      fetchAppointments();
      setTimeout(() => setShowModal(false), 1200);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to book appointment.');
    } finally {
      setSubmitting(false);
    }
  };

  const cancelAppointment = async (id) => {
    if (!confirm('Cancel this appointment?')) return;
    try {
      await api.delete(`/appointments/${id}`);
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel.');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center">
          <Calendar className="mr-3 text-slate-500 h-6 w-6" /> My Appointments
        </h1>
        <button
          onClick={openModal}
          className="flex items-center px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-medium transition-colors shadow-sm text-sm"
        >
          <Plus className="w-4 h-4 mr-2" /> Book Appointment
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 px-5 py-4 rounded-xl text-sm font-medium flex items-center">
          <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" /> {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 overflow-hidden">
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-100 rounded w-1/4"></div>
            <div className="h-10 bg-gray-50 rounded w-full"></div>
          </div>
        ) : !error && appointments.length === 0 ? (
          <div className="py-12 text-center text-textSoft font-medium">No appointments yet. Click "Book Appointment" to get started.</div>
        ) : !error && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400 font-bold">
                  <th className="pb-4 px-3">Doctor</th>
                  <th className="pb-4 px-3">Date & Time</th>
                  <th className="pb-4 px-3">Status</th>
                  <th className="pb-4 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt) => (
                  <tr key={apt.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-3 font-semibold text-slate-900 flex items-center text-sm">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center mr-3 text-xs font-bold border border-slate-200">
                        {apt.doctor_name?.charAt(0) || 'D'}
                      </div>
                      Dr. {apt.doctor_name}
                    </td>
                    <td className="py-4 px-3 text-sm text-slate-500 font-medium">
                      {new Date(apt.date_time).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </td>
                    <td className="py-4 px-3">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${apt.status === 'confirmed' ? 'bg-sky-50 text-sky-700 border-sky-100' : apt.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : apt.status === 'cancelled' ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="py-4 px-3 text-right">
                      {apt.status === 'pending' || apt.status === 'confirmed' ? (
                        <button
                          onClick={() => cancelAppointment(apt.id)}
                          className="text-xs font-semibold text-slate-500 hover:text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                        >
                          Cancel
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-slate-900 mb-6">Book New Appointment</h2>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm font-medium border border-red-100 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" /> {formError}
              </div>
            )}
            {formSuccess && (
              <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-xl text-sm font-medium border border-green-100 flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2 flex-shrink-0" /> {formSuccess}
              </div>
            )}

            <form onSubmit={handleBook} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">Select Doctor</label>
                <select
                  value={formData.doctor_id}
                  onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-800 transition-colors appearance-none cursor-pointer"
                >
                  <option value="">— Choose a doctor —</option>
                  {doctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      Dr. {doc.name} — {doc.specialization || 'General'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">Date & Time</label>
                <input
                  type="datetime-local"
                  value={formData.date_time}
                  onChange={(e) => setFormData({ ...formData, date_time: e.target.value })}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-800 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">Reason <span className="text-slate-400 font-normal">(optional)</span></label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-800 transition-colors resize-none h-24"
                  placeholder="Describe your symptoms or reason for visit..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium py-3 rounded-xl transition-colors shadow-sm flex justify-center items-center disabled:opacity-60"
              >
                {submitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white"></div>
                ) : (
                  'Confirm Booking'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
