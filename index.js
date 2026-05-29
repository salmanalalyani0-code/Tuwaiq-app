const express = require('express');
const app = express();

const htmlContent = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>منصة إدارة الشركات</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; }
        /* تصميم شاشة الدخول */
        #login-screen { display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #2c3e50; }
        .login-box { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); width: 300px; text-align: center; }
        .login-box h2 { margin-bottom: 20px; color: #333; }
        input { width: 90%; padding: 12px; margin: 10px 0; border: 1px solid #ccc; border-radius: 5px; font-size: 16px; }
        button { width: 100%; padding: 12px; margin-top: 10px; background-color: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; font-weight: bold; }
        button:hover { background-color: #2980b9; }
        
        /* تصميم لوحة التحكم */
        #dashboard { display: none; flex-direction: column; height: 100vh; }
        header { background: #2c3e50; color: white; padding: 15px 20px; text-align: right; }
        .container { display: flex; flex: 1; overflow: hidden; }
        nav { width: 250px; background: #ecf0f1; padding: 20px; border-left: 1px solid #bdc3c7; }
        nav ul { list-style: none; padding: 0; margin: 0; }
        nav ul li { margin-bottom: 15px; cursor: pointer; padding: 12px; background: #fff; border-radius: 5px; text-align: right; border: 1px solid #dcdde1; font-weight: bold; color: #2c3e50; transition: 0.3s; }
        nav ul li:hover { background: #3498db; color: white; }
        .logout-btn { background: #e74c3c !important; color: white !important; }
        
        main { flex: 1; padding: 30px; overflow-y: auto; background: #fdfdfd; }
        .card { background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); margin-bottom: 20px; border: 1px solid #eee; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: right; }
        th { background-color: #f8f9fa; color: #333; }
        .export-btn { background-color: #27ae60; width: auto; padding: 10px 20px; }
        .export-btn:hover { background-color: #2ecc71; }
        .hidden { display: none !important; }
    </style>
</head>
<body>

    <!-- شاشة تسجيل الدخول -->
    <div id="login-screen">
        <div class="login-box">
            <h2>تسجيل الدخول للمنصة</h2>
            <input type="text" id="username" placeholder="اسم المستخدم (admin)" value="admin">
            <input type="password" id="password" placeholder="كلمة المرور (123)" value="123">
            <button onclick="login()">تسجيل الدخول</button>
            <p id="error-msg" style="color:red; display:none; margin-top:15px;">بيانات الدخول خاطئة!</p>
        </div>
    </div>

    <!-- لوحة التحكم (المنصة) -->
    <div id="dashboard" class="hidden">
        <header>
            <h2 style="margin: 0;">المنصة الإدارية الشاملة</h2>
        </header>
        <div class="container">
            <nav>
                <ul>
                    <li onclick="showSection('companies')">🏢 إدارة الشركات</li>
                    <li onclick="showSection('reports')">📊 التقارير والإحصائيات</li>
                    <li onclick="logout()" class="logout-btn">🚪 تسجيل خروج</li>
                </ul>
            </nav>
            <main>
                <!-- قسم الشركات -->
                <div id="companies-section" class="card">
                    <h3>قائمة الشركات المسجلة</h3>
                    <p>هنا يمكنك استعراض كافة الشركات وإدارتها.</p>
                    <table>
                        <tr><th>رقم الشركة</th><th>اسم الشركة</th><th>تاريخ التسجيل</th><th>الحالة</th></tr>
                        <tr><td>101</td><td>شركة طويق للتقنية</td><td>2023-05-10</td><td style="color: green;">نشط</td></tr>
                        <tr><td>102</td><td>مؤسسة الأفق المحدودة</td><td>2023-08-22</td><td style="color: green;">نشط</td></tr>
                        <tr><td>103</td><td>شركة الرواد للتجارة</td><td>2024-01-15</td><td style="color: red;">موقوف</td></tr>
                    </table>
                </div>

                <!-- قسم التقارير -->
                <div id="reports-section" class="card hidden">
                    <h3>التقارير المالية والتشغيلية</h3>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                        <p>إجمالي الإيرادات هذا الشهر: <strong style="color: #27ae60; font-size: 18px;">150,000 ريال</strong></p>
                        <p>إجمالي الشركات المسجلة: <strong>3 شركات</strong></p>
                    </div>
                    <button class="export-btn" onclick="alert('تم تصدير التقرير بصيغة PDF بنجاح وحفظه في جهازك!')">📥 تصدير التقرير الآن</button>
                </div>
            </main>
        </div>
    </div>

    <script>
        // دالة تسجيل الدخول
        function login() {
            const user = document.getElementById('username').value;
            const pass = document.getElementById('password').value;
            
            // بيانات الدخول التجريبية هي admin و 123
            if(user === 'admin' && pass === '123') {
                document.getElementById('login-screen').classList.add('hidden');
                document.getElementById('dashboard').classList.remove('hidden');
                document.getElementById('error-msg').style.display = 'none';
            } else {
                document.getElementById('error-msg').style.display = 'block';
            }
        }

        // دالة تسجيل الخروج
        function logout() {
            document.getElementById('dashboard').classList.add('hidden');
            document.getElementById('login-screen').classList.remove('hidden');
        }

        // دالة التنقل بين الشاشات
        function showSection(section) {
            document.getElementById('companies-section').classList.add('hidden');
            document.getElementById('reports-section').classList.add('hidden');
            document.getElementById(section + '-section').classList.remove('hidden');
        }
    </script>
</body>
</html>
`;

app.get('/', (req, res) => {
  res.send(htmlContent);
});

module.exports = app;
