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
        
        /* القائمة الجانبية */
        aside { width: 280px; background: #0a1628; border-left: 1px solid #1e293b; padding: 25px; }
        .nav-btn { width: 100%; padding: 12px; margin-bottom: 8px; border: none; border-radius: 8px; background: transparent; color: #94a3b8; text-align: right; cursor: pointer; font-weight: bold; transition: 0.3s; }
        .nav-btn:hover, .nav-btn.active { background: #1e293b; color: #10b981; }

        /* المحتوى */
        main { flex: 1; padding: 40px; overflow-y: auto; }
        .card { background: rgba(15, 23, 42, 0.6); border: 1px solid #1e293b; border-radius: 16px; padding: 24px; margin-bottom: 20px; }
        
        /* الشات بوت */
        #chat-container { position: fixed; bottom: 30px; left: 30px; width: 340px; height: 420px; background: #0a1628; border: 1px solid #8b5cf6; border-radius: 16px; display: none; flex-direction: column; overflow: hidden; }
        #chat-box { flex: 1; padding: 15px; overflow-y: auto; color: #fff; font-size: 13px; }
    </style>
</head>
<body>

    <aside>
        <h2 style="color: #10b981;">طويق السيادية 🇸🇦</h2>
        <nav>
            <button class="nav-btn active" onclick="show('overview')">📊 مركز القيادة</button>
            <button class="nav-btn" onclick="show('reports')">🔗 صكوك الكربون</button>
        </nav>
    </aside>

    <main id="content">
        <div class="card">
            <h1>لوحة التحكم: أرامكو السعودية</h1>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
                <div class="card"><h3>الانبعاثات</h3><p>1450.5 tCO2e</p></div>
                <div class="card"><h3>السعودة</h3><p style="color: #10b981;">75%</p></div>
                <div class="card"><h3>استهلاك المياه</h3><p style="color: #38bdf8;">85%</p></div>
            </div>
        </div>
    </main>

    <div id="chat-container">
        <div style="background: #8b5cf6; padding: 15px; color: #fff; font-weight: bold;">🧠 مساعد طويق الذكي</div>
        <div id="chat-box">مرحباً! كيف أساعدك في تحسين أداء المنشأة؟</div>
        <div style="padding: 10px; display: flex;">
            <input id="chat-input" style="flex:1; background:#020617; color:#fff; border:1px solid #334155; padding:8px;">
            <button onclick="sendChat()" style="background:#8b5cf6; border:none; color:#fff; padding:0 15px;">إرسال</button>
        </div>
    </div>

    <button onclick="document.getElementById('chat-container').style.display='flex'" style="position:fixed; bottom:30px; left:30px; width:60px; height:60px; border-radius:30px; background:#8b5cf6; border:none; color:#fff; font-size:24px;">🤖</button>

    <script>
        function show(tab) {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            event.target.classList.add('active');
            // هنا تضاف منطق تبديل المحتوى
        }
        function sendChat() {
            const input = document.getElementById('chat-input');
            const box = document.getElementById('chat-box');
            box.innerHTML += '<div style="margin-bottom:10px;">أنت: ' + input.value + '</div>';
            box.innerHTML += '<div style="margin-bottom:10px; color:#10b981;">المساعد: جاري التحليل... نسبة السعودة ممتازة!</div>';
            input.value = '';
            box.scrollTop = box.scrollHeight;
        }
    </script>
</body>
</html>
`;

app.get('/', (req, res) => res.send(htmlContent));
module.exports = app;
