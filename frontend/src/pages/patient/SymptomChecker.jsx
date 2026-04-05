import React, { useState } from 'react';
import api from '../../api/axios';
import { BrainCircuit, AlertTriangle } from 'lucide-react';

const SymptomChecker = () => {
  const [symptoms, setSymptoms] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDiagnose = async () => {
    if (!symptoms.trim()) {
      setError('Please properly detail your symptoms fundamentally.');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);

    try {
      const res = await api.post('/ai/symptom-checker', { symptoms });
      setResult(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Inference engine disconnected or overloaded natively.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Offline AI Symptom Engine</h1>
        <div className="flex items-center px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-md border border-slate-200">
           <BrainCircuit className="w-3 h-3 mr-1.5" /> Llama 3 Inference
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <label className="block text-sm font-semibold text-slate-900 mb-3">Describe your symptoms in detail</label>
        <textarea
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-800 transition-colors resize-none h-32"
          placeholder="E.g., I have been experiencing a severe headache, slight nausea, and blurred vision for the past 4 hours..."
        />
        
        {error && (
          <p className="text-red-500 text-sm mt-3 font-medium bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>
        )}

        <button
          onClick={handleDiagnose}
          disabled={loading}
          className="mt-5 bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-sm flex items-center justify-center w-full md:w-auto"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white mr-2"></div>
          ) : (
            <BrainCircuit className="w-5 h-5 mr-2 opacity-80" />
          )}
          {loading ? 'Processing Neural Weights...' : 'Analyze Symptoms'}
        </button>
      </div>

      {result && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="bg-amber-50 p-4 border-b border-amber-100 flex items-start">
            <AlertTriangle className="text-amber-600 h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
            <p className="text-amber-800 text-sm font-medium leading-relaxed">{result.disclaimer}</p>
          </div>

          <div className="p-8 space-y-6">
            <div>
              <h3 className="text-sm font-bold tracking-wider uppercase text-slate-400 mb-3">Possible Findings</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.conditions?.map((c, i) => (
                  <li key={i} className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-lg text-slate-900 font-medium text-sm flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-3"></div>
                    {c}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold tracking-wider uppercase text-slate-400 mb-2">Automated Recommendation</h3>
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl">
                 <p className="text-slate-900 leading-relaxed">{result.recommendation}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SymptomChecker;
