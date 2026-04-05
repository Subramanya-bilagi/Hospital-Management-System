import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { Calendar, UserCheck, Clock, CheckCircle2, ArrowRight, LayoutDashboard } from 'lucide-react';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/appointments/mine');
        setAppointments(res.data.data.appointments || []);
      } catch (err) {
        console.error('Failed to load appointments', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
  };

  const upcomingApts = appointments
    .filter(a => ['pending', 'confirmed'].includes(a.status))
    // we assume appointments are sorted descending by default, let's reverse to show soonest first if we want, or just slice
    .slice(0, 5);

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center">
          <LayoutDashboard className="mr-3 text-slate-500 h-6 w-6" /> Doctor Dashboard
        </h1>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-900 mb-2">Welcome, Dr. {user.name}</h2>
        <p className="text-slate-500">Here is an overview of your schedule and patient workload.</p>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-slate-100 rounded-2xl w-full"></div>
          <div className="h-64 bg-slate-50 rounded-2xl w-full"></div>
        </div>
      ) : (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-4">
              <div className="p-3 bg-slate-50 text-slate-600 rounded-xl border border-slate-100">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Total Appointments</p>
                <p className="text-2xl font-extrabold text-slate-900">{stats.total}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Pending</p>
                <p className="text-2xl font-extrabold text-slate-900">{stats.pending}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-4">
              <div className="p-3 bg-sky-50 text-sky-600 rounded-xl border border-sky-100">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Confirmed</p>
                <p className="text-2xl font-extrabold text-slate-900">{stats.confirmed}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Completed</p>
                <p className="text-2xl font-extrabold text-slate-900">{stats.completed}</p>
              </div>
            </div>
          </div>

          {/* Recent Appointments */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Upcoming / Recent Appointments</h3>
              <button 
                onClick={() => navigate('/doctor/appointments')}
                className="text-sm font-semibold text-slate-600 hover:text-slate-900 flex items-center transition-colors"
              >
                View all <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
            
            {upcomingApts.length === 0 ? (
              <div className="p-8 text-center text-slate-500 font-medium tracking-wide">
                No active upcoming appointments.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 text-xs uppercase tracking-wider text-slate-400 font-bold border-b border-slate-100">
                      <th className="py-3 px-6">Patient</th>
                      <th className="py-3 px-6">Date & Time</th>
                      <th className="py-3 px-6">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingApts.map(apt => (
                      <tr key={apt.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors last:border-0">
                        <td className="py-4 px-6 font-semibold text-slate-900 text-sm">
                          {apt.patient_name}
                        </td>
                        <td className="py-4 px-6 text-sm text-slate-500 font-medium">
                          {new Date(apt.date_time).toLocaleString('en-US', { 
                            weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' 
                          })}
                        </td>
                        <td className="py-4 px-6">
                           <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${apt.status === 'confirmed' ? 'bg-sky-50 text-sky-700 border-sky-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                             {apt.status}
                           </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DoctorDashboard;
