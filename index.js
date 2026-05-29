const express = require('express');
const app = express();

const htmlContent = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <title>منصة طويق السيادية</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;600;700&display=swap');
        body { background-color: #020617; color: #f1f5f9; font-family: 'IBM Plex Sans Arabic', sans-serif; margin: 0; display: flex; height: 100vh; overflow: hidden; }
        aside { width: 280px; background: #0a1628; border-left: 1px solid #1e293b; padding: 25px; }
        .nav-btn { width: 100%; padding: 12px; margin-bottom: 8px; border: none; border-radius: 8px; background: transparent; color: #94a3b8; text-align: right; cursor: pointer; font-weight: bold; }
        .nav-btn:hover, .nav-btn.active { background: #1e293b; color: #10b981; }
        main { flex: 1; padding: 40px; overflow-y: auto; }
        .card { background: rgba(15, 23, 42, 0.6); border: 1px solid #1e293b; border-radius: 16px; padding: 24px; margin-bottom: 20px; }
        .status-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; margin-left: 5px; }
        #chat-container { position: fixed; bottom: 80px; left: 30px; width: 340px; height: 400px; background: #0a1628; border: 1px solid #8b5cf6; border-radius: 16px; display: none; flex-direction: column; z-index: 1000; }
    </style>
</head>
<body>

    <aside>
        <h2 style="color: #10b981;">طويق السيادية 🇸🇦</h2>
        <select id="company-select" onchange="updateDashboard()" style="width: 100%; padding: 10px; background: #020617; color: #fff; border: 1px solid #3b82f6; border-radius: 8px;">
            <option>أرامكو السعودية</option>
            <option>سابك</option>
            <option>معادن</option>
        </select>
        <nav style="margin-top: 20px;">
            <button class="nav-btn active" onclick="show('overview')">📊 مركز القيادة</button>
            <button class="nav-btn" onclick="show('sectors')">🏭 الخريطة الحرارية</button>
        </nav>
    </aside>

    <main id="content">
        <div id="overview">
            <h1>لوحة التحكم: <span id="comp-name">أرامكو السعودية</span></h1>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
                <div class="card"><h3>الانبعاثات</h3><p id="ghg-val">1450.5 tCO2e</p></div>
                <div class="card"><h3>السعودة</h3><p id="saud-val" style="color:#10b981">75%</p></div>
                <div class="card"><h3>المياه</h3><p id="water-val" style="color:#38bdf8">85%</p></div>
            </div>
        </div>
        <div id="sectors" style="display:none">
            <h2>الخريطة الحرارية للقطاعات</h2>
            <div id="sectors-list"></div>
        </div>
    </main>

    <div id="chat-container">
        <div style="background:#8b5cf6; padding:15px; color:#fff;">🧠 مساعد طويق الذكي</div>
        <div id="chat-box" style="flex:1; padding:10px; overflow-y:auto; font-size:13px;">مرحباً! كيف أساعدك؟</div>
        <input id="chat-input" style="padding:10px; background:#020617; color:#fff; border:none;">
    </div>

    <button onclick="document.getElementById('chat-container').style.display='flex'" style="position:fixed; bottom:20px; left:30px; width:60px; height:60px; border-radius:30px; background:#8b5cf6; border:none; color:#fff; font-size:24px;">🤖</button>

    <script>
        const data = {
            "أرامكو السعودية": { ghg: 1450.5, saud: 75, water: 85, sectors: ["الظهران: نشط", "رأس تنورة: تحذير"] },
            "سابك": { ghg: 2100.0, saud: 72, water: 78, sectors: ["الجبيل: نشط", "ينبع: خطر"] },
            "معادن": { ghg: 3200.8, saud: 58, water: 60, sectors: ["وعد الشمال: تحذير", "رأس الخير: خطر"] }
        };

        function updateDashboard() {
            const val = document.getElementById('company-select').value;
            document.getElementById('comp-name').innerText = val;
            document.getElementById('ghg-val').innerText = data[val].ghg + ' tCO2e';
            document.getElementById('saud-val').innerText = data[val].saud + '%';
            document.getElementById('water-val').innerText = data[val].water + '%';
            
            const list = document.getElementById('sectors-list');
            list.innerHTML = data[val].sectors.map(s => '<div class="card">' + s + '</div>').join('');
        }

        function show(tab) {
            document.getElementById('overview').style.display = tab === 'overview' ? 'block' : 'none';
            document.getElementById('sectors').style.display = tab === 'sectors' ? 'block' : 'none';
        }
    </script>
</body>
</html>
`;

app.get('/', (req, res) => res.send(htmlContent));
module.exports = app;
