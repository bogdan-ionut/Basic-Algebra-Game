import React, { useState } from 'react';
import { X, Lock, TrendingUp, Clock, AlertTriangle, Target } from 'lucide-react';
import { DailyStats, UserProfile } from '../lib/db';

interface ParentDashboardProps {
  onClose: () => void;
  dailyStats: DailyStats;
  userProfile: UserProfile;
}

export function ParentDashboard({ onClose, dailyStats, userProfile }: ParentDashboardProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pin, setPin] = useState('');

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPin(val);
    if (val === '2024') { // Simple PIN for now
      setIsUnlocked(true);
    }
  };

  if (!isUnlocked) {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 bg-sky-100 text-sky-500 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Acces Părinți</h2>
            <p className="text-slate-500 text-sm">Introduceți codul PIN (2024) pentru a vedea progresul lui Osea.</p>
            <input
              type="password"
              value={pin}
              onChange={handlePinChange}
              className="w-full text-center text-2xl tracking-widest p-4 rounded-xl border-2 border-slate-200 focus:border-sky-500 focus:outline-none transition-colors"
              placeholder="****"
              maxLength={4}
            />
          </div>
        </div>
      </div>
    );
  }

  const accuracy = dailyStats.totalAttempts > 0
    ? Math.round((dailyStats.correctAnswers / dailyStats.totalAttempts) * 100)
    : 0;

  const waste = dailyStats.totalAttempts > 0
    ? Math.round((dailyStats.fastGuesses / dailyStats.totalAttempts) * 100)
    : 0;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X className="w-6 h-6" />
        </button>
        
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Target className="text-sky-500" />
          Alpha Insights
        </h2>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-sky-50 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-sky-600 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-semibold">Timp Astăzi</span>
            </div>
            <span className="text-2xl font-bold text-slate-800">
              {Math.floor(dailyStats.timeSpentSeconds / 60)}m {dailyStats.timeSpentSeconds % 60}s
            </span>
          </div>

          <div className="bg-green-50 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-semibold">Acuratețe</span>
            </div>
            <span className="text-2xl font-bold text-slate-800">{accuracy}%</span>
          </div>

          <div className="bg-orange-50 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-orange-600 mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-semibold">Waste Meter</span>
            </div>
            <span className="text-2xl font-bold text-slate-800">{waste}%</span>
            <p className="text-xs text-slate-500 mt-1">Răspunsuri la ghici</p>
          </div>

          <div className="bg-purple-50 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-purple-600 mb-1">
              <Target className="w-4 h-4" />
              <span className="text-sm font-semibold">Scor Total</span>
            </div>
            <span className="text-2xl font-bold text-slate-800">{userProfile.score}</span>
            <p className="text-xs text-slate-500 mt-1">Zile la rând: {userProfile.streak}</p>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl">
          <h3 className="font-semibold text-slate-700 mb-2">Analiză Alpha:</h3>
          <ul className="text-sm text-slate-600 space-y-2">
            {accuracy < 70 && accuracy > 0 && <li>⚠️ Acuratețea este sub 70%. Nivelul ar putea fi prea greu.</li>}
            {accuracy >= 70 && accuracy <= 95 && <li>👍 Acuratețe optimă (70-95%). Nivelul de dificultate este perfect.</li>}
            {accuracy > 95 && <li>🌟 Acuratețe excelentă! Osea este pregătit pentru provocări noi.</li>}
            {waste > 20 && <li>⚠️ Waste Meter ridicat. Osea se grăbește și apasă la întâmplare.</li>}
            {dailyStats.timeSpentSeconds < 600 && <li>⏳ Încă nu a atins obiectivul zilnic de 10 minute.</li>}
            {dailyStats.timeSpentSeconds >= 600 && <li>✅ Obiectivul zilnic de 10 minute a fost atins!</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
