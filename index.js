"use client";

import React, { useState } from 'react';

export default function TuwaiqCarbonPlatform() {
  const [carbonCredits, setCarbonCredits] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // دالة لمحاكاة إصدار صكوك الكربون (للعرض التجريبي MVP)
  const handleIssueCredit = () => {
    setIsLoading(true);
    
    // محاكاة الاتصال بقاعدة البيانات (Supabase لاحقاً)
    setTimeout(() => {
      const newCredit = {
        id: Date.now(),
        amount: 50, // 50 طن
        project: 'مبادرة التشجير - الرياض',
        date: new Date().toLocaleDateString('ar-SA'),
        status: 'مُصدر بنجاح'
      };
      
      setCarbonCredits([newCredit, ...carbonCredits]);
      setIsLoading(false);
    }, 1500); // تأخير ثانية ونصف لمحاكاة التحميل
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans" dir="rtl">
      {/* الشريط العلوي */}
      <header className="bg-green-700 text-white p-6 shadow-md">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">منصة طويق للكربون</h1>
            <p className="mt-1 opacity-90 text-sm">النسخة التجريبية (Live Demo)</p>
          </div>
          <div className="bg-green-800 px-4 py-2 rounded-lg text-sm font-semibold">
            إجمالي الرصيد: {carbonCredits.reduce((sum, item) => sum + item.amount, 0)} طن
          </div>
        </div>
      </header>

      {/* المحتوى الرئيسي */}
      <main className="max-w-5xl mx-auto p-6 mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* لوحة التحكم والإصدار */}
        <div className="col-span-1 bg-white rounded-xl shadow-sm p-6 border border-gray-100 h-fit">
          <h2 className="text-xl font-bold mb-4 text-gray-800">إدارة الصكوك</h2>
          <p className="text-gray-600 text-sm mb-6">
            قم بإصدار صكوك كربون جديدة وتوثيقها في السجل الوطني بشكل فوري.
          </p>
          
          <button
            onClick={handleIssueCredit}
            disabled={isLoading}
            className={`w-full font-bold py-3 px-4 rounded-lg transition-all flex justify-center items-center ${
              isLoading 
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg'
            }`}
          >
            {isLoading ? (
              <span className="animate-pulse">جاري الإصدار...</span>
            ) : (
              <span>إصدار 50 طن كربون</span>
            )}
          </button>
        </div>

        {/* سجل العمليات */}
        <div className="col-span-1 md:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-xl font-bold mb-6 text-gray-800 border-b pb-3">سجل الإصدارات الحديثة</h3>
          
          {carbonCredits.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <p>لم يتم إصدار أي صكوك حتى الآن.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {carbonCredits.map((credit) => (
                <div key={credit.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-green-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="bg-green-100 text-green-700 p-3 rounded-full font-bold">
                      {credit.amount}T
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{credit.project}</p>
                      <p className="text-xs text-gray-500">{credit.date}</p>
                    </div>
                  </div>
                  <span className="bg-green-100 text-green-800 text-xs px-3 py-1.5 rounded-full font-medium">
                    {credit.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
