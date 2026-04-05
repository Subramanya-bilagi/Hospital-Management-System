import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Activity, Calendar, FileText, Plus } from 'lucide-react';

const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
        <button
          onClick={() => navigate('/patient/appointments')}
          className="flex items-center px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-medium transition-colors shadow-sm text-sm"
        >
          <Plus className="w-4 h-4 mr-2" /> Book Appointment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          onClick={() => navigate('/patient/appointments')}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-start space-x-4 cursor-pointer hover:border-slate-300 transition-colors"
        >
          <div className="p-3 bg-slate-50 text-slate-700 rounded-xl border border-slate-100">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-slate-800 text-sm font-semibold">Appointments</p>
            <p className="text-sm text-slate-500 mt-1">View & book</p>
          </div>
        </div>

        <div
          onClick={() => navigate('/patient/records')}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-start space-x-4 cursor-pointer hover:border-slate-300 transition-colors"
        >
          <div className="p-3 bg-slate-50 text-slate-700 rounded-xl border border-slate-100">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-slate-800 text-sm font-semibold">Medical Records</p>
            <p className="text-sm text-slate-500 mt-1">View history</p>
          </div>
        </div>

        <div
          onClick={() => navigate('/patient/symptom-checker')}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-start space-x-4 cursor-pointer hover:border-slate-300 transition-colors"
        >
          <div className="p-3 bg-slate-50 text-slate-700 rounded-xl border border-slate-100">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <p className="text-slate-800 text-sm font-semibold">Symptom Checker</p>
            <p className="text-sm text-slate-500 mt-1">AI-powered</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-900 mb-3">Welcome back, {user.name}</h2>
        <p className="text-slate-500 leading-relaxed max-w-3xl">
          Use the sidebar or the cards above to navigate. You can book appointments with doctors, view your medical records, check your bills, or run a quick symptom analysis using our local AI engine.
        </p>
      </div>
    </div>
  );
};

export default PatientDashboard;
