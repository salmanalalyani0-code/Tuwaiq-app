import React, { useState, useEffect, useRef } from 'react';

// ==========================================
// 1. الاتصال السحابي (Supabase)
// ==========================================
const supabaseUrl = 'https://ctnehbvjlmwrlapvnyhj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0bmVoYnZqbG13cmxhcHZueWhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MzE5MjgsImV4cCI6MjA5NTQwNzkyOH0.woFaPKyfmICGf4iKB7SnANpZFqbe1Y6ZQYsZcy4tftc';

// ==========================================
// 2. CSS المتقدم وتنسيقات المنصة السيادية
// ==========================================
const injectGlobalStyles = () => {
  if (document.getElementById('tuwayq-global-styles')) return;
  const styleEl = document.createElement('style');
  styleEl.id = 'tuwayq-global-styles';
  styleEl.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap');
    * { box-sizing: border-box; scroll-behavior: smooth; }
    body { background-color: #020617; margin: 0; font-family: 'IBM Plex Sans Arabic', sans-serif; color: #f1f5f9; overflow-x: hidden; }
    
    @keyframes slideIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulseGlow { 0%, 100% { box-shadow: 0 0 10px rgba(16, 185, 129, 0.2); } 50% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.6); } }
    @keyframes chatPop { from { opacity: 0; transform: scale(0.9) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
    
    .enterprise-card { animation: slideIn 0.4s ease both; background: rgba(15, 23, 42, 0.6); border: 1px solid #1e293b; border-radius: 16px; backdrop-filter: blur(12px); padding: 24px; transition: transform 0.3s, border-color 0.3s; }
    .enterprise-card:hover { border-color: #3b82f6; }
    
    .status-dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-left: 8px; }
    .dot-green { background: #10b981; box-shadow: 0 0 8px #10b981; }
    .dot-yellow { background: #f59e0b; box-shadow: 0 0 8px #f59e0b; }
    .dot-red { background: #ef4444; box-shadow: 0 0 8px #ef4444; }

    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: #020617; }
    ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
    ::-webkit-scrollbar-thumb:hover { background: #334155; }
  `;
  document.head.appendChild(styleEl);
};

// ==========================================
// 3. قاعدة البيانات الوهمية
// ==========================================
const companiesData: any = {
  "أرامكو السعودية": {
    ghg: 1450.5, saudization: 75, water: 85, rating: 'A+',
    sectors: [
      { name: 'قطاع التنقيب والإنتاج (الظهران)', type: 'استخراج', status: 'green', score: 'A+', ghgShare: '40%' },
      { name: 'مصفاة رأس تنورة (تكرير)', type: 'صناعي', status: 'yellow', score: 'B', ghgShare: '35%' },
      { name: 'مجمع الجبيل للبتروكيماويات', type: 'كيميائي', status: 'green', score: 'A', ghgShare: '25%' }
    ]
  },
  "سابك": {
    ghg: 2100.0, saudization: 72, water: 78, rating: 'A',
    sectors: [
      { name: 'مصانع البوليمرات (الجبيل)', type: 'تصنيع', status: 'green', score: 'A', ghgShare: '45%' },
      { name: 'مجمع المغذيات الزراعية (الدمام)', type: 'أسمدة', status: 'green', score: 'A+', ghgShare: '30%' },
      { name: 'مصنع الحديد والصلب (ينبع)', type: 'تعدين', status: 'red', score: 'C', ghgShare: '25%' }
    ]
  },
  "معادن": {
    ghg: 3200.8, saudization: 58, water: 60, rating: 'B',
    sectors: [
      { name: 'مجمع الفوسفات (وعد الشمال)', type: 'تعدين', status: 'yellow', score: 'B', ghgShare: '50%' },
      { name: 'مصهر الألمنيوم (رأس الخير)', type: 'صهر', status: 'red', score: 'C', ghgShare: '40%' },
      { name: 'منجم مهد الذهب', type: 'استخراج', status: 'green', score: 'A', ghgShare: '10%' }
    ]
  }
};

const marketLeaderboard = [
  { name: 'أرامكو السعودية', score: 'A+', trend: '📈', points: 94 },
  { name: 'سابك', score: 'A', trend: '📈', points: 88 },
  { name: 'مجموعة stc', score: 'A', trend: '➡️', points: 85 },
  { name: 'مصرف الراجحي', score: 'B+', trend: '📈', points: 79 },
  { name: 'معادن', score: 'B', trend: '📉', points: 72 },
];

// ==========================================
// 4. لوحة التحكم
// ==========================================
export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCompany, setSelectedCompany] = useState("أرامكو السعودية");
  
  // Chatbot State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([{ sender: 'ai', text: 'مرحباً أيها القيادي! أنا مساعد طويق الذكي. كيف يمكنني مساعدتك في تحسين تصنيف الـ ESG لمنشأتك اليوم؟' }]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { injectGlobalStyles(); }, []);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  const activeData = companiesData[selectedCompany];
  // توليد كود البلوكشين العشوائي للتقارير
  const blockchainHash = `0x${Math.random().toString(16).substr(2, 8).toUpperCase()}...${Math.random().toString(16).substr(2, 4).toUpperCase()}`;

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, { sender: 'user', text: chatInput }]);
    const userInput = chatInput;
    setChatInput('');

    setTimeout(() => {
      let aiResponse = "أقوم بتحليل البيانات حالياً... يرجى مراجعة التقارير الدورية.";
      if (userInput.includes('سعودة') || userInput.includes('توظيف')) aiResponse = `نسبة السعودة في ${selectedCompany} هي ${activeData.saudization}%. لرفعها، نوصي ببرنامج "تمكين" لتدريب الخريجين.`;
      else if (userInput.includes('انبعاث') || userInput.includes('كربون')) aiResponse = `أكبر مصدر للانبعاثات لديكم هو قطاع (${activeData.sectors[0].name}). نوصي بتركيب فلاتر (CCUS).`;
      setChatMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);
    }, 1200);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }} dir="rtl">
      
      {/* القائمة الجانبية */}
      <aside style={{ width: '280px', background: '#0a1628', borderLeft: '1px solid #1e293b', padding: '25px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ margin: '0 0 5px', fontSize: '20px', color: '#10b981' }}>طويق السيادية 🇸🇦</h2>
        <p style={{ color: '#64748b', fontSize: '12px', margin: '0 0 20px' }}>الإدارة الاستراتيجية للشركات</p>
        
        <div style={{ marginBottom: '30px', background: '#0f172a', padding: '12px', borderRadius: '10px', border: '1px solid #1e293b' }}>
          <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>🏢 اختر المنشأة التابعة:</label>
          <select value={selectedCompany} onChange={(e) => setSelectedCompany(e.target.value)} style={{ width: '100%', padding: '10px', background: '#020617', border: '1px solid #3b82f6', color: '#fff', borderRadius: '8px', outline: 'none', fontWeight: 'bold' }}>
            {Object.keys(companiesData).map(comp => <option key={comp} value={comp}>{comp}</option>)}
          </select>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { id: 'overview', icon: '📊', label: 'مركز القيادة الموحد' },
            { id: 'sectors', icon: '🏭', label: 'الخريطة الحرارية للقطاعات' },
            { id: 'leaderboard', icon: '🏆', label: 'مؤشر التنافسية بالسوق' },
            { id: 'reports', icon: '🔗', label: 'صكوك الكربون والتوثيق' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ background: activeTab === tab.id ? '#1e293b' : 'transparent', color: activeTab === tab.id ? '#10b981' : '#94a3b8', border: '1px solid', borderColor: activeTab === tab.id ? '#10b98144' : 'transparent', padding: '12px', borderRadius: '8px', textAlign: 'right', cursor: 'pointer', fontWeight: 'bold', display: 'flex', gap: '10px' }}>
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* المحتوى الرئيسي */}
      <main style={{ flex: 1, padding: '30px 40px', position: 'relative' }}>
        
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', background: 'rgba(15, 23, 42, 0.4)', padding: '20px', borderRadius: '16px', border: '1px solid #1e293b' }}>
          <div>
            <h1 style={{ margin: '0 0 5px', fontSize: '24px' }}>لوحة التحكم: {selectedCompany}</h1>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px' }}>رصد حي للامتثال المؤسسي وأداء القطاعات التابعة</p>
          </div>
          <span style={{ padding: '8px 16px', borderRadius: '20px', background: '#020617', border: '1px solid #334155', fontWeight: 'bold' }}>التصنيف الكلي: <span style={{ color: activeData.rating.includes('A') ? '#10b981' : '#f59e0b' }}>{activeData.rating}</span></span>
        </header>

        {/* التبويبات */}
        {activeTab === 'overview' && (
          <div style={{ animation: 'slideIn 0.4s ease' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '20px' }}>
              <div className="enterprise-card">
                <p style={{ color: '#94a3b8', margin: '0 0 10px', fontSize: '13px' }}>البصمة الكربونية الكلية</p>
                <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{activeData.ghg} <span style={{ fontSize: '14px', color: '#64748b' }}>tCO2e</span></div>
              </div>
              <div className="enterprise-card">
                <p style={{ color: '#94a3b8', margin: '0 0 10px', fontSize: '13px' }}>التوطين الاستراتيجي (السعودة)</p>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#10b981' }}>{activeData.saudization}%</div>
              </div>
              <div className="enterprise-card">
                <p style={{ color: '#94a3b8', margin: '0 0 10px', fontSize: '13px' }}>كفاءة استهلاك المياه</p>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#38bdf8' }}>{activeData.water}%</div>
              </div>
            </div>

            <div className="enterprise-card" style={{ padding: '30px' }}>
              <h3 style={{ margin: '0 0 20px', color: '#fff' }}>📉 مسار خفض الانبعاثات التنبؤي (حتى 2030)</h3>
              <div style={{ display: 'flex', alignItems: 'flex-end', height: '200px', gap: '2%', paddingBottom: '30px', borderBottom: '1px solid #334155', position: 'relative' }}>
                {[ { year: '2023', val: 95, color: '#ef4444' }, { year: '2024', val: 80, color: '#f59e0b' }, { year: '2025', val: 65, color: '#10b981' }, { year: '2026', val: 50, color: '#10b981' }, { year: '2030', val: 20, color: '#3b82f6', label: 'الهدف' } ].map((bar, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%', position: 'relative' }}>
                    <span style={{ fontSize: '11px', color: bar.color, marginBottom: '8px', fontWeight: 'bold' }}>{bar.val}%</span>
                    <div style={{ width: '40%', height: `${bar.val}%`, background: `linear-gradient(0deg, ${bar.color}22, ${bar.color})`, borderRadius: '4px 4px 0 0' }}></div>
                    <span style={{ position: 'absolute', bottom: '-25px', fontSize: '12px', color: '#94a3b8' }}>{bar.year}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sectors' && (
          <div style={{ animation: 'slideIn 0.4s ease' }}>
            <h2 style={{ color: '#fff', marginBottom: '20px' }}>🗺️ الخريطة الحرارية لأداء الأصول والقطاعات التابعة</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {activeData.sectors.map((sec: any, i: number) => (
                <div key={i} className="enterprise-card" style={{ borderTop: `3px solid ${sec.status === 'green' ? '#10b981' : sec.status === 'yellow' ? '#f59e0b' : '#ef4444'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ margin: '0 0 5px', fontSize: '16px' }}>{sec.name}</h3>
                      <span style={{ background: '#1e293b', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', color: '#94a3b8' }}>نوع القطاع: {sec.type}</span>
                    </div>
                    <span className={`status-dot dot-${sec.status}`}></span>
                  </div>
                  <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>التصنيف الفرعي</div>
                      <div style={{ fontSize: '20px', fontWeight: 'bold', color: sec.status === 'green' ? '#10b981' : sec.status === 'yellow' ? '#f59e0b' : '#ef4444' }}>{sec.score}</div>
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>حصة الانبعاثات</div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#e2e8f0' }}>{sec.ghgShare}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="enterprise-card">
            <h2 style={{ marginTop: 0 }}>🏆 مؤشر التنافسية للامتثال المؤسسي بالسوق السعودي</h2>
            <div style={{ background: '#020617', borderRadius: '12px', overflow: 'hidden', border: '1px solid #1e293b' }}>
              {marketLeaderboard.map((rank, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #1e293b', background: rank.name === selectedCompany ? 'rgba(16, 185, 129, 0.05)' : 'transparent' }}>
                  <div style={{ width: '40px', fontSize: '20px', fontWeight: 'bold', color: i < 3 ? '#eab308' : '#64748b' }}>#{i+1}</div>
                  <div style={{ flex: 1, fontSize: '15px', fontWeight: 'bold', color: rank.name === selectedCompany ? '#10b981' : '#e2e8f0' }}>{rank.name}</div>
                  <div style={{ width: '150px' }}>
                    <div style={{ width: '100%', height: '8px', background: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${rank.points}%`, height: '100%', background: 'linear-gradient(90deg, #10b981, #3b82f6)' }}></div>
                    </div>
                  </div>
                  <div style={{ width: '80px', textAlign: 'center', fontWeight: 'bold', color: rank.score.includes('A') ? '#10b981' : '#f59e0b' }}>{rank.score}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 🔗 الشاشة التي تم إضافتها: صكوك الكربون والتقارير */}
        {activeTab === 'reports' && (
          <div className="enterprise-card" style={{ animation: 'slideIn 0.4s ease' }}>
            <h2 style={{ marginTop: 0, color: '#fff' }}>🔗 التوثيق وإصدار صكوك الكربون الائتمانية</h2>
            <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '25px' }}>
              إصدار تقارير الإفصاح المالي المعتمدة وتوثيقها عبر شبكة البلوكشين (Smart Contracts) للجهات التمويلية.
            </p>
            
            <div style={{ background: '#020617', padding: '25px', borderRadius: '12px', border: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <h3 style={{ margin: '0 0 10px', color: '#e2e8f0' }}>📄 تقرير الإفصاح المالي (ESG) لـ {selectedCompany}</h3>
                <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                  <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', border: '1px solid #10b981' }}>التصنيف الحالي: {activeData.rating}</span>
                  <span style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', border: '1px solid #3b82f6' }}>السنة المالية: 2026</span>
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(139, 92, 246, 0.1)', border: '1px dashed #8b5cf6', color: '#c4b5fd', padding: '8px 14px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '12px', fontWeight: 'bold' }}>
                  <span>العقد الذكي (Blockchain Hash):</span>
                  <span style={{ color: '#fff' }}>{blockchainHash}</span>
                </div>
              </div>
              <button onClick={() => alert('تم إصدار التقرير بصيغة PDF وتوثيق العقد الذكي بنجاح ضمن سجلات البلوكشين!')} style={{ padding: '14px 28px', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)' }}>
                تحميل PDF موثق 📥
              </button>
            </div>
            
            <div style={{ marginTop: '30px', borderTop: '1px solid #1e293b', paddingTop: '20px' }}>
              <h3 style={{ color: '#fff', marginBottom: '15px', fontSize: '16px' }}>سجل صكوك الكربون السابقة (Carbon Credits History)</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'right' }}>
                <thead>
                  <tr style={{ color: '#94a3b8', borderBottom: '1px solid #334155' }}>
                    <th style={{ padding: '10px' }}>تاريخ الإصدار</th>
                    <th style={{ padding: '10px' }}>حجم الخفض (tCO2e)</th>
                    <th style={{ padding: '10px' }}>رقم التوثيق الشبكي (Hash)</th>
                    <th style={{ padding: '10px' }}>الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #1e293b', color: '#e2e8f0' }}>
                    <td style={{ padding: '12px 10px' }}>15 مارس 2026</td>
                    <td style={{ padding: '12px 10px', color: '#10b981', fontWeight: 'bold' }}>- 120.5</td>
                    <td style={{ padding: '12px 10px', fontFamily: 'monospace', color: '#c4b5fd' }}>0x8A2B...9F1C</td>
                    <td style={{ padding: '12px 10px' }}><span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '4px 8px', borderRadius: '4px' }}>مُعتمد</span></td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #1e293b', color: '#e2e8f0' }}>
                    <td style={{ padding: '12px 10px' }}>10 يناير 2026</td>
                    <td style={{ padding: '12px 10px', color: '#10b981', fontWeight: 'bold' }}>- 85.0</td>
                    <td style={{ padding: '12px 10px', fontFamily: 'monospace', color: '#c4b5fd' }}>0x3C4D...2E5A</td>
                    <td style={{ padding: '12px 10px' }}><span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '4px 8px', borderRadius: '4px' }}>مُعتمد</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* الشات بوت الذكي */}
      <div style={{ position: 'fixed', bottom: '30px', left: '30px', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }} dir="rtl">
        {isChatOpen && (
          <div style={{ animation: 'chatPop 0.3s ease', background: 'rgba(15, 23, 42, 0.95)', border: '1px solid #8b5cf6', borderRadius: '16px', width: '340px', height: '420px', marginBottom: '15px', display: 'flex', flexDirection: 'column', overflow: 'hidden', backdropFilter: 'blur(10px)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
            <div style={{ background: '#8b5cf6', padding: '15px', color: '#fff', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
              <span>🧠 مستشار طويق الذكي</span>
              <button onClick={() => setIsChatOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>✖</button>
            </div>
            
            <div style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {chatMessages.map((msg, i) => (
                <div key={i} style={{ alignSelf: msg.sender === 'user' ? 'flex-start' : 'flex-end', background: msg.sender === 'user' ? '#1e293b' : 'rgba(139, 92, 246, 0.2)', border: `1px solid ${msg.sender === 'user' ? '#334155' : '#8b5cf655'}`, padding: '10px 14px', borderRadius: '12px', maxWidth: '85%', fontSize: '13px', lineHeight: '1.5', color: '#fff' }}>
                  {msg.text}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleChatSubmit} style={{ borderTop: '1px solid #334155', display: 'flex', padding: '10px' }}>
              <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="اسأل عن تقليل الانبعاثات..." style={{ flex: 1, background: '#020617', border: '1px solid #334155', color: '#fff', borderRadius: '8px', padding: '10px', outline: 'none' }} />
              <button type="submit" style={{ background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: '8px', padding: '0 15px', marginLeft: '10px', cursor: 'pointer', fontWeight: 'bold' }}>إرسال</button>
            </form>
          </div>
        )}
        
        <button onClick={() => setIsChatOpen(!isChatOpen)} style={{ width: '60px', height: '60px', borderRadius: '30px', background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', color: '#fff', fontSize: '24px', border: 'none', cursor: 'pointer', boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)' }}>
          🤖
        </button>
      </div>

    </div>
  );
}
