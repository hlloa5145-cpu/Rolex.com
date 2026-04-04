const SUPABASE_URL = 'https://tzhosluaxnlhaqhtpcqn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6aG9zbHVheG5saGFxaHRwY3FuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNDE3MjMsImV4cCI6MjA5MDgxNzcyM30.XK8gPQZ8lRCN3V43NU7TKO3cGPc-SupDvAcTRZiwZj8';

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// وظيفة التسجيل الفخمة والسريعة
async function handleRegister(fullName, email, password, inviteCode) {
    if (!fullName || !email || !password) {
        alert("يا غالي، عبي كل الخانات أولاً");
        return;
    }

    try {
        const { data, error } = await _supabase
            .from('profiles')
            .insert([{ 
                full_name: fullName, 
                email: email, 
                password_plain: password, 
                invite_code: inviteCode || 'ROLEX100', 
                balance: 0 
            }])
            .select();

        if (error) {
            alert("خطأ: " + error.message);
        } else {
            alert("أهلاً بك في عالم ROLEX! تم التسجيل.");
            localStorage.setItem('rolex_session', JSON.stringify(data[0]));
            window.location.href = 'tasks.html'; 
        }
    } catch (err) {
        alert("تأكد من إعدادات الـ SQL في Supabase");
    }
}
