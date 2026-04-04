const SUPABASE_URL = 'https://tzhosluaxnlhaqhtpcqn.supabase.co';
const SUPABASE_KEY = 'EyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6aG9zbHVheG5saGFxaHRwY3FuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNDE3MjMsImV4cCI6MjA5MDgxNzcyM30.XK8gPQZ8lRCN3V43NU7TKO3cGPc-SupDvAcTRZiwZj8';

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// جلب الـ IP
async function getUserIP() {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    return data.ip;
}

// تسجيل دخول
async function handleLogin(email, pass) {
    const { data } = await _supabase.from('profiles').select('*').eq('email', email).eq('password_plain', pass).single();
    if (data) {
        localStorage.setItem('rolex_session', JSON.stringify(data));
        window.location.href = 'tasks.html';
    } else { alert("خطأ في البيانات"); }
}

// تسجيل خروج
function handleLogout() {
    localStorage.removeItem('rolex_session');
    window.location.href = 'index.html';
}

// إرسال طلب وحفظه في السجل
async function submitTransaction(type, amount, wallet = '') {
    const session = JSON.parse(localStorage.getItem('rolex_session'));
    if(!session || !amount) return alert("أدخل المبلغ");

    const { error } = await _supabase.from('transactions').insert([{ user_id: session.user_id, type: type, amount: amount, status: 'قيد الانتظار', wallet_address: wallet }]);

    if(!error) { alert("تم إرسال الطلب بنجاح قيد الانتظار"); location.reload(); }
    else { alert("حدث خطأ"); }
}

// جلب السجل للمستخدم
async function loadHistory(type, elementId) {
    const session = JSON.parse(localStorage.getItem('rolex_session'));
    const { data } = await _supabase.from('transactions').select('*').eq('user_id', session.user_id).eq('type', type).order('created_at', { ascending: false });

    if(data) {
        let html = '';
        data.forEach(item => {
            let statusColor = item.status === 'قيد الانتظار' ? '#f39c12' : (item.status === 'مكتمل' ? '#27ae60' : '#ff4757');
            html += `<tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                <td style="padding:10px;">${item.amount}$</td>
                <td style="padding:10px; color:${statusColor}">${item.status}</td>
                <td style="padding:10px; font-size:10px; color:#999;">${new Date(item.created_at).toLocaleDateString()}</td>
            </tr>`;
        });
        document.getElementById(elementId).innerHTML = html;
    }
}
