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
        input, select { width: 90%; padding: 12px; margin: 10px 0; border: 1px solid #ccc; border-radius: 5px; font-size: 16px; font-family: inherit; }
        button { width: 100%; padding: 12px; margin-top: 10px; background-color: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; font-weight: bold; }
        button:hover { background-color: #2980b9; }
        
        /* تصميم لوحة التحكم */
        #dashboard { display: flex; flex-direction: column; height: 100vh; }
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
        .btn-green { background-color: #27ae60; width: auto; padding: 10px 20px; }
        .btn-green:hover { background-color: #2ecc71; }
        
        /* نموذج الإضافة */
        .form-box { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #ddd; }
        
        /* فئة الإخفاء */
        .hidden { display: none !important; }
    </style>
</head>
<body>

    <div id="login-screen">
        <div class="login-box">
            <h2>تسجيل الدخول للمنصة</h2>
            <input type="text" id="username" placeholder="اسم المستخدم (admin)" value="admin">
            <input type="password" id="password" placeholder="كلمة المرور (123)" value="123">
            <button onclick="login()">تسجيل الدخول</button>
            <p id="error-msg" style="color:red; display:none; margin-top:15px;">بيانات الدخول خاطئة!</p>
        </div>
    </div>

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
                <div id="companies-section" class="card">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <h3 style="margin: 0;">قائمة الشركات المسجلة</h3>
                        <button class="btn-green" onclick="toggleAddForm()">+ إضافة شركة جديدة</button>
                    </div>

                    <div id="add-company-form" class="form-box hidden">
                        <h4>بيانات الشركة الجديدة</h4>
                        <input type="text" id="new-company-name" placeholder="اسم الشركة">
                        <input type="date" id="new-company-date">
                        <select id="new-company-status">
                            <option value="نشط">نشط</option>
                            <option value="موقوف">موقوف</option>
                        </select>
                        <button class="btn-green" style="width: 100%; margin-top: 15px;" onclick="addNewCompany()">حفظ الشركة وإضافتها</button>
                    </div>

                    <table id="companies-table">
                        <tr><th>رقم الشركة</th><th>اسم الشركة</th><th>تاريخ التسجيل</th><th>الحالة</th></tr>
                        <tr><td>101</td><td>شركة طويق للتقنية</td><td>2023-05-10</td><td style="color: green; font-weight: bold;">نشط</td></tr>
                        <tr><td>102</td><td>مؤسسة الأفق المحدودة</td><td>2023-08-22</td><td style="color: green; font-weight: bold;">نشط</td></tr>
                        <tr><td>103</td><td>شركة الرواد للتجارة</td><td>2024-01-15</td><td style="color: red; font-weight: bold;">موقوف</td></tr>
                    </table>
                </div>

                <div id="reports-section" class="card hidden">
                    <h3>التقارير المالية والتشغيلية</h3>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                        <p>إجمالي الإيرادات هذا الشهر: <strong style="color: #27ae60; font-size: 18px;">150,000 ريال</strong></p>
                        <p>إجمالي الشركات المسجلة: <strong id="total-companies-count">3 شركات</strong></p>
                    </div>
                    <button class="btn-green" onclick="alert('تم تصدير التقرير بصيغة PDF بنجاح وحفظه في جهازك!')">📥 تصدير التقرير الآن</button>
                </div>
            </main>
        </div>
    </div>

    <script>
        let nextCompanyId = 104; // الرقم التسلسلي للشركة الجديدة
        let totalCompanies = 3;

        function login() {
            const user = document.getElementById('username').value;
            const pass = document.getElementById('password').value;
            
            if(user === 'admin' && pass === '123') {
                document.getElementById('login-screen').classList.add('hidden');
                document.getElementById('dashboard').classList.remove('hidden');
                document.getElementById('error-msg').style.display = 'none';
            } else {
                document.getElementById('error-msg').style.display = 'block';
            }
        }

        function logout() {
            document.getElementById('dashboard').classList.add('hidden');
            document.getElementById('login-screen').classList.remove('hidden');
        }

        function showSection(section) {
            document.getElementById('companies-section').classList.add('hidden');
            document.getElementById('reports-section').classList.add('hidden');
            document.getElementById(section + '-section').classList.remove('hidden');
        }

        function toggleAddForm() {
            const form = document.getElementById('add-company-form');
            form.classList.toggle('hidden');
        }

        function addNewCompany() {
            const name = document.getElementById('new-company-name').value;
            const date = document.getElementById('new-company-date').value;
            const status = document.getElementById('new-company-status').value;

            if(!name || !date) {
                alert('الرجاء تعبئة اسم الشركة والتاريخ!');
                return;
            }

            // إضافة صف جديد للجدول
            const table = document.getElementById('companies-table');
            const newRow = table.insertRow(-1); // يضيف الصف في النهاية
            
            const color = status === 'نشط' ? 'green' : 'red';
            
            newRow.innerHTML = \`
                <td>\${nextCompanyId}</td>
                <td>\${name}</td>
                <td>\${date}</td>
                <td style="color: \${color}; font-weight: bold;">\${status}</td>
            \`;

            // تحديث العدادات
            nextCompanyId++;
            totalCompanies++;
            document.getElementById('total-companies-count').innerText = totalCompanies + ' شركات';

            // تصفير الحقول وإخفاء النموذج
            document.getElementById('new-company-name').value = '';
            document.getElementById('new-company-date').value = '';
            toggleAddForm();

            alert('تم إضافة الشركة بنجاح!');
        }
    </script>
</body>
</html>
`;

app.get('/', (req, res) => {
  res.send(htmlContent);
});

module.exports = app;
