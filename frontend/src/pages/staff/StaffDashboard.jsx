import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { Calendar, Receipt, Clock, CheckCircle2, ArrowRight, LayoutDashboard, IndianRupee } from 'lucide-react';

const StaffDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resApt, resBill] = await Promise.all([
          api.get('/appointments'),
          api.get('/billing')
        ]);
        setAppointments(resApt.data.data.appointments || []);
        setBills(resBill.data.data.bills || []);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = {
    totalApt: appointments.length,
    pendingApt: appointments.filter(a => a.status === 'pending').length,
    completedApt: appointments.filter(a => a.status === 'completed').length,
    unpaidBills: bills.filter(b => b.payment_status === 'unpaid').length,
    paidBills: bills.filter(b => b.payment_status === 'paid').length,
    revenue: bills.filter(b => b.payment_status === 'paid').reduce((sum, b) => sum + Number(b.total_amount), 0),
  };

  const recentAppointments = appointments.slice(0, 4);

  return (
    <div className="space-y-6 max-w-6xl w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center">
          <LayoutDashboard className="mr-3 text-slate-500 h-6 w-6" /> Staff Control Panel
        </h1>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-900 mb-2">Welcome, {user.name}</h2>
        <p className="text-slate-500 max-w-2xl">
          Overview of enterprise appointments and hospital billing management. Use the navigation to deeply inspect records or bills.
        </p>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             {Array(4).fill(null).map((_, i) => <div key={i} className="h-28 bg-slate-100 rounded-2xl"></div>)}
          </div>
          <div className="h-64 bg-slate-50 rounded-2xl w-full"></div>
        </div>
      ) : (
        <>
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Appointments Block */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                 <div>
                   <p className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">Queue</p>
                   <p className="text-2xl font-extrabold text-slate-900">{stats.totalApt}</p>
                 </div>
                 <div className="p-3 bg-slate-50 text-slate-600 rounded-xl border border-slate-100">
                   <Calendar className="w-6 h-6" />
                 </div>
              </div>
              <p className="text-sm font-medium text-slate-500 mt-4">
                <span className="text-amber-600 font-bold">{stats.pendingApt}</span> pending
              </p>
            </div>

            {/* Completed Workload */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                 <div>
                   <p className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">Completed</p>
                   <p className="text-2xl font-extrabold text-slate-900">{stats.completedApt}</p>
                 </div>
                 <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                   <CheckCircle2 className="w-6 h-6" />
                 </div>
              </div>
              <p className="text-sm font-medium text-slate-500 mt-4 flex items-center">
                 Appointments finished
              </p>
            </div>

            {/* Unpaid Bills */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                 <div>
                   <p className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">Unpaid Bills</p>
                   <p className="text-2xl font-extrabold text-slate-900">{stats.unpaidBills}</p>
                 </div>
                 <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
                   <Clock className="w-6 h-6" />
                 </div>
              </div>
              <p className="text-sm font-medium text-slate-500 mt-4">
                Follow up required
              </p>
            </div>

            {/* Revenue */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                 <div>
                   <p className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">Cleared Revenue</p>
                   <p className="text-2xl font-extrabold text-slate-900 flex items-center">
                     <IndianRupee className="w-5 h-5 mr-0.5 text-slate-400 font-bold" />
                     {stats.revenue.toLocaleString()}
                   </p>
                 </div>
                 <div className="p-3 bg-slate-800 text-white rounded-xl shadow-inner">
                   <Receipt className="w-6 h-6" />
                 </div>
              </div>
              <p className="text-sm font-medium text-slate-500 mt-4">
                <span className="text-emerald-600 font-bold">{stats.paidBills}</span> bills processed
              </p>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Appointments */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Recent Appointments</h3>
                <button 
                  onClick={() => navigate('/staff/appointments')}
                  className="text-sm font-semibold text-sky-600 hover:text-sky-700 flex items-center transition-colors"
                >
                  Manage <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
              <div className="flex-1 p-6">
                {recentAppointments.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center mt-6">No appointments natively found.</p>
                ) : (
                  <div className="space-y-4">
                    {recentAppointments.map(apt => (
                      <div key={apt.id} className="flex justify-between items-center p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{apt.patient_name}</p>
                          <p className="text-xs font-semibold text-slate-500 mt-0.5">Dr. {apt.doctor_name}</p>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${apt.status === 'confirmed' ? 'bg-sky-50 text-sky-700 border-sky-100' : apt.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : apt.status === 'cancelled' ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                            {apt.status}
                          </span>
                          <span className="text-xs text-slate-400 mt-1.5 font-medium">
                            {new Date(apt.date_time).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col">
               <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">System Management</h3>
               </div>
               <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div 
                    onClick={() => navigate('/staff/appointments')}
                    className="p-5 border border-slate-200 rounded-xl hover:border-slate-800 transition-colors cursor-pointer group"
                  >
                    <div className="w-10 h-10 bg-slate-100 text-slate-700 rounded-lg flex items-center justify-center mb-3 group-hover:bg-slate-800 group-hover:text-white transition-colors">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">Appointments</h4>
                    <p className="text-xs text-slate-500 font-medium">Create or modify global queues</p>
                  </div>

                  <div 
                    onClick={() => navigate('/staff/billing')}
                    className="p-5 border border-slate-200 rounded-xl hover:border-slate-800 transition-colors cursor-pointer group"
                  >
                    <div className="w-10 h-10 bg-slate-100 text-slate-700 rounded-lg flex items-center justify-center mb-3 group-hover:bg-slate-800 group-hover:text-white transition-colors">
                      <Receipt className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">Invoices & Billing</h4>
                    <p className="text-xs text-slate-500 font-medium">Process payments and tracking</p>
                  </div>
               </div>
            </div>
          </div>

        </>
      )}
    </div>
  );
};

export default StaffDashboard;
