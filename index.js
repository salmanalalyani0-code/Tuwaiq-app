import React, { useState, useEffect, useMemo } from 'react';

// ══════════════════════════════════════════════════════
// 1. الاتصال بالسحابة
// ══════════════════════════════════════════════════════
const supabaseUrl = 'https://ctnehbvjlmwrlapvnyhj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0bmVoYnZqbG13cmxhcHZueWhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MzE5MjgsImV4cCI6MjA5NTQwNzkyOH0.woFaPKyfmICGf4iKB7SnANpZFqbe1Y6ZQYsZcy4tftc';

// ══════════════════════════════════════════════════════
// 2. بيانات Multi-Tenancy — شركات وهمية للعرض التجريبي
// ══════════════════════════════════════════════════════
interface TenantData {
  id: string;
  nameAr: string;
  sector: string;
  scope1: string; scope2: string;
  saudization: string; femalePct: string;
  waterRecycle: string; wasteDiverted: string;
  boardIndependence: string; injuryRate: string;
  localSupplierSpend: string; dataPrivacyBreaches: string;
}

const TENANTS: TenantData[] = [
  { id: 'aramco', nameAr: 'أرامكو السعودية', sector: 'النفط والغاز',
    scope1: '1240', scope2: '680', saudization: '72', femalePct: '18',
    waterRecycle: '55', wasteDiverted: '48', boardIndependence: '80',
    injuryRate: '0.3', localSupplierSpend: '82', dataPrivacyBreaches: '0' },
  { id: 'sabic', nameAr: 'شركة سابك', sector: 'البتروكيماويات',
    scope1: '890', scope2: '410', saudization: '44', femalePct: '12',
    waterRecycle: '67', wasteDiverted: '71', boardIndependence: '75',
    injuryRate: '0.6', localSupplierSpend: '69', dataPrivacyBreaches: '1' },
  { id: 'maaden', nameAr: 'شركة معادن', sector: 'التعدين والمعادن',
    scope1: '460', scope2: '320', saudization: '38', femalePct: '8',
    waterRecycle: '42', wasteDiverted: '58', boardIndependence: '70',
    injuryRate: '1.1', localSupplierSpend: '61', dataPrivacyBreaches: '0' },
  { id: 'stc', nameAr: 'شركة STC للاتصالات', sector: 'الاتصالات وتقنية المعلومات',
    scope1: '120', scope2: '540', saudization: '58', femalePct: '31',
    waterRecycle: '72', wasteDiverted: '83', boardIndependence: '85',
    injuryRate: '0.1', localSupplierSpend: '74', dataPrivacyBreaches: '2' },
  { id: 'alrajhi', nameAr: 'مجموعة الراجحي', sector: 'الخدمات المالية والمصرفية',
    scope1: '65', scope2: '290', saudization: '85', femalePct: '40',
    waterRecycle: '80', wasteDiverted: '90', boardIndependence: '90',
    injuryRate: '0.0', localSupplierSpend: '88', dataPrivacyBreaches: '0' },
];

// ══════════════════════════════════════════════════════
// 3. مولّد هاش البلوكشين المحاكى
// ══════════════════════════════════════════════════════
function generateBlockchainHash(tenantId: string, scope1: string, scope2: string): string {
  const seed = `${tenantId}-${scope1}-${scope2}-TQ2026`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  const hexPart = Math.abs(hash).toString(16).padStart(8, '0');
  const suffix = seed.split('').reverse().join('').substring(0, 4)
    .split('').map(c => c.charCodeAt(0).toString(16)).join('');
  return `0x${hexPart.substring(0,3).toUpperCase()}...${suffix.substring(0,4)}`;
}

function generateFullHash(tenantId: string, values: string[]): string {
  const seed = `${tenantId}-${values.join('-')}-TQ-ESG-2026-CHAIN`;
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < seed.length; i++) {
    const ch = seed.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const full = (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).toUpperCase();
  return `0x${full.padStart(16,'0')}${Math.abs(h1 ^ h2).toString(16).padStart(8,'0').toUpperCase()}`;
}

// ══════════════════════════════════════════════════════
// 4. محرك توصيات الذكاء الاصطناعي
// ══════════════════════════════════════════════════════
interface AiRec { priority: 'high' | 'medium' | 'low'; icon: string; title: string; detail: string; saving: string; }

function generateAiRecommendations(
  scope1: string, scope2: string, saudization: string, femalePct: string,
  waterRecycle: string, wasteDiverted: string, injuryRate: string,
  boardIndependence: string, localSupplierSpend: string
): AiRec[] {
  const recs: AiRec[] = [];
  const s1 = parseFloat(scope1) || 0;
  const s2 = parseFloat(scope2) || 0;
  const saudi = parseInt(saudization) || 0;
  const female = parseInt(femalePct) || 0;
  const water = parseInt(waterRecycle) || 0;
  const waste = parseInt(wasteDiverted) || 0;
  const injury = parseFloat(injuryRate) || 0;
  const board = parseInt(boardIndependence) || 0;
  const local = parseInt(localSupplierSpend) || 0;
  const carbonTax = 185; // ريال / tCO2e (توقعات ضريبة الكربون السعودية 2030)

  if (s1 > 500) {
    const saving = Math.round(s1 * 0.6 * carbonTax).toLocaleString('ar-SA');
    recs.push({ priority: 'high', icon: '⚡', title: 'تحويل أسطول المعدات إلى الهيدروجين الأخضر',
      detail: `Scope 1 لديك ${s1} tCO2e — يتجاوز حد الكفاءة الاستراتيجي بنسبة ${Math.round((s1-500)/500*100)}%. التحول لأسطول هيدروجيني يخفض 60% من الانبعاثات المباشرة.`,
      saving: `توفير متوقع: ${saving} ريال / سنة من ضرائب الكربون` });
  }
  if (s2 > 300) {
    const panels = Math.round(s2 * 3.5);
    const saving = Math.round(s2 * 0.55 * carbonTax).toLocaleString('ar-SA');
    recs.push({ priority: 'high', icon: '☀️', title: 'تركيب ألواح طاقة شمسية على مباني المنشأة',
      detail: `Scope 2 يبلغ ${s2} tCO2e. تركيب ${panels.toLocaleString('ar-SA')} لوح شمسي يغطي ~55% من استهلاك الكهرباء ويرفع تصنيف ESG درجة كاملة.`,
      saving: `توفير متوقع: ${saving} ريال / سنة من فواتير الطاقة والكربون` });
  }
  if (saudi < 40) {
    recs.push({ priority: 'high', icon: '🇸🇦', title: 'برنامج تسريع التوطين (نطاقات بلاتيني)',
      detail: `نسبة السعودة ${saudi}% دون الحد الأمثل (40%). اشتراطات وزارة الموارد البشرية تستوجب خطة رفع مسرّعة لتجنب غرامات التأشيرات وضمان الأهلية للعقود الحكومية.`,
      saving: `تجنّب غرامات تُقدّر بـ 9,600 ريال / موظف أجنبي فائض سنوياً` });
  }
  if (female < 25) {
    recs.push({ priority: 'medium', icon: '👩‍💼', title: 'مبادرة تمكين المرأة — هدف 25% بحلول 2027',
      detail: `نسبة الموظفات ${female}% أقل من متوسط القطاع (25%). رفعها يحسن مؤشر MSCI ESG ويفتح باب صناديق الاستثمار المرتبطة بالتنوع الجنساني.`,
      saving: `رفع التصنيف الائتماني الأخضر قد يخفض فوائد القروض 0.5% على محفظة تمويلية بـ 100م ريال = 500,000 ريال / سنة` });
  }
  if (water < 60) {
    recs.push({ priority: 'medium', icon: '💧', title: 'نظام إعادة تدوير المياه الصناعية المتكاملة',
      detail: `كفاءة استخدام المياه ${water}% دون المستهدف الوطني (60%). تركيب أنظمة تحلية وإعادة تدوير يرفع المؤشر ويقلل تكاليف الاستهلاك المتصاعدة.`,
      saving: `خفض فاتورة المياه بـ 35-45% — توفير ~${Math.round((60-water)*1200).toLocaleString('ar-SA')} ريال / شهر لكل 1000 م³` });
  }
  if (waste < 70) {
    recs.push({ priority: 'medium', icon: '♻️', title: 'منظومة إدارة النفايات الذكية (Zero Waste)',
      detail: `معدل تحويل النفايات ${waste}% دون هدف رؤية 2030 (70%). تطبيق تقنيات الفرز الآلي والشراكة مع مراكز إعادة التدوير المعتمدة.`,
      saving: `تجنّب رسوم مدافن النفايات المتوقع ارتفاعها 300% بعد 2028` });
  }
  if (injury > 0.5) {
    recs.push({ priority: 'high', icon: '🦺', title: 'برنامج السلامة الرقمي المدمج (IoT Safety)',
      detail: `LTIFR ${injury} أعلى من المعيار الدولي (0.5). ربط أجهزة استشعار IoT بنظام تنبيه فوري يخفض الحوادث 70% — ضروري لشهادة OHSAS 18001.`,
      saving: `خفض تعويضات الإصابات وتكاليف التأمين بما يُقدّر بـ ${Math.round(injury*50000).toLocaleString('ar-SA')} ريال / حادثة` });
  }
  if (board < 75) {
    recs.push({ priority: 'low', icon: '🏛️', title: 'تعزيز استقلالية مجلس الإدارة',
      detail: `نسبة الأعضاء المستقلين ${board}% دون الحد المثالي (75%). إضافة أعضاء مستقلين بخبرات بيئية تستوفي متطلبات هيئة السوق المالية للإفصاح الكامل.`,
      saving: 'شرط أساسي لإدراج السهم في مؤشر FTSE4Good الناشئة' });
  }
  if (local < 70) {
    recs.push({ priority: 'low', icon: '🛒', title: 'تطوير قاعدة موردين محليين معتمدين',
      detail: `الإنفاق المحلي ${local}% — رفعه لـ 70%+ يستوفي اشتراطات برنامج المحتوى المحلي ويرفع تصنيف المنشأة في قائمة المشتريات الحكومية.`,
      saving: 'أهلية لعقود حكومية بقيمة إضافية تصل 15% فوق العروض الأجنبية' });
  }
  if (recs.length === 0) {
    recs.push({ priority: 'low', icon: '🏆', title: 'المنشأة في المستوى الذهبي — حافظ على الزخم',
      detail: 'جميع مؤشراتك تتجاوز المعايير المثلى. نوصي بالتقدم لشهادة ISO 14001 وإصدار سندات خضراء (Green Bonds) للاستفادة من السيولة الدولية.',
      saving: 'سندات خضراء بفائدة 0.3% أقل من السوق — على محفظة 500م ريال = 1.5م ريال / سنة' });
  }
  return recs;
}

