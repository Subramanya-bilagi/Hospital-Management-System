import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Calendar, FileText, Receipt, Activity, LogOut, Stethoscope, Menu, X } from 'lucide-react';

// Central Navigation Context Mapping
const sidebarConfig = {
  patient: [
    { name: 'Dashboard', path: '/patient/dashboard', icon: LayoutDashboard },
    { name: 'Appointments', path: '/patient/appointments', icon: Calendar },
    { name: 'Medical Records', path: '/patient/records', icon: FileText },
    { name: 'Billing', path: '/patient/billing', icon: Receipt },
    { name: 'Symptom Checker', path: '/patient/symptom-checker', icon: Activity },
  ],
  doctor: [
    { name: 'Dashboard', path: '/doctor/dashboard', icon: LayoutDashboard },
    { name: 'Appointments', path: '/doctor/appointments', icon: Calendar },
    { name: 'Patient Records', path: '/doctor/records', icon: FileText },
  ],
  staff: [
    { name: 'Dashboard', path: '/staff/dashboard', icon: LayoutDashboard },
    { name: 'All Appointments', path: '/staff/appointments', icon: Calendar },
    { name: 'Medical Records', path: '/staff/records', icon: FileText },
    { name: 'System Billing', path: '/staff/billing', icon: Receipt },
  ]
};

const Layout = () => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Guard natively just in case rendering leaks
  if (!user) return null;

  const navItems = sidebarConfig[user.role] || [];

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* Mobile Drawer Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Collapsible Mobile Drawer & Fixed Desktop Left Module */}
      <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out w-[280px] bg-white border-r border-slate-200 flex flex-col z-40`}>
        
        {/* Branding Title Block */}
        <div className="h-20 flex items-center px-6 md:px-8 border-b border-slate-100 flex-shrink-0">
          <div className="bg-slate-100 p-2 rounded-lg mr-3 border border-slate-200">
             <Stethoscope className="text-slate-800 h-5 w-5" />
          </div>
          <span className="text-xl font-bold text-slate-800 tracking-tight">MedFlow</span>
        </div>
        
        {/* Navigation Core */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-4 ml-3">Menu</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2.5 rounded-lg font-medium transition-colors duration-150 ${
                    isActive
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon className={`mr-3 h-4 w-4 ${({isActive}) => isActive ? 'text-white' : 'text-slate-400'}`} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Identity Block */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-2.5 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors font-medium text-sm"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Rendering Engine Structure */}
      <div className="flex-1 flex flex-col overflow-hidden relative min-w-0">
        {/* Central Ribbon Top-Bar */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between md:justify-end px-6 md:px-10 sticky top-0 z-10 w-full flex-shrink-0">

          <button 
            className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors focus:ring-2 focus:ring-slate-200"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center space-x-3 bg-white p-1 pr-4 rounded-full border border-slate-200 shadow-sm ml-auto md:ml-0">
            <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col items-start leading-tight">
              <span className="text-sm font-semibold text-slate-800 truncate max-w-[100px] sm:max-w-xs">{user.name}</span>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest truncate">{user.role}</span>
            </div>
          </div>
        </header>

        {/* Dynamic Nested Routing Body */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-4 sm:p-6 md:p-8 w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
