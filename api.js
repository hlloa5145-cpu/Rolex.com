// بيانات الاتصال بمنصة ROLEX على Supabase
const SUPABASE_URL = 'https://tzhosluaxnlhaqhtpcqn.supabase.co';
const SUPABASE_KEY = 'EyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6aG9zbHVheG5saGFxaHRwY3FuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNDE3MjMsImV4cCI6MjA5MDgxNzcyM30.XK8gPQZ8lRCN3V43NU7TKO3cGPc-SupDvAcTRZiwZj8';

// بدء الاتصال بالمكتبة
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 1. وظيفة جلب عنوان الـ IP الخاص بالمستخدم للرقابة
async function getUserIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error("تعذر جلب الـ IP:", error);
        return "0.0.0.0";
    }
}

// 2. وظيفة تسجيل حساب جديد (أصول)
async function handleRegister(fullName, email, password, inviteCode) {
    const ip = await getUserIP();
    const { data, error } = await _supabase
        .from('profiles')
        .insert([{ 
            full_name: fullName, 
            email: email, 
            password_plain: password, 
            invite_code: inviteCode, 
            ip_address: ip,
            balance: 0 // رصيد البداية للأصول
        }]);

    if (error) {
        alert("خطأ في التسجيل: " + error.message);
    } else {
        alert("تم إنشاء حسابك في ROLEX بنجاح! يمكنك الدخول الآن.");
        location.reload(); // إعادة تحميل الصفحة للتحويل للدخول
    }
}

// 3. وظيفة تسجيل الدخول وتحديث الـ IP
async function handleLogin(email, password) {
    const { data, error } = await _supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .eq('password_plain', password)
        .single();

    if (data) {
        // تحديث الـ IP عند كل دخول لضمان الأمان
        const currentIP = await getUserIP();
        await _supabase
            .from('profiles')
            .update({ ip_address: currentIP })
            .eq('user_id', data.user_id);

        // حفظ بيانات الجلسة في المتصفح
        localStorage.setItem('rolex_session', JSON.stringify(data));
        window.location.href = 'tasks.html'; // الانتقال لصفحة المهام والأصول
    } else {
        alert("بيانات الدخول غير صحيحة، يرجى التأكد من الإيميل وكلمة المرور.");
    }
}

// 4. وظيفة جمع الأصول (الربح التراكمي 8% مقسم على 3 فترات)
async function collectDailyAssets() {
    const session = JSON.parse(localStorage.getItem('rolex_session'));
    if (!session) return;

    // جلب الرصيد المحدث من القاعدة أولاً
    const { data: user } = await _supabase
        .from('profiles')
        .select('balance')
        .eq('user_id', session.user_id)
        .single();

    const currentBalance = parseFloat(user.balance);
    const dailyRate = 0.08 / 3; // نسبة الربح لكل فترة جمع
    const profit = currentBalance * dailyRate;
    const newBalance = currentBalance + profit;

    const { error } = await _supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('user_id', session.user_id);

    if (!error) {
        alert(`تمت عملية جمع الأصول بنجاح! الأصول المضافة: ${profit.toFixed(2)}`);
        return newBalance;
    } else {
        alert("حدث خطأ أثناء الجمع، يرجى المحاولة لاحقاً.");
    }
}

// 5. وظيفة الأدمن للبحث عن مستخدم بالـ ID
async function adminGetUserDetails(userId) {
    const { data, error } = await _supabase
        .from('profiles')
        .select('email, password_plain, ip_address, balance')
        .eq('user_id', userId)
        .single();

    if (data) {
        return data; // إرجاع البيانات لعرضها في لوحة التحكم
    } else {
        console.error("المستخدم غير موجود");
        return null;
    }
}