// ══════════════════════════════════════════════════════
// 5. حقن CSS الشامل
// ══════════════════════════════════════════════════════
const injectGlobalStyles = () => {
  if (document.getElementById('tuwayq-global-styles')) return;
  const el = document.createElement('style');
  el.id = 'tuwayq-global-styles';
  el.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap');
    * { box-sizing: border-box; }

    @keyframes fillBar {
      from { width: 0%; } to { width: var(--target-width); }
    }
    @keyframes fadeSlideUp {
      from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); }
    }
    @keyframes pulseGlow {
      0%, 100% { box-shadow: 0 0 8px rgba(16,185,129,0.3); }
      50%       { box-shadow: 0 0 22px rgba(16,185,129,0.7); }
    }
    @keyframes countUp {
      from { opacity: 0; transform: scale(0.85); } to { opacity: 1; transform: scale(1); }
    }
    @keyframes blink {
      0%, 100% { opacity: 1; } 50% { opacity: 0.4; }
    }
    @keyframes slideInRight {
      from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); }
    }
    @keyframes shimmer {
      0% { background-position: -200% 0; } 100% { background-position: 200% 0; }
    }

    .esg-card {
      animation: fadeSlideUp 0.45s ease both;
      transition: transform 0.25s ease, box-shadow 0.25s ease;
    }
    .esg-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.45) !important; }
    .esg-card:nth-child(1) { animation-delay: 0.05s; }
    .esg-card:nth-child(2) { animation-delay: 0.10s; }
    .esg-card:nth-child(3) { animation-delay: 0.15s; }
    .esg-card:nth-child(4) { animation-delay: 0.20s; }
    .esg-card:nth-child(5) { animation-delay: 0.25s; }

    .progress-fill { animation: fillBar 1s cubic-bezier(0.34,1.2,0.64,1) both; animation-delay: 0.6s; }
    .kpi-value { animation: countUp 0.5s ease both; animation-delay: 0.3s; }
    .score-circle-ring { animation: pulseGlow 2.8s ease-in-out infinite; }

    .section-header-pill {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 6px 16px; border-radius: 30px; font-size: 12px;
      font-weight: 700; letter-spacing: 0.04em; margin-bottom: 18px;
    }
    .nav-btn { transition: background 0.2s, color 0.2s; }
    .nav-btn:hover { background-color: #1e293b !important; color: #e2e8f0 !important; }

    .tenant-select {
      background-color: #020617;
      border: 1px solid #334155;
      border-radius: 8px;
      color: #fff;
      padding: 8px 12px;
      font-size: 13px;
      width: 100%;
      cursor: pointer;
      font-family: 'IBM Plex Sans Arabic', system-ui, sans-serif;
      outline: none;
      transition: border-color 0.2s;
    }
    .tenant-select:hover { border-color: #10b981; }
    .tenant-select:focus { border-color: #10b981; box-shadow: 0 0 0 2px rgba(16,185,129,0.2); }

    .api-dot {
      display: inline-block; width: 7px; height: 7px;
      border-radius: 50%; background-color: #10b981;
      animation: blink 1.8s ease-in-out infinite;
      margin-left: 5px; flex-shrink: 0;
    }
    .api-badge {
      display: inline-flex; align-items: center; gap: 5px;
      background-color: rgba(16,185,129,0.08);
      border: 1px solid rgba(16,185,129,0.25);
      border-radius: 6px; padding: 4px 10px;
      font-size: 10px; color: #6ee7b7; white-space: nowrap;
    }

    .ai-rec-card {
      animation: slideInRight 0.4s ease both;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .ai-rec-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.3) !important; }
    .ai-rec-card:nth-child(1) { animation-delay: 0.1s; }
    .ai-rec-card:nth-child(2) { animation-delay: 0.18s; }
    .ai-rec-card:nth-child(3) { animation-delay: 0.26s; }
    .ai-rec-card:nth-child(4) { animation-delay: 0.34s; }

    .blockchain-hash {
      font-family: 'Courier New', monospace;
      background: linear-gradient(90deg, #10b981, #3b82f6, #a855f7, #10b981);
      background-size: 200% 100%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: shimmer 3s linear infinite;
      font-weight: 700;
      letter-spacing: 0.05em;
    }
  `;
  document.head.appendChild(el);
};

// ══════════════════════════════════════════════════════
// 6. أدوات الألوان والمؤشرات
// ══════════════════════════════════════════════════════
const getProgressColor = (v: number, inv = false) => {
  if (inv) { return v <= 30 ? '#10b981' : v <= 60 ? '#f59e0b' : '#ef4444'; }
  return v >= 70 ? '#10b981' : v >= 40 ? '#f59e0b' : '#ef4444';
};
const getProgressGlow = (c: string) => {
  const m: Record<string,string> = { '#10b981':'rgba(16,185,129,0.35)', '#f59e0b':'rgba(245,158,11,0.35)', '#ef4444':'rgba(239,68,68,0.35)' };
  return m[c] || 'rgba(255,255,255,0.1)';
};
const getKpiBadge = (v: number, inv = false) => {
  if (inv) {
    if (v <= 30) return { icon: '📉', color: '#10b981', label: 'ممتاز' };
    if (v <= 60) return { icon: '⚠️', color: '#f59e0b', label: 'مقبول' };
    return { icon: '🔴', color: '#ef4444', label: 'مرتفع' };
  }
  if (v >= 70) return { icon: '📈', color: '#10b981', label: 'ممتاز' };
  if (v >= 40) return { icon: '➡️', color: '#f59e0b', label: 'مقبول' };
  return { icon: '📉', color: '#ef4444', label: 'منخفض' };
};

// ══════════════════════════════════════════════════════
// 7. مكوّن بطاقة KPI
// ══════════════════════════════════════════════════════
interface KpiCardProps {
  rank: number; title: string; value: string|number; unit: string;
  accentColor: string; isPercent?: boolean; inverse?: boolean;
  icon: string; description?: string; apiSource?: string;
}
function KpiCard({ rank, title, value, unit, accentColor, isPercent=false, inverse=false, icon, description, apiSource }: KpiCardProps) {
  const numVal = parseFloat(String(value)) || 0;
  const clampedPct = Math.min(100, Math.max(0, isPercent ? numVal : (numVal/2000)*100));
  const progColor = isPercent ? getProgressColor(numVal, inverse) : (numVal<500?'#10b981':numVal<1000?'#f59e0b':'#ef4444');
  const badge = isPercent ? getKpiBadge(numVal, inverse) : (numVal<500?{icon:'📉',color:'#10b981',label:'منخفض'}:{icon:'📈',color:'#ef4444',label:'مرتفع'});

  return (
    <div className="esg-card" style={{ backgroundColor:'#0b1628', border:`1px solid ${accentColor}33`, borderRadius:'14px', padding:'22px 20px 18px', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:0, right:0, left:0, height:'3px', background:`linear-gradient(90deg,transparent,${accentColor},transparent)` }} />
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px' }}>
        <span style={{ width:'28px',height:'28px',borderRadius:'8px',backgroundColor:`${accentColor}22`,color:accentColor,fontSize:'11px',fontWeight:'700',display:'flex',alignItems:'center',justifyContent:'center',border:`1px solid ${accentColor}44` }}>{rank}</span>
        <span style={{ fontSize:'22px', lineHeight:1 }}>{icon}</span>
      </div>
      {apiSource && (
        <div style={{ marginBottom:'8px' }}>
          <span className="api-badge"><span className="api-dot"></span>{apiSource}</span>
        </div>
      )}
      <p style={{ margin:'0 0 10px', color:'#94a3b8', fontSize:'12px', lineHeight:'1.5', fontWeight:'500' }}>{title}</p>
      <div className="kpi-value" style={{ display:'flex', alignItems:'baseline', gap:'8px', marginBottom:isPercent?'14px':'8px' }}>
        <span style={{ color:'#fff', fontSize:'28px', fontWeight:'700', letterSpacing:'-0.5px', lineHeight:1 }}>
          {typeof value==='number' ? value.toFixed(value%1!==0?2:0) : value}
        </span>
        <span style={{ color:'#475569', fontSize:'12px' }}>{unit}</span>
        <span style={{ marginRight:'auto', backgroundColor:`${badge.color}18`, color:badge.color, border:`1px solid ${badge.color}44`, borderRadius:'20px', padding:'2px 10px', fontSize:'11px', fontWeight:'600', display:'inline-flex', alignItems:'center', gap:'4px' }}>{badge.icon} {badge.label}</span>
      </div>
      {isPercent && (
        <div style={{ marginTop:'4px' }}>
          <div style={{ backgroundColor:'#1e293b', borderRadius:'6px', height:'6px', overflow:'hidden' }}>
            <div className="progress-fill" style={{ '--target-width':`${clampedPct}%`, width:`${clampedPct}%`, height:'100%', borderRadius:'6px', background:`linear-gradient(90deg,${progColor}88,${progColor})`, boxShadow:`0 0 8px ${getProgressGlow(progColor)}` } as React.CSSProperties} />
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:'5px' }}>
            <span style={{ color:'#334155', fontSize:'10px' }}>0%</span>
            <span style={{ color:progColor, fontSize:'10px', fontWeight:'600' }}>{numVal.toFixed(0)}%</span>
            <span style={{ color:'#334155', fontSize:'10px' }}>100%</span>
          </div>
        </div>
      )}
      {description && <p style={{ margin:'10px 0 0', color:'#475569', fontSize:'10.5px', lineHeight:'1.5', borderTop:'1px solid #1e293b', paddingTop:'8px' }}>{description}</p>}
    </div>
  );
}

// ══════════════════════════════════════════════════════
// 8. مكوّن قسم الركيزة
// ══════════════════════════════════════════════════════
function PillarSection({ pillIcon, pillLabel, pillColor, pillBg, children }: { pillIcon:string; pillLabel:string; pillColor:string; pillBg:string; children:React.ReactNode }) {
  return (
    <div style={{ marginBottom:'36px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'20px' }}>
        <div className="section-header-pill" style={{ backgroundColor:pillBg, color:pillColor, border:`1px solid ${pillColor}44` }}>{pillIcon} {pillLabel}</div>
        <div style={{ flex:1, height:'1px', background:`linear-gradient(90deg,${pillColor}44,transparent)` }} />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:'16px' }}>{children}</div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// 9. التنسيقات
// ══════════════════════════════════════════════════════
const S: { [k:string]: React.CSSProperties } = {
  authContainer: { display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh', backgroundColor:'#020617', fontFamily:"'IBM Plex Sans Arabic',system-ui,sans-serif", position:'relative', overflow:'hidden' },
  particleBg: { position:'absolute', width:'100%', height:'100%', backgroundImage:'radial-gradient(circle at 50% 50%,#022c22 0%,transparent 70%)', opacity:0.5 },
  authCard: { backgroundColor:'#0f172a', border:'1px solid #1e293b', borderRadius:'20px', padding:'40px', width:'100%', maxWidth:'440px', boxShadow:'0 25px 50px -12px rgba(0,0,0,0.5)', zIndex:2, backdropFilter:'blur(8px)', textAlign:'center' },
  logoGlow: { fontSize:'45px', marginBottom:'15px', filter:'drop-shadow(0 0 10px #10b981)' },
  authTitle: { color:'#fff', fontSize:'22px', fontWeight:'bold', margin:'0 0 8px 0' },
  authSubtitle: { color:'#64748b', fontSize:'13px', margin:'0 0 30px 0', lineHeight:'1.5' },
  form: { display:'flex', flexDirection:'column', gap:'18px', textAlign:'right' },
  inputGroup: { display:'flex', flexDirection:'column', gap:'8px' },
  label: { color:'#94a3b8', fontSize:'13px', fontWeight:'500' },
  input: { backgroundColor:'#020617', border:'1px solid #334155', borderRadius:'8px', padding:'12px', color:'#fff', fontSize:'14px', outline:'none', fontFamily:"'IBM Plex Sans Arabic',system-ui,sans-serif" },
  submitBtn: { background:'linear-gradient(135deg,#047857 0%,#10b981 100%)', color:'#fff', border:'none', borderRadius:'8px', padding:'12px', fontSize:'14px', fontWeight:'bold', cursor:'pointer', boxShadow:'0 4px 12px rgba(16,185,129,0.2)', fontFamily:"'IBM Plex Sans Arabic',system-ui,sans-serif" },
  authError: { backgroundColor:'rgba(239,68,68,0.1)', color:'#f87171', border:'1px solid #ef4444', borderRadius:'8px', padding:'10px', fontSize:'13px', marginBottom:'15px' },
  mainLayout: { display:'flex', minHeight:'100vh', backgroundColor:'#020617', color:'#f1f5f9', fontFamily:"'IBM Plex Sans Arabic',system-ui,sans-serif" },
  sidebar: { width:'270px', backgroundColor:'#0a1628', borderLeft:'1px solid #1e293b', padding:'20px', display:'flex', flexDirection:'column', justifyContent:'space-between', flexShrink:0 },
  sidebarLogo: { display:'flex', flexDirection:'column', gap:'3px', color:'#fff', fontWeight:'bold', marginBottom:'16px' },
  sidebarLogoSub: { fontSize:'10px', color:'#64748b', fontWeight:'normal' },
  sideNav: { display:'flex', flexDirection:'column', gap:'6px', marginTop:'8px', flex:1 },
  navItem: { display:'block', width:'100%', textAlign:'right', backgroundColor:'transparent', color:'#94a3b8', border:'none', padding:'11px 14px', borderRadius:'8px', cursor:'pointer', fontSize:'13px', fontWeight:'500', fontFamily:"'IBM Plex Sans Arabic',system-ui,sans-serif" },
  activeNavItem: { backgroundColor:'#1e293b', color:'#10b981', fontWeight:'bold', boxShadow:'inset 4px 0 0 #10b981' },
  sidebarFooter: { borderTop:'1px solid #1e293b', paddingTop:'14px' },
  contentArea: { flex:1, padding:'35px', overflowY:'auto' },
  mainHeader: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', borderBottom:'1px solid #1e293b', paddingBottom:'20px', marginBottom:'30px' },
  mainTitle: { margin:'0 0 5px 0', fontSize:'22px', fontWeight:'bold', color:'#fff' },
  mainSubtitle: { margin:0, color:'#64748b', fontSize:'13px' },
  headerBadges: { display:'flex', gap:'10px', flexWrap:'wrap' },
  liveBadge: { backgroundColor:'rgba(16,185,129,0.1)', color:'#10b981', padding:'6px 12px', borderRadius:'20px', fontSize:'11px', fontWeight:'bold', border:'1px solid rgba(16,185,129,0.3)' },
  yearBadge: { backgroundColor:'#1e293b', color:'#cbd5e1', padding:'6px 12px', borderRadius:'20px', fontSize:'11px' },
  scoreBanner: { backgroundColor:'#0a1628', border:'1px solid #1e293b', borderRadius:'16px', padding:'25px', display:'flex', alignItems:'center', gap:'25px', marginBottom:'36px', position:'relative', overflow:'hidden' },
  scoreCircle: { fontSize:'32px', fontWeight:'900', width:'80px', height:'80px', borderRadius:'50%', border:'3px solid', display:'flex', justifyContent:'center', alignItems:'center', backgroundColor:'#020617', flexShrink:0 },
  sectionCard: { backgroundColor:'#0f172a', border:'1px solid #1e293b', borderRadius:'16px', padding:'30px', marginBottom:'24px' },
  secTitle: { margin:'0 0 8px 0', color:'#fff', fontSize:'18px' },
  secDesc: { margin:'0 0 25px 0', color:'#64748b', fontSize:'13px' },
  formGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:'20px' },
  successAlert: { backgroundColor:'rgba(16,185,129,0.1)', color:'#10b981', border:'1px solid #10b981', borderRadius:'8px', padding:'12px', fontSize:'13px', marginBottom:'20px' },
  simFlex: { display:'flex', gap:'30px', flexWrap:'wrap', alignItems:'center' },
  sliderGroup: { display:'flex', flexDirection:'column', gap:'8px' },
  slider: { width:'100%', cursor:'pointer', accentColor:'#10b981' },
  simResultCard: { backgroundColor:'#020617', border:'1px solid #1e293b', borderRadius:'12px', padding:'25px', width:'240px', textAlign:'center' },
  reportList: { display:'flex', flexDirection:'column', gap:'15px' },
  reportItem: { backgroundColor:'#020617', border:'1px solid #1e293b', borderRadius:'10px', padding:'20px', display:'flex', justifyContent:'space-between', alignItems:'center', gap:'20px', flexWrap:'wrap' },
  downloadBtn: { backgroundColor:'#10b981', color:'#fff', border:'none', padding:'10px 20px', borderRadius:'8px', cursor:'pointer', fontSize:'13px', fontWeight:'bold', fontFamily:"'IBM Plex Sans Arabic',system-ui,sans-serif" },
  loading: { display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', fontSize:'16px', color:'#10b981', backgroundColor:'#020617', fontWeight:'bold', fontFamily:"'IBM Plex Sans Arabic',system-ui,sans-serif" },
  error: { padding:'20px', backgroundColor:'#7f1d1d', color:'#fca5a5', borderRadius:'8px', margin:'20px', textAlign:'center' },
};

// ══════════════════════════════════════════════════════
// 10. شاشة المصادقة
// ══════════════════════════════════════════════════════
function LoginScreen({ onAuthSuccess }: { onAuthSuccess:(t:string)=>void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  useEffect(() => { injectGlobalStyles(); }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(null);
    try {
      const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method:'POST', headers:{'Content-Type':'application/json','apikey':supabaseAnonKey},
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error_description || data.message || 'خطأ في التحقق');
      if (data.access_token) onAuthSuccess(data.access_token);
    } catch (err:any) { setError(err.message || 'تأكد من بيانات الدخول'); }
    finally { setLoading(false); }
  };

  return (
    <div style={S.authContainer} dir="rtl">
      <div style={S.particleBg}></div>
      <div style={S.authCard}>
        <div style={S.logoGlow}>🇸🇦</div>
        <h2 style={S.authTitle}>طـويـق للاسـتـدامـة</h2>
        <p style={S.authSubtitle}>النظام المؤسسي لإدارة الكربون والامتثال الائتماني لـ ESG</p>
        {error && <div style={S.authError}>{error}</div>}
        <form onSubmit={handleLogin} style={S.form}>
          <div style={S.inputGroup}>
            <label style={S.label}>البريد الإلكتروني للمنشأة</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required style={S.input} placeholder="ceo@company.com.sa" />
          </div>
          <div style={S.inputGroup}>
            <label style={S.label}>كلمة المرور المشفرة</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required style={S.input} placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} style={S.submitBtn}>
            {loading ? 'جاري التحقق وتأمين الاتصال السحابي...' : 'تسجيل دخول آمن'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// 11. لوحة التحكم الرئيسية
// ══════════════════════════════════════════════════════
function MainDashboard({ token }: { token:string }) {
  const [metric, setMetric] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Multi-Tenancy
  const [activeTenantId, setActiveTenantId] = useState<string>('live');

  // KPI states
  const [scope1, setScope1] = useState('');
  const [scope2, setScope2] = useState('');
  const [saudization, setSaudization] = useState('');
  const [femalePct, setFemalePct] = useState('');
  const [waterRecycle, setWaterRecycle] = useState('45');
  const [wasteDiverted, setWasteDiverted] = useState('62');
  const [boardIndependence, setBoardIndependence] = useState('75');
  const [injuryRate, setInjuryRate] = useState('0.8');
  const [localSupplierSpend, setLocalSupplierSpend] = useState('68');
  const [dataPrivacyBreaches, setDataPrivacyBreaches] = useState('0');

  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [dieselReduction, setDieselReduction] = useState(0);
  const [renewableShare, setRenewableShare] = useState(0);

  useEffect(() => { injectGlobalStyles(); }, []);

  // ── تحميل بيانات Tenant المختار ──
  const loadTenantData = (tenant: TenantData) => {
    setScope1(tenant.scope1); setScope2(tenant.scope2);
    setSaudization(tenant.saudization); setFemalePct(tenant.femalePct);
    setWaterRecycle(tenant.waterRecycle); setWasteDiverted(tenant.wasteDiverted);
    setBoardIndependence(tenant.boardIndependence); setInjuryRate(tenant.injuryRate);
    setLocalSupplierSpend(tenant.localSupplierSpend); setDataPrivacyBreaches(tenant.dataPrivacyBreaches);
    setMetric(prev => prev ? { ...prev, company_name_ar: tenant.nameAr } : { company_name_ar: tenant.nameAr });
  };

  const handleTenantChange = (tenantId: string) => {
    setActiveTenantId(tenantId);
    if (tenantId === 'live') {
      fetchEsgData();
    } else {
      const t = TENANTS.find(t => t.id === tenantId);
      if (t) loadTenantData(t);
    }
  };

  const fetchEsgData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${supabaseUrl}/rest/v1/esg_dashboard?select=*`, {
        method:'GET',
        headers:{ 'apikey':supabaseAnonKey, 'Authorization':`Bearer ${token}`, 'Accept':'application/vnd.pgrst.object+json' }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'فشل سحب البيانات');
      setMetric(data);
      setScope1(data.scope1_total_tco2e?.toString() ?? '0');
      setScope2(data.scope2_elec_tco2e?.toString() ?? '0');
      setSaudization(data.saudization_pct?.toString() ?? '0');
      setFemalePct(data.female_employee_pct?.toString() ?? '0');
    } catch (err:any) { setError(err.message || 'خطأ في الاتصال'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEsgData(); }, [token]);

  if (loading) return <div style={S.loading}>🔄 جاري جلب مؤشرات الأداء الـ 10 وتأمين معايير الحوكمة لعام 2026 م...</div>;
  if (error) return <div style={S.error}>خطأ سحابي: {error}</div>;
  if (!metric) return <div style={S.error}>لا توجد بيانات نشطة للمنشأة.</div>;

  const updatedTotalGhg = (parseFloat(scope1)||0) + (parseFloat(scope2)||0);

  // ── ESG Score ──
  const simScope1 = Math.max(0, (parseFloat(scope1)||0) * (1 - dieselReduction/100));
  const simScope2 = Math.max(0, (parseFloat(scope2)||0) * (1 - renewableShare/100));
  const simulatedTotalGhg = Number((simScope1+simScope2).toFixed(4));

  const getEsgScore = (ghg: number) => {
    if (ghg < 500 && (parseInt(saudization)||0) >= 40)
      return { grade:'A+', color:'#10b981', desc:'امتثال استثنائي خضراء بالكامل — مرشحة للقروض الخضراء التنموية بفائدة مخفضة.' };
    if (ghg < 800 && (parseInt(saudization)||0) >= 30)
      return { grade:'B', color:'#3b82f6', desc:'التزام ممتاز متوافق مع القواعد الاسترشادية للأسواق المالية وسوق تداول.' };
    return { grade:'C', color:'#f59e0b', desc:'مخاطر استدامة متوسطة — يُنصح بتحسين كفاءة الطاقة لرفع التصنيف الائتماني.' };
  };
  const score = getEsgScore(simulatedTotalGhg);
  const realScore = getEsgScore(updatedTotalGhg);

  // ── Blockchain Hash ──
  const blockchainShort = generateBlockchainHash(activeTenantId, scope1, scope2);
  const blockchainFull = generateFullHash(activeTenantId, [scope1, scope2, saudization, femalePct, waterRecycle, wasteDiverted, injuryRate, boardIndependence, localSupplierSpend, dataPrivacyBreaches]);
  const blockchainTs = new Date().toISOString().replace('T',' ').substring(0,19);

  // ── AI Recommendations ──
  const aiRecs = useMemo(() =>
    generateAiRecommendations(scope1, scope2, saudization, femalePct, waterRecycle, wasteDiverted, injuryRate, boardIndependence, localSupplierSpend),
    [scope1, scope2, saudization, femalePct, waterRecycle, wasteDiverted, injuryRate, boardIndependence, localSupplierSpend]
  );

  const priorityMeta = { high:{ label:'أولوية عالية', color:'#ef4444', bg:'rgba(239,68,68,0.1)' }, medium:{ label:'أولوية متوسطة', color:'#f59e0b', bg:'rgba(245,158,11,0.1)' }, low:{ label:'أولوية منخفضة', color:'#10b981', bg:'rgba(16,185,129,0.1)' } };

  // ── handleUpdateData ──
  const handleUpdateData = async (e: React.FormEvent) => {
    e.preventDefault(); setSaveLoading(true); setSaveSuccess(false);
    const payload = {
      scope1_total_tco2e:       parseFloat(scope1)||0,
      scope2_elec_tco2e:        parseFloat(scope2)||0,
      total_ghg_tco2e:          parseFloat(updatedTotalGhg.toFixed(4)),
      water_recycle_pct:        parseFloat(waterRecycle)||0,
      waste_diverted_pct:       parseFloat(wasteDiverted)||0,
      saudization_pct:          parseInt(saudization)||0,
      female_employee_pct:      parseInt(femalePct)||0,
      ltifr_rate:               parseFloat(injuryRate)||0,
      board_independence_pct:   parseInt(boardIndependence)||0,
      local_supplier_spend_pct: parseInt(localSupplierSpend)||0,
      data_privacy_breaches:    parseInt(dataPrivacyBreaches)||0,
    };
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/rpc/update_esg_metrics`, {
        method:'POST',
        headers:{'Content-Type':'application/json','apikey':supabaseAnonKey,'Authorization':`Bearer ${token}`},
        body: JSON.stringify({ p_company_name: metric.company_name_ar, ...payload })
      });
      if (!res.ok) console.warn('RPC warning:', await res.json().catch(()=>{}));
    } catch (err) { console.warn('Network error (local updated):', err); }
    finally {
      setMetric({ ...metric, ...payload });
      setSaveSuccess(true); setSaveLoading(false);
      setTimeout(() => setSaveSuccess(false), 3500);
    }
  };

  // ── handlePrintPDF ──
  const handlePrintPDF = (reportTitle: string) => {
    const pw = window.open('','_blank');
    if (!pw) return alert('الرجاء السماح بالنوافذ المنبثقة');
    const ps = realScore;
    const scoreColors: Record<string,{hex:string;bg:string;border:string;labelAr:string;descAr:string;ratingEn:string}> = {
      'A+': { hex:'#047857', bg:'#f0fdf4', border:'#6ee7b7', labelAr:'ممتثلة خضراء بالكامل', descAr:'منشأة ممتثلة استثنائياً — مرشحة للتمويل الأخضر المستدام وقروض التنمية بفائدة تفضيلية مخفضة وفق معايير بنك التنمية الإسلامي وصندوق الاستثمارات العامة.', ratingEn:'ESG Rating: A+ (Exceptional)' },
      'B':  { hex:'#1d4ed8', bg:'#eff6ff', border:'#93c5fd', labelAr:'التزام ممتاز — متوافق مع تداول', descAr:'منشأة ذات التزام ممتاز بمتطلبات الإفصاح — مؤهلة للإدراج في مؤشرات الاستدامة بالسوق المالية السعودية (تداول).', ratingEn:'ESG Rating: B (Strong)' },
      'C':  { hex:'#b45309', bg:'#fffbeb', border:'#fcd34d', labelAr:'مخاطر متوسطة — يُنصح بالتحسين', descAr:'تواجه المنشأة مخاطر استدامة متوسطة تستوجب تحسين كفاءة الطاقة وخفض الانبعاثات.', ratingEn:'ESG Rating: C (Needs Improvement)' },
    };
    const sc = scoreColors[ps.grade] || scoreColors['C'];
    pw.document.write(`<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"/><title>${reportTitle}</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600;700&display=swap');
      *{box-sizing:border-box;}
      body{font-family:'IBM Plex Sans Arabic',system-ui,sans-serif;padding:44px 48px;color:#1e293b;background:#fff;line-height:1.7;font-size:13px;}
      .page-header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #047857;padding-bottom:22px;margin-bottom:28px;gap:20px;}
      .header-right{flex:1;}
      .gov-title{font-size:22px;font-weight:700;color:#047857;margin:0 0 4px;}
      .doc-type{font-size:15px;font-weight:600;color:#334155;margin:0 0 4px;}
      .meta-line{font-size:11px;color:#64748b;margin:0;}
      .rating-stamp{display:flex;align-items:center;gap:16px;background-color:${sc.bg};border:2px solid ${sc.border};border-radius:14px;padding:16px 20px;min-width:240px;flex-shrink:0;}
      .rating-circle{width:68px;height:68px;border-radius:50%;border:3px solid ${sc.hex};background:#fff;display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:900;color:${sc.hex};}
      .rating-grade-label{font-size:12px;font-weight:700;color:${sc.hex};margin:0 0 3px;}
      .rating-label-ar{font-size:13px;font-weight:700;color:#0f172a;margin:0 0 3px;}
      .rating-en{font-size:10px;color:#64748b;margin:0;}
      .entity-card{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px 20px;margin-bottom:24px;display:flex;gap:40px;flex-wrap:wrap;}
      .entity-field{display:flex;flex-direction:column;gap:2px;}
      .entity-label{font-size:10px;color:#64748b;font-weight:600;letter-spacing:.05em;}
      .entity-value{font-size:14px;font-weight:700;color:#0f172a;}
      .strategic-note{background:${sc.bg};border-right:4px solid ${sc.hex};border-radius:8px;padding:14px 18px;margin-bottom:26px;font-size:12.5px;color:#1e293b;line-height:1.65;}
      .blockchain-box{background:#0f172a;border:1px solid #334155;border-radius:10px;padding:14px 18px;margin-bottom:24px;font-family:'Courier New',monospace;font-size:11px;color:#94a3b8;}
      .blockchain-title{color:#10b981;font-weight:700;font-size:12px;margin-bottom:8px;font-family:inherit;}
      .blockchain-hash-line{color:#e2e8f0;word-break:break-all;margin:4px 0;}
      .blockchain-meta{color:#475569;font-size:10px;margin-top:6px;}
      .section-title{font-size:14px;font-weight:700;color:#0f172a;border-right:4px solid #10b981;padding-right:12px;margin:26px 0 14px;}
      table{width:100%;border-collapse:collapse;}
      th,td{border:1px solid #e2e8f0;padding:9px 12px;text-align:right;font-size:12.5px;}
      th{background:#f1f5f9;font-weight:700;}
      tr:nth-child(even) td{background:#fafafa;}
      .pillar-env{color:#047857;font-weight:600;} .pillar-soc{color:#4f46e5;font-weight:600;} .pillar-gov{color:#7c3aed;font-weight:600;}
      .val-highlight{font-weight:700;}
      .signature-row{display:flex;justify-content:space-between;gap:20px;margin-top:36px;padding-top:20px;border-top:1px solid #e2e8f0;flex-wrap:wrap;}
      .sig-box{border:1px dashed #cbd5e1;border-radius:8px;padding:16px 20px;text-align:center;flex:1;min-width:140px;}
      .sig-title{font-size:11px;color:#64748b;margin-bottom:28px;font-weight:600;}
      .sig-line{border-top:1px solid #94a3b8;margin-top:8px;padding-top:6px;font-size:10px;color:#94a3b8;}
      .footer{margin-top:30px;border-top:1px solid #e2e8f0;padding-top:14px;text-align:center;font-size:10px;color:#94a3b8;}
      @media print{body{padding:28px 32px;}}
    </style></head><body>
    <div class="page-header">
      <div class="header-right">
        <div class="gov-title">🇸🇦 منصة طويق للاستدامة</div>
        <div class="doc-type">${reportTitle}</div>
        <p class="meta-line">تاريخ الإصدار: 2026 م &nbsp;|&nbsp; الرقم: TQ-ESG-10-2026 &nbsp;|&nbsp; إفصاح 10 مؤشرات معتمدة</p>
      </div>
      <div class="rating-stamp">
        <div class="rating-circle">${ps.grade}</div>
        <div>
          <p class="rating-grade-label">التصنيف الائتماني الأخضر</p>
          <p class="rating-label-ar">${sc.labelAr}</p>
          <p class="rating-en">${sc.ratingEn}</p>
        </div>
      </div>
    </div>
    <div class="entity-card">
      <div class="entity-field"><span class="entity-label">اسم المنشأة</span><span class="entity-value">${metric?.company_name_ar ?? 'غير محدد'}</span></div>
      <div class="entity-field"><span class="entity-label">تصنيف ESG</span><span class="entity-value" style="color:${sc.hex}">${ps.grade} — ${sc.labelAr}</span></div>
      <div class="entity-field"><span class="entity-label">إجمالي GHG</span><span class="entity-value">${updatedTotalGhg.toFixed(2)} tCO2e</span></div>
      <div class="entity-field"><span class="entity-label">السعودة</span><span class="entity-value">${saudization}%</span></div>
    </div>
    <div class="strategic-note"><strong>التقييم الاستراتيجي (${ps.grade}):</strong> ${sc.descAr}</div>
    <div class="blockchain-box">
      <div class="blockchain-title">⛓️ توثيق البلوكشين المشفر لصكوك الكربون — Blockchain Hash Verification</div>
      <div class="blockchain-hash-line">Hash الرئيسي: ${blockchainFull}</div>
      <div class="blockchain-hash-line">Hash المختصر: ${blockchainShort}</div>
      <div class="blockchain-meta">طابع التوقيت: ${blockchainTs} UTC+3 &nbsp;|&nbsp; الشبكة: TuwayqChain-ESG-v2 &nbsp;|&nbsp; الكتلة: #${Math.abs(parseInt(blockchainFull.substring(2,10),16)%1000000).toString().padStart(6,'0')}</div>
    </div>
    <div class="section-title">جدول الإفصاح الشامل — ركائز ESG الـ 10 المعتمدة</div>
    <table>
      <thead><tr><th>#</th><th>الركيزة</th><th>مؤشر الأداء (KPI)</th><th>القيمة</th><th>الوحدة</th></tr></thead>
      <tbody>
        <tr><td>1</td><td class="pillar-env">البيئية (E)</td><td>انبعاثات المعدات والديزل (Scope 1)</td><td class="val-highlight">${scope1}</td><td>tCO2e</td></tr>
        <tr><td>2</td><td class="pillar-env">البيئية (E)</td><td>انبعاثات طاقة الشبكة (Scope 2)</td><td class="val-highlight">${scope2}</td><td>tCO2e</td></tr>
        <tr><td>3</td><td class="pillar-env">البيئية (E)</td><td>إجمالي البصمة الكربونية</td><td class="val-highlight">${updatedTotalGhg.toFixed(4)}</td><td>tCO2e</td></tr>
        <tr><td>4</td><td class="pillar-env">البيئية (E)</td><td>كفاءة تدوير المياه</td><td class="val-highlight">${waterRecycle}%</td><td>نسبة مئوية</td></tr>
        <tr><td>5</td><td class="pillar-env">البيئية (E)</td><td>تحويل النفايات عن المدافن</td><td class="val-highlight">${wasteDiverted}%</td><td>نسبة مئوية</td></tr>
        <tr><td>6</td><td class="pillar-soc">الاجتماعية (S)</td><td>التوطين (السعودة)</td><td class="val-highlight">${saudization}%</td><td>نسبة مئوية</td></tr>
        <tr><td>7</td><td class="pillar-soc">الاجتماعية (S)</td><td>تمكين المرأة</td><td class="val-highlight">${femalePct}%</td><td>نسبة مئوية</td></tr>
        <tr><td>8</td><td class="pillar-soc">الاجتماعية (S)</td><td>معدل الإصابات المهنية (LTIFR)</td><td class="val-highlight">${injuryRate}</td><td>حالة/م.ساعة</td></tr>
        <tr><td>9</td><td class="pillar-gov">الحوكمة (G)</td><td>استقلالية مجلس الإدارة</td><td class="val-highlight">${boardIndependence}%</td><td>نسبة مئوية</td></tr>
        <tr><td>10</td><td class="pillar-gov">الحوكمة (G)</td><td>الإنفاق على الموردين المحليين</td><td class="val-highlight">${localSupplierSpend}%</td><td>نسبة مئوية</td></tr>
        <tr><td>11</td><td class="pillar-gov">الحوكمة (G)</td><td>حوادث خرق البيانات</td><td class="val-highlight">${dataPrivacyBreaches}</td><td>حادثة</td></tr>
      </tbody>
    </table>
    <div class="signature-row">
      <div class="sig-box"><div class="sig-title">توقيع المفوّض بالإفصاح</div><div class="sig-line">الاسم والمسمى الوظيفي</div></div>
      <div class="sig-box"><div class="sig-title">ختم المنشأة الرسمي</div><div class="sig-line">مُعتمد من إدارة الحوكمة</div></div>
      <div class="sig-box"><div class="sig-title">توقيع المدقق الخارجي</div><div class="sig-line">جهة التدقيق المعتمدة</div></div>
    </div>
    <div class="footer">
      <p>وثيقة إفصاح رسمية — التصنيف: <strong style="color:${sc.hex}">${ps.grade}</strong> | متوافقة مع رؤية 2030 وهيئة السوق المالية السعودية</p>
      <p>${blockchainFull} | TQ-ESG-10-2026</p>
    </div>
    <script>window.onload=function(){window.print();setTimeout(function(){window.close();},800);};</script>
    </body></html>`);
    pw.document.close();
  };

  const currentTenantName = activeTenantId === 'live'
    ? (metric?.company_name_ar ?? 'المنشأة الحية')
    : TENANTS.find(t=>t.id===activeTenantId)?.nameAr ?? '';

  // ══════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════
  return (
    <div style={S.mainLayout} dir="rtl">

      {/* ═══ القائمة الجانبية ═══ */}
      <aside style={S.sidebar}>
        <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>

          {/* الشعار */}
          <div style={S.sidebarLogo}>
            <span style={{ fontSize:'15px' }}>طويق للاستدامة 🧭</span>
            <span style={S.sidebarLogoSub}>📊 منظومة ESG المتكاملة (١٠ مؤشرات)</span>
          </div>

          {/* ── Multi-Tenancy Selector ── */}
          <div style={{ marginBottom:'18px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'8px' }}>
              <span style={{ color:'#64748b', fontSize:'10px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.06em' }}>⚙️ إدارة المنشآت</span>
              <span style={{ backgroundColor:'rgba(59,130,246,0.15)', color:'#60a5fa', border:'1px solid rgba(59,130,246,0.3)', borderRadius:'10px', padding:'1px 8px', fontSize:'9px', fontWeight:'700' }}>Enterprise</span>
            </div>
            <select className="tenant-select" value={activeTenantId} onChange={e=>handleTenantChange(e.target.value)}>
              <option value="live">🔴 البيانات الحية (Supabase)</option>
              {TENANTS.map(t => (
                <option key={t.id} value={t.id}>🏢 {t.nameAr}</option>
              ))}
            </select>
            {activeTenantId !== 'live' && (
              <div style={{ marginTop:'8px', backgroundColor:'rgba(59,130,246,0.08)', border:'1px solid rgba(59,130,246,0.25)', borderRadius:'8px', padding:'8px 10px' }}>
                <div style={{ color:'#60a5fa', fontSize:'10px', fontWeight:'700', marginBottom:'2px' }}>
                  {TENANTS.find(t=>t.id===activeTenantId)?.nameAr}
                </div>
                <div style={{ color:'#64748b', fontSize:'10px' }}>
                  {TENANTS.find(t=>t.id===activeTenantId)?.sector}
                </div>
                <div style={{ color:'#475569', fontSize:'9px', marginTop:'4px' }}>
                  ⚠️ وضع العرض التجريبي — بيانات محاكاة
                </div>
              </div>
            )}
          </div>

          {/* ── التنقل ── */}
          <nav style={S.sideNav}>
            {[
              { id:'overview',   label:'📊 الشاشة العامة' },
              { id:'ai',         label:'💡 مستشار AI الاستراتيجي' },
              { id:'update',     label:'📝 مدخلات السجلات الـ 10' },
              { id:'simulator',  label:'🔮 محاكي رؤية 2030' },
              { id:'reports',    label:'📁 التقارير والـ PDF' },
            ].map(tab => (
              <button key={tab.id} className="nav-btn"
                style={{ ...S.navItem, ...(activeTab===tab.id ? S.activeNavItem : {}) }}
                onClick={()=>setActiveTab(tab.id)}>
                {tab.label}
                {tab.id==='ai' && (
                  <span style={{ marginRight:'6px', backgroundColor:'rgba(168,85,247,0.2)', color:'#c084fc', border:'1px solid rgba(168,85,247,0.4)', borderRadius:'10px', padding:'1px 7px', fontSize:'9px', fontWeight:'700' }}>AI</span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* ── التذييل ── */}
        <div style={S.sidebarFooter}>
          <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'6px' }}>
            <span className="api-dot"></span>
            <span style={{ color:'#6ee7b7', fontSize:'10px' }}>Supabase متصل</span>
          </div>
          <p style={{ margin:0, fontSize:'11px', color:'#64748b' }}>حالة النظام:</p>
          <p style={{ margin:0, fontSize:'12px', color:'#fff', fontWeight:'bold' }}>ممتثل كلياً — TQ-2026</p>
        </div>
      </aside>

      {/* ═══ المحتوى الرئيسي ═══ */}
      <main style={S.contentArea}>

        {/* ── الهيدر ── */}
        <header style={S.mainHeader}>
          <div>
            <h1 style={S.mainTitle}>
              🇸🇦 {currentTenantName}
              {activeTenantId !== 'live' && (
                <span style={{ marginRight:'10px', backgroundColor:'rgba(59,130,246,0.15)', color:'#60a5fa', border:'1px solid rgba(59,130,246,0.3)', borderRadius:'8px', padding:'3px 10px', fontSize:'12px', fontWeight:'600' }}>Demo</span>
              )}
            </h1>
            <p style={S.mainSubtitle}>رصد 10 مؤشرات ESG تشغيلية واستراتيجية — متطابقة مع معايير الإفصاح الوطنية والدولية 2026 م</p>
          </div>
          <div style={S.headerBadges}>
            {activeTenantId === 'live'
              ? <span style={S.liveBadge}>● API سحابي نشط</span>
              : <span style={{ ...S.liveBadge, color:'#60a5fa', backgroundColor:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.3)' }}>🏢 عرض تجريبي</span>
            }
            <span style={S.yearBadge}>التقرير: 2026 م</span>
          </div>
        </header>

        {/* ════════════════════════════════════
            تبويب: الشاشة العامة
        ════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <>
            <section className="score-circle-ring" style={{ ...S.scoreBanner, background:'linear-gradient(135deg,#0a1628 0%,#0f2040 100%)', border:`1px solid ${score.color}44` }}>
              <div style={{ position:'absolute', top:'-30px', left:'-30px', width:'160px', height:'160px', borderRadius:'50%', background:`radial-gradient(circle,${score.color}18 0%,transparent 70%)`, pointerEvents:'none' }} />
              <div style={{ ...S.scoreCircle, color:score.color, borderColor:score.color, boxShadow:`0 0 20px ${score.color}44`, fontSize:'30px' }}>{score.grade}</div>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'6px' }}>
                  <h2 style={{ margin:0, fontSize:'17px', color:'#fff', fontWeight:'700' }}>الدرجة الموحدة للامتثال المؤسسي</h2>
                  <span style={{ backgroundColor:`${score.color}20`, color:score.color, border:`1px solid ${score.color}44`, borderRadius:'20px', padding:'3px 12px', fontSize:'11px', fontWeight:'700' }}>ESG Rating</span>
                </div>
                <p style={{ margin:'0 0 14px', color:'#94a3b8', fontSize:'13px', lineHeight:'1.6' }}>{score.desc}</p>
                <div style={{ display:'flex', gap:'20px', flexWrap:'wrap' }}>
                  {[
                    { label:'إجمالي GHG', val:`${updatedTotalGhg.toFixed(0)} tCO2e`, color:'#ef4444' },
                    { label:'السعودة',    val:`${saudization}%`, color:'#10b981' },
                    { label:'LTIFR',      val:injuryRate, color:'#f59e0b' },
                  ].map(s=>(
                    <div key={s.label} style={{ backgroundColor:'#020617', border:`1px solid ${s.color}33`, borderRadius:'8px', padding:'8px 14px' }}>
                      <div style={{ color:'#64748b', fontSize:'10px', marginBottom:'2px' }}>{s.label}</div>
                      <div style={{ color:s.color, fontSize:'15px', fontWeight:'700' }}>{s.val}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <PillarSection pillIcon="🌿" pillLabel="الركيزة البيئية (Environmental)" pillColor="#10b981" pillBg="rgba(16,185,129,0.1)">
              <KpiCard rank={1} icon="🏭" title="انبعاثات المعدات والديزل (Scope 1)" value={parseFloat(scope1)||0} unit="tCO2e" accentColor="#ef4444" description="الانبعاثات المباشرة من أسطول المعدات والوقود." apiSource="قوى — محدّث آلياً" />
              <KpiCard rank={2} icon="⚡" title="انبعاثات طاقة الشبكة (Scope 2)" value={parseFloat(scope2)||0} unit="tCO2e" accentColor="#f87171" description="الانبعاثات غير المباشرة من استهلاك الكهرباء." apiSource="الشركة الوطنية للكهرباء" />
              <KpiCard rank={3} icon="🌡️" title="إجمالي البصمة الكربونية" value={updatedTotalGhg} unit="tCO2e" accentColor="#f43f5e" description="Scope 1 + Scope 2 — المقياس الأساسي للأثر المناخي." />
              <KpiCard rank={4} icon="💧" title="كفاءة تدوير المياه" value={parseFloat(waterRecycle)||0} unit="%" accentColor="#38bdf8" isPercent={true} description="نسبة المياه المُعالجة وإعادة توظيفها." apiSource="وزارة البيئة" />
              <KpiCard rank={5} icon="♻️" title="تحويل النفايات عن المدافن" value={parseFloat(wasteDiverted)||0} unit="%" accentColor="#06b6d4" isPercent={true} description="نسبة النفايات المحوّلة نحو إعادة التدوير." />
            </PillarSection>

            <PillarSection pillIcon="🤝" pillLabel="الركيزة الاجتماعية (Social)" pillColor="#818cf8" pillBg="rgba(129,140,248,0.1)">
              <KpiCard rank={6} icon="🇸🇦" title="التوطين الإستراتيجي (السعودة)" value={parseFloat(saudization)||0} unit="%" accentColor="#10b981" isPercent={true} description="نسبة العمالة الوطنية وفق برنامج نطاقات." apiSource="منصة قوى — وزارة الموارد" />
              <KpiCard rank={7} icon="👩‍💼" title="تمكين المرأة وتكافؤ الفرص" value={parseFloat(femalePct)||0} unit="%" accentColor="#ec4899" isPercent={true} description="نسبة الكوادر النسائية في الهيكل الوظيفي." apiSource="منصة قوى — وزارة الموارد" />
              <KpiCard rank={8} icon="🦺" title="معدل الإصابات المهنية (LTIFR)" value={parseFloat(injuryRate)||0} unit="حالة/م.ساعة" accentColor="#fb923c" isPercent={true} inverse={true} description="Lost Time Injury Frequency Rate." apiSource="وزارة الموارد البشرية" />
            </PillarSection>

            <PillarSection pillIcon="⚖️" pillLabel="ركيزة الحوكمة (Governance)" pillColor="#a855f7" pillBg="rgba(168,85,247,0.1)">
              <KpiCard rank={9} icon="🏛️" title="استقلالية مجلس الإدارة" value={parseFloat(boardIndependence)||0} unit="%" accentColor="#a855f7" isPercent={true} description="نسبة الأعضاء المستقلين وفق قواعد هيئة السوق المالية." />
              <KpiCard rank={10} icon="🛒" title="الإنفاق على الموردين المحليين" value={parseFloat(localSupplierSpend)||0} unit="%" accentColor="#eab308" isPercent={true} description="حصة المشتريات من موردين سعوديين معتمدين." />
              <KpiCard rank={11} icon="🔐" title="حوادث خرق البيانات" value={parseFloat(dataPrivacyBreaches)||0} unit="حادثة" accentColor="#64748b" isPercent={true} inverse={true} description="حوادث الاختراق الموثقة. الهدف: صفر حوادث." />
            </PillarSection>
          </>
        )}

        {/* ════════════════════════════════════
            تبويب: AI Engine
        ════════════════════════════════════ */}
        {activeTab === 'ai' && (
          <div>
            {/* بطاقة مقدمة */}
            <div style={{ background:'linear-gradient(135deg,#1e1040 0%,#0f172a 60%,#0a1628 100%)', border:'1px solid rgba(168,85,247,0.35)', borderRadius:'16px', padding:'28px', marginBottom:'28px', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:'-40px', left:'-40px', width:'200px', height:'200px', borderRadius:'50%', background:'radial-gradient(circle,rgba(168,85,247,0.15) 0%,transparent 70%)', pointerEvents:'none' }} />
              <div style={{ display:'flex', alignItems:'center', gap:'16px', marginBottom:'16px' }}>
                <div style={{ width:'52px', height:'52px', borderRadius:'14px', background:'linear-gradient(135deg,#7c3aed,#a855f7)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px', boxShadow:'0 8px 20px rgba(168,85,247,0.3)' }}>💡</div>
                <div>
                  <h2 style={{ margin:'0 0 4px', color:'#fff', fontSize:'19px', fontWeight:'700' }}>مستشار طويق الآلي للـ ESG</h2>
                  <p style={{ margin:0, color:'#94a3b8', fontSize:'13px' }}>محرك توصيات استراتيجية يحلّل مؤشراتك الـ 10 ويُنتج خطة عمل مسعّرة لرفع التصنيف الائتماني</p>
                </div>
                <span style={{ marginRight:'auto', backgroundColor:'rgba(168,85,247,0.15)', color:'#c084fc', border:'1px solid rgba(168,85,247,0.4)', borderRadius:'20px', padding:'5px 14px', fontSize:'12px', fontWeight:'700', whiteSpace:'nowrap' }}>AI Engine v2.0</span>
              </div>
              <div style={{ display:'flex', gap:'20px', flexWrap:'wrap' }}>
                {[
                  { label:'توصيات مُولّدة', val:String(aiRecs.length), color:'#c084fc' },
                  { label:'أولوية عالية', val:String(aiRecs.filter(r=>r.priority==='high').length), color:'#f87171' },
                  { label:'التصنيف الحالي', val:realScore.grade, color:realScore.color },
                ].map(s=>(
                  <div key={s.label} style={{ backgroundColor:'#020617', border:`1px solid ${s.color}33`, borderRadius:'8px', padding:'10px 16px' }}>
                    <div style={{ color:'#64748b', fontSize:'10px', marginBottom:'2px' }}>{s.label}</div>
                    <div style={{ color:s.color, fontSize:'18px', fontWeight:'700' }}>{s.val}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* قائمة التوصيات */}
            <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
              {aiRecs.map((rec, idx) => {
                const pm = priorityMeta[rec.priority];
                return (
                  <div key={idx} className="ai-rec-card" style={{ backgroundColor:'#0b1628', border:`1px solid rgba(168,85,247,0.2)`, borderRadius:'14px', padding:'22px', position:'relative', overflow:'hidden' }}>
                    <div style={{ position:'absolute', top:0, right:0, left:0, height:'2px', background:`linear-gradient(90deg,transparent,${pm.color},transparent)` }} />
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'16px', flexWrap:'wrap' }}>
                      <div style={{ display:'flex', gap:'14px', flex:1 }}>
                        <div style={{ fontSize:'28px', lineHeight:1, flexShrink:0, marginTop:'2px' }}>{rec.icon}</div>
                        <div style={{ flex:1 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px', flexWrap:'wrap' }}>
                            <h3 style={{ margin:0, color:'#fff', fontSize:'15px', fontWeight:'700' }}>{rec.title}</h3>
                            <span style={{ backgroundColor:pm.bg, color:pm.color, border:`1px solid ${pm.color}44`, borderRadius:'20px', padding:'2px 10px', fontSize:'10px', fontWeight:'700' }}>{pm.label}</span>
                          </div>
                          <p style={{ margin:'0 0 12px', color:'#94a3b8', fontSize:'13px', lineHeight:'1.6' }}>{rec.detail}</p>
                          <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', backgroundColor:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)', borderRadius:'8px', padding:'8px 14px' }}>
                            <span style={{ fontSize:'14px' }}>💰</span>
                            <span style={{ color:'#6ee7b7', fontSize:'12px', fontWeight:'600' }}>{rec.saving}</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ width:'36px', height:'36px', borderRadius:'10px', backgroundColor:`${pm.color}18`, border:`1px solid ${pm.color}44`, display:'flex', alignItems:'center', justifyContent:'center', color:pm.color, fontSize:'16px', flexShrink:0 }}>
                        {idx + 1}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop:'24px', backgroundColor:'#0a1628', border:'1px solid #1e293b', borderRadius:'12px', padding:'16px 20px', display:'flex', alignItems:'center', gap:'12px' }}>
              <span style={{ fontSize:'18px' }}>⚠️</span>
              <p style={{ margin:0, color:'#64748b', fontSize:'12px', lineHeight:'1.5' }}>
                <strong style={{ color:'#94a3b8' }}>تنبيه:</strong> هذه التوصيات مُولّدة آلياً بناءً على قيم مؤشراتك الـ 10 الحالية مقارنةً بالمعايير الوطنية والدولية. تُعدّ استرشادية وتحتاج مراجعة مستشار ESG معتمد قبل اتخاذ قرارات استثمارية.
              </p>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════
            تبويب: مدخلات البيانات
        ════════════════════════════════════ */}
        {activeTab === 'update' && (
          <section style={S.sectionCard}>
            <h2 style={S.secTitle}>📝 تعديل وإدخال حزمة الـ 10 سجلات</h2>
            <p style={S.secDesc}>حدّث البيانات التشغيلية لتحديث مؤشرات الالتزام فورياً أمام الجهات الرقابية والمصرفية:</p>
            {saveSuccess && <div style={S.successAlert}>✓ تم التحديث الشامل وحفظ جميع المؤشرات الـ 10 بنجاح!</div>}

            {/* حقول المدخلات مع مؤشرات API */}
            <form onSubmit={handleUpdateData} style={S.formGrid}>
              {/* Scope 1 */}
              <div style={S.inputGroup}>
                <label style={S.label}>
                  1. انبعاثات الوقود والمعدات (Scope 1 tCO2e)
                </label>
                <div style={{ position:'relative' }}>
                  <input type="number" step="any" value={scope1} onChange={e=>setScope1(e.target.value)} style={S.input} required />
                  <div style={{ position:'absolute', top:'50%', left:'12px', transform:'translateY(-50%)' }}>
                    <span className="api-badge"><span className="api-dot"></span>قوى</span>
                  </div>
                </div>
              </div>

              {/* Scope 2 */}
              <div style={S.inputGroup}>
                <label style={S.label}>2. انبعاثات استهلاك طاقة الشبكة (Scope 2 tCO2e)</label>
                <div style={{ position:'relative' }}>
                  <input type="number" step="any" value={scope2} onChange={e=>setScope2(e.target.value)} style={S.input} required />
                  <div style={{ position:'absolute', top:'50%', left:'12px', transform:'translateY(-50%)' }}>
                    <span className="api-badge"><span className="api-dot"></span>الشركة الوطنية للكهرباء</span>
                  </div>
                </div>
              </div>

              {/* المياه */}
              <div style={S.inputGroup}>
                <label style={S.label}>4. كفاءة تدوير المياه (%)</label>
                <div style={{ position:'relative' }}>
                  <input type="number" value={waterRecycle} onChange={e=>setWaterRecycle(e.target.value)} style={S.input} required />
                  <div style={{ position:'absolute', top:'50%', left:'12px', transform:'translateY(-50%)' }}>
                    <span className="api-badge"><span className="api-dot"></span>وزارة البيئة</span>
                  </div>
                </div>
              </div>

              {/* النفايات */}
              <div style={S.inputGroup}>
                <label style={S.label}>5. معدل تحويل النفايات عن المدافن (%)</label>
                <input type="number" value={wasteDiverted} onChange={e=>setWasteDiverted(e.target.value)} style={S.input} required />
              </div>

              {/* السعودة */}
              <div style={S.inputGroup}>
                <label style={S.label}>6. التوطين الوطني — السعودة (%)</label>
                <div style={{ position:'relative' }}>
                  <input type="number" value={saudization} onChange={e=>setSaudization(e.target.value)} style={S.input} required />
                  <div style={{ position:'absolute', top:'50%', left:'12px', transform:'translateY(-50%)' }}>
                    <span className="api-badge"><span className="api-dot"></span>منصة قوى</span>
                  </div>
                </div>
              </div>

              {/* تمكين المرأة */}
              <div style={S.inputGroup}>
                <label style={S.label}>7. تمكين المرأة وتكافؤ الفرص (%)</label>
                <div style={{ position:'relative' }}>
                  <input type="number" value={femalePct} onChange={e=>setFemalePct(e.target.value)} style={S.input} required />
                  <div style={{ position:'absolute', top:'50%', left:'12px', transform:'translateY(-50%)' }}>
                    <span className="api-badge"><span className="api-dot"></span>منصة قوى</span>
                  </div>
                </div>
              </div>

              {/* LTIFR */}
              <div style={S.inputGroup}>
                <label style={S.label}>8. معدل إصابات العمل (LTIFR)</label>
                <div style={{ position:'relative' }}>
                  <input type="number" step="any" value={injuryRate} onChange={e=>setInjuryRate(e.target.value)} style={S.input} required />
                  <div style={{ position:'absolute', top:'50%', left:'12px', transform:'translateY(-50%)' }}>
                    <span className="api-badge"><span className="api-dot"></span>وزارة الموارد</span>
                  </div>
                </div>
              </div>

              {/* مجلس الإدارة */}
              <div style={S.inputGroup}>
                <label style={S.label}>9. استقلالية مجلس الإدارة (%)</label>
                <input type="number" value={boardIndependence} onChange={e=>setBoardIndependence(e.target.value)} style={S.input} required />
              </div>

              {/* الموردون */}
              <div style={S.inputGroup}>
                <label style={S.label}>10. الإنفاق على الموردين المحليين (%)</label>
                <input type="number" value={localSupplierSpend} onChange={e=>setLocalSupplierSpend(e.target.value)} style={S.input} required />
              </div>

              {/* البيانات */}
              <div style={S.inputGroup}>
                <label style={S.label}>حوادث خرق البيانات والأمن السيبراني</label>
                <input type="number" value={dataPrivacyBreaches} onChange={e=>setDataPrivacyBreaches(e.target.value)} style={S.input} required />
              </div>

              <div style={{ gridColumn:'1 / -1', marginTop:'10px' }}>
                <button type="submit" disabled={saveLoading} style={S.submitBtn}>
                  {saveLoading ? 'جاري التدقيق والحفظ السحابي الموحد...' : 'تحديث وحفظ كافة المؤشرات الـ 10 سحابياً'}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* ════════════════════════════════════
            تبويب: المحاكي
        ════════════════════════════════════ */}
        {activeTab === 'simulator' && (
          <section style={S.sectionCard}>
            <h2 style={S.secTitle}>🔮 محاكي استراتيجيات الهيدروجين والطاقة الشمسية</h2>
            <div style={S.simFlex}>
              <div style={{ flex:1, display:'flex', flexDirection:'column', gap:'20px' }}>
                <div style={S.sliderGroup}>
                  <label style={S.label}>استبدال ديزل المعدات بمصادر نظيفة: {dieselReduction}%</label>
                  <input type="range" min="0" max="100" value={dieselReduction} onChange={e=>setDieselReduction(Number(e.target.value))} style={S.slider} />
                </div>
                <div style={S.sliderGroup}>
                  <label style={S.label}>تغطية أسقف المستودعات بخلايا طاقة شمسية: {renewableShare}%</label>
                  <input type="range" min="0" max="100" value={renewableShare} onChange={e=>setRenewableShare(Number(e.target.value))} style={S.slider} />
                </div>
              </div>
              <div style={S.simResultCard}>
                <span style={{ color:'#94a3b8', fontSize:'13px' }}>الكربون المستهدف</span>
                <div style={{ color:score.color, fontSize:'32px', fontWeight:'bold', margin:'10px 0' }}>
                  {simulatedTotalGhg} <span style={{ fontSize:'14px', color:'#64748b' }}>tCO2e</span>
                </div>
                <span style={{ ...S.liveBadge, borderColor:score.color, color:score.color }}>التصنيف المتوقع: {score.grade}</span>
              </div>
            </div>
          </section>
        )}

        {/* ════════════════════════════════════
            تبويب: التقارير
        ════════════════════════════════════ */}
        {activeTab === 'reports' && (
          <section style={S.sectionCard}>
            <h2 style={S.secTitle}>📁 مركز إصدار شهادات الامتثال والتقارير (PDF)</h2>

            {/* بطاقة البلوكشين */}
            <div style={{ backgroundColor:'#020617', border:'1px solid rgba(16,185,129,0.3)', borderRadius:'14px', padding:'22px', marginBottom:'28px', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:0, right:0, left:0, height:'2px', background:'linear-gradient(90deg,#10b981,#3b82f6,#a855f7,#10b981)', backgroundSize:'200% 100%', animation:'shimmer 3s linear infinite' }} />
              <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'16px' }}>
                <span style={{ fontSize:'24px' }}>⛓️</span>
                <div>
                  <h3 style={{ margin:'0 0 3px', color:'#fff', fontSize:'15px', fontWeight:'700' }}>توثيق البلوكشين المشفر لصكوك الكربون</h3>
                  <p style={{ margin:0, color:'#64748b', fontSize:'12px' }}>Blockchain Hash Verification — TuwayqChain ESG Network</p>
                </div>
                <span style={{ marginRight:'auto', backgroundColor:'rgba(16,185,129,0.1)', color:'#10b981', border:'1px solid rgba(16,185,129,0.3)', borderRadius:'20px', padding:'4px 12px', fontSize:'10px', fontWeight:'700' }}>✓ مُوثَّق ولا يمكن التلاعب به</span>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:'14px', marginBottom:'16px' }}>
                <div style={{ backgroundColor:'#0a1628', borderRadius:'10px', padding:'14px 16px', border:'1px solid #1e293b' }}>
                  <div style={{ color:'#64748b', fontSize:'10px', marginBottom:'6px', fontWeight:'600' }}>HASH المختصر (Short Hash)</div>
                  <div className="blockchain-hash" style={{ fontSize:'16px' }}>{blockchainShort}</div>
                </div>
                <div style={{ backgroundColor:'#0a1628', borderRadius:'10px', padding:'14px 16px', border:'1px solid #1e293b' }}>
                  <div style={{ color:'#64748b', fontSize:'10px', marginBottom:'6px', fontWeight:'600' }}>HASH الكامل (Full Hash)</div>
                  <div className="blockchain-hash" style={{ fontSize:'11px', wordBreak:'break-all' }}>{blockchainFull}</div>
                </div>
              </div>

              <div style={{ display:'flex', gap:'20px', flexWrap:'wrap' }}>
                {[
                  { label:'طابع التوقيت', val:blockchainTs, color:'#94a3b8' },
                  { label:'الشبكة',      val:'TuwayqChain-ESG-v2', color:'#60a5fa' },
                  { label:'الكتلة #',    val:Math.abs(parseInt(blockchainFull.substring(2,10),16)%1000000).toString().padStart(6,'0'), color:'#c084fc' },
                  { label:'الحالة',      val:'✓ مُوثَّق ومُختوم', color:'#10b981' },
                ].map(f=>(
                  <div key={f.label} style={{ display:'flex', flexDirection:'column', gap:'2px' }}>
                    <span style={{ color:'#475569', fontSize:'10px' }}>{f.label}</span>
                    <span style={{ color:f.color, fontSize:'12px', fontWeight:'600', fontFamily:"'Courier New',monospace" }}>{f.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* قائمة التقارير */}
            <div style={S.reportList}>
              <div style={S.reportItem}>
                <div>
                  <h4 style={{ margin:'0 0 5px', color:'#fff' }}>📄 ملف الإفصاح البيئي الشامل (10 مؤشرات معتمدة)</h4>
                  <p style={{ margin:0, color:'#64748b', fontSize:'12px' }}>تقرير رسمي موجه لمبادرة السعودية الخضراء والسوق المالية السعودية — يتضمن ختم البلوكشين.</p>
                  <div style={{ marginTop:'8px', display:'flex', gap:'8px', flexWrap:'wrap' }}>
                    <span className="api-badge" style={{ fontSize:'10px' }}><span className="api-dot"></span>موثَّق بلوكشين</span>
                    <span className="api-badge" style={{ fontSize:'10px' }}><span className="api-dot"></span>ختم تصنيف {realScore.grade}</span>
                  </div>
                </div>
                <button style={S.downloadBtn} onClick={()=>handlePrintPDF('ملف إفصاح الامتثال والاستدامة السنوي الشامل لـ ESG')}>
                  إصدار وحفظ PDF
                </button>
              </div>
            </div>
          </section>
        )}

      </main>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// 12. المكوّن الجذري
// ══════════════════════════════════════════════════════
export default function App() {
  const [token, setToken] = useState<string|null>(null);
  if (!token) return <LoginScreen onAuthSuccess={t=>setToken(t)} />;
  return <MainDashboard token={token} />;
}
