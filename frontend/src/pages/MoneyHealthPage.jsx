import React, { useState, useEffect } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { analysisAPI, getAuthToken } from '../services/api';
import { profiles as mockProfiles } from '../data/mockProfiles';
import MoneyHealthAgent from '../components/agents/MoneyHealthAgent';

const MoneyHealthPage = () => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState(null);

  const steps = [
    "Connecting to AI Money Mentor agents...",
    "Scanning your database for real-time transactions...",
    "Running Llama 3 analysis for health insights...",
    "Calculating emergency fund and savings rates...",
    "Finalizing personalized action plan..."
  ];

  const loadAnalysis = async () => {
    setIsLoading(true);
    setLoadingStep(0);
    setError(null);
    try {
      if (getAuthToken()) {
        const result = await analysisAPI.runFull();
        setProfile(result);
      } else {
        setProfile(mockProfiles[0]);
      }
    } catch (err) {
      console.warn('API unavailable, using mock data:', err.message);
      setProfile(mockProfiles[0]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalysis();
  }, []);

  // Animation effect for loading steps
  useEffect(() => {
    if (isLoading && loadingStep < steps.length - 1) {
      const timer = setTimeout(() => {
        setLoadingStep(prev => prev + 1);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, loadingStep]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <Loader2 className="animate-spin text-[#013366]" size={40} />
        <div className="text-center">
            <p className="text-lg font-medium text-gray-700 animate-pulse">
                {steps[loadingStep]}
            </p>
            <p className="text-sm text-gray-500 mt-1">Please wait while the AI analyzes your data</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="p-6 max-w-5xl mx-auto w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-serif font-bold text-gray-900">Money Health Breakdown</h1>
        <button onClick={loadAnalysis} className="p-2 bg-white rounded-lg border border-gray-200 hover:border-[#013366] transition">
          <RefreshCw size={18} className="text-[#013366]" />
        </button>
      </div>

      <MoneyHealthAgent 
        data={profile.moneyHealth} 
        score={profile.overallScore} 
        verdict={profile.scoreVerdict} 
      />
    </div>
  );
};

export default MoneyHealthPage;
