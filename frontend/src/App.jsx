import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Layout from './components/Layout';

// Core Authentication
import Login from './pages/Login';
import Register from './pages/Register';

import PatientDashboard from './pages/patient/PatientDashboard';
import SymptomChecker from './pages/patient/SymptomChecker';
import Appointments from './pages/patient/Appointments';
import Records from './pages/patient/Records';
import Billing from './pages/patient/Billing';
import Payment from './pages/patient/Payment';

import DoctorAppointments from './pages/doctor/Appointments';
import DoctorRecords from './pages/doctor/Records';

import StaffAppointments from './pages/staff/Appointments';
import StaffRecords from './pages/staff/Records';
import StaffBilling from './pages/staff/Billing';

import DoctorDashboard from './pages/doctor/DoctorDashboard';
import StaffDashboard from './pages/staff/StaffDashboard';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/payment/:id" element={<Payment />} />

          {/* Patient Routes Array */}
          <Route element={<ProtectedRoute allowedRoles={['patient']} />}>
            <Route element={<Layout />}>
              <Route path="/patient/dashboard" element={<PatientDashboard />} />
              <Route path="/patient/appointments" element={<Appointments />} />
              <Route path="/patient/records" element={<Records />} />
              <Route path="/patient/billing" element={<Billing />} />
              <Route path="/patient/symptom-checker" element={<SymptomChecker />} />
            </Route>
          </Route>

          {/* Doctor Routes Array */}
          <Route element={<ProtectedRoute allowedRoles={['doctor']} />}>
            <Route element={<Layout />}>
              <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
              <Route path="/doctor/appointments" element={<DoctorAppointments />} />
              <Route path="/doctor/records" element={<DoctorRecords />} />
            </Route>
          </Route>

          {/* Administrative Array */}
          <Route element={<ProtectedRoute allowedRoles={['staff', 'admin']} />}>
            <Route element={<Layout />}>
              <Route path="/staff/dashboard" element={<StaffDashboard />} />
              <Route path="/staff/appointments" element={<StaffAppointments />} />
              <Route path="/staff/records" element={<StaffRecords />} />
              <Route path="/staff/billing" element={<StaffBilling />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
