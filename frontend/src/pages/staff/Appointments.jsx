import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Calendar, Plus, X, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';

const StaffAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  // Create modal state
  const [showModal, setShowModal] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [formData, setFormData] = useState({ patient_id: '', doctor_id: '', date_time: '', reason: '' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments');
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
      console.error('Failed to load doctors', err);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await api.get('/patients');
      setPatients(res.data.data.patients || []);
    } catch (err) {
      console.error('Failed to load patients', err);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const openModal = () => {
    setFormData({ patient_id: '', doctor_id: '', date_time: '', reason: '' });
    setFormError('');
    fetchDoctors();
    fetchPatients();
    setShowModal(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.patient_id) return setFormError('Patient profile ID is required.');
    if (!formData.doctor_id) return setFormError('Please select a doctor.');
    if (!formData.date_time) return setFormError('Please select a date and time.');

    setSubmitting(true);
    try {
      await api.post('/appointments', formData);
      setToast('Appointment created successfully.');
      setTimeout(() => setToast(''), 3000);
      setShowModal(false);
      setLoading(true);
      fetchAppointments();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create appointment.');
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/appointments/${id}`, { status });
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      setToast(`Status updated to "${status}".`);
      setTimeout(() => setToast(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update.');
    }
  };

  const deleteAppointment = async (id) => {
    if (!confirm('Permanently delete this appointment?')) return;
    try {
      await api.delete(`/appointments/${id}`);
      setAppointments(prev => prev.filter(a => a.id !== id));
      setToast('Appointment deleted.');
      setTimeout(() => setToast(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete.');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center">
          <Calendar className="mr-3 text-slate-500 h-6 w-6" /> All Appointments
        </h1>
        <button onClick={openModal} className="flex items-center px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-medium transition-colors shadow-sm text-sm">
          <Plus className="w-4 h-4 mr-2" /> Create Appointment
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 px-5 py-4 rounded-xl text-sm font-medium flex items-center">
          <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" /> {error}
        </div>
      )}
      {toast && (
        <div className="bg-green-50 border border-green-100 text-green-700 px-5 py-4 rounded-xl text-sm font-medium flex items-center">
          <CheckCircle2 className="w-4 h-4 mr-2 flex-shrink-0" /> {toast}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 overflow-hidden">
        {loading ? (
          <div className="animate-pulse space-y-4"><div className="h-4 bg-slate-100 rounded w-1/4"></div></div>
        ) : !error && appointments.length === 0 ? (
          <div className="py-12 text-center text-slate-500 font-medium">No appointments in the system.</div>
        ) : !error && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400 font-bold">
                  <th className="pb-4 px-3">Patient</th>
                  <th className="pb-4 px-3">Doctor</th>
                  <th className="pb-4 px-3">Date & Time</th>
                  <th className="pb-4 px-3">Status</th>
                  <th className="pb-4 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt) => (
                  <tr key={apt.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-3 font-semibold text-slate-900 text-sm">{apt.patient_name}</td>
                    <td className="py-4 px-3 text-sm font-medium text-slate-700">Dr. {apt.doctor_name}</td>
                    <td className="py-4 px-3 text-sm text-slate-500">{new Date(apt.date_time).toLocaleString()}</td>
                    <td className="py-4 px-3">
                      <select
                        value={apt.status}
                        onChange={(e) => updateStatus(apt.id, e.target.value)}
                        className={`text-xs font-bold uppercase tracking-wider border rounded-lg px-2.5 py-1.5 outline-none appearance-none cursor-pointer ${apt.status === 'confirmed' ? 'bg-sky-50 text-sky-700 border-sky-200' : apt.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : apt.status === 'cancelled' ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-4 px-3 text-right">
                      <button
                        onClick={() => deleteAppointment(apt.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                        title="Delete appointment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Appointment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-slate-900 mb-6">Create Appointment</h2>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm font-medium border border-red-100 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" /> {formError}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">Select Patient</label>
                <select
                  value={formData.patient_id}
                  onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-800 transition-colors font-medium appearance-none cursor-pointer"
                >
                  <option value="">— Choose a patient —</option>
                  {patients.map((pat) => (
                    <option key={pat.profile_id} value={pat.profile_id}>{pat.name} ({pat.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">Select Doctor</label>
                <select
                  value={formData.doctor_id}
                  onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-800 transition-colors font-medium appearance-none cursor-pointer"
                >
                  <option value="">— Choose a doctor —</option>
                  {doctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>Dr. {doc.name} — {doc.specialization || 'General'}</option>
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
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-800 transition-colors font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">Reason</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-800 transition-colors font-medium resize-none h-24"
                  placeholder="Reason for appointment..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium py-3 rounded-xl transition-colors shadow-sm flex justify-center items-center disabled:opacity-60"
              >
                {submitting ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white"></div> : 'Create Appointment'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffAppointments;
