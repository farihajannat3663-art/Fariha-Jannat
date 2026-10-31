const SUPABASE_URL = "https://bagscbfokioflnuyxcuz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhZ3NjYmZva2lvZmxudXl4Y3V6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM0MjAxOTEsImV4cCI6MjEwODk5NjE5MX0.9iU1vhruNSO54Van2GIBM1OrofuUfplWtPC7O7cV60s";
const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const i18n = {
  en: {
    welcomeTitle: "Welcome",
    fullNameLabel: "Full Name",
    emailLabel: "Email",
    passwordLabel: "Password",
    loginBtn: "Login",
    adminControlTitle: "Admin Control Panel",
    adminLiveStatus: "Online Presence Status:",
    chatListTitle: "Messages",
    typeMessagePlaceholder: "Type a message...",
    navHome: "Home",
    navChat: "Chat",
    navProfile: "Profile",
    navSettings: "Settings"
  },
  bn: {
    welcomeTitle: "স্বাগতম",
    fullNameLabel: "পূর্ণ নাম",
    emailLabel: "ইমেইল",
    passwordLabel: "পাসওয়ার্ড",
    loginBtn: "লগইন করুন",
    adminControlTitle: "অ্যাডমিন কন্ট্রোল প্যানেল",
    adminLiveStatus: "অনলাইন উপস্থিতি স্ট্যাটাস:",
    chatListTitle: "মেসেজসমূহ",
    typeMessagePlaceholder: "মেসেজ লিখুন...",
    navHome: "Home",
    navChat: "Chat",
    navProfile: "Profile",
    navSettings: "Settings"
  }
};

let currentLang = localStorage.getItem('app_lang') || 'en';
let currentUser = null;
let currentProfile = null;
let farihaProfile = null;
let isLoginMode = true;
let currentChatUserId = null;

function switchTab(screenId, navElement) {
  document.querySelectorAll('.main-content .screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
  
  if (navElement) {
    document.querySelectorAll('.bottom-nav .nav-item').forEach(n => n.classList.remove('active'));
    navElement.classList.add('active');
  }

  if(screenId === 'chat-view') loadChatList();
}

function changeLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('app_lang', lang);
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (i18n[lang][key]) el.innerText = i18n[lang][key];
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (i18n[lang][key]) el.placeholder = i18n[lang][key];
  });
}

function switchAuthTab(type) {
  isLoginMode = (type === 'login');
  document.getElementById('name-group').style.display = isLoginMode ? 'none' : 'block';
  document.getElementById('tab-login').classList.toggle('active', isLoginMode);
  document.getElementById('tab-signup').classList.toggle('active', !isLoginMode);
}

async function handleAuth(e) {
  e.preventDefault();
  const email = document.getElementById('auth-email').value;
  const password = document.getElementById('auth-password').value;

  if (!isLoginMode) {
    const fullName = document.getElementById('auth-name').value || "User";
    const { error } = await db.auth.signUp({ email, password, options: { data: { full_name: fullName, avatar_url: Avatars.female[0] } } });
    if (error) return alert(error.message);
    alert("Registration successful! Please login.");
    switchAuthTab('login');
  } else {
    const { error } = await db.auth.signInWithPassword({ email, password });
    if (error) return alert(error.message);
    checkSession();
  }
}

async function checkSession() {
  changeLanguage(currentLang);
  const { data: { session } } = await db.auth.getSession();
  
  if (session) {
    currentUser = session.user;
    await loadUserProfile();
    await loadFarihaProfile();
    
    document.getElementById('auth-screen').classList.remove('active');
    document.getElementById('bottom-nav').style.display = 'flex';
    
    switchTab('home-view', document.getElementById('nav-home'));
    setupRealtimeSubscriptions();
  } else {
    document.getElementById('auth-screen').classList.add('active');
    document.getElementById('bottom-nav').style.display = 'none';
  }
}

async function loadUserProfile() {
  const { data } = await db.from('profiles').select('*').eq('id', currentUser.id).maybeSingle();
  currentProfile = data;

  if (data) {
    if(data.is_admin) {
       document.getElementById('home-admin-avatar').src = data.avatar_url || 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=female_avatar_1';
       document.getElementById('home-admin-name').innerText = data.full_name;
       document.getElementById('profile-page-avatar').src = data.avatar_url || 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=female_avatar_1';
       document.getElementById('profile-page-name').innerText = data.full_name;
       document.getElementById('admin-actions-box').style.display = 'block';
       document.getElementById('admin-online-toggle').checked = data.is_online;
    }
  }
}

async function loadFarihaProfile() {
  const { data } = await db.from('profiles').select('*').eq('is_admin', true).limit(1).maybeSingle();
  if (data) farihaProfile = data;
}

async function loadChatList() {
  const container = document.getElementById('chat-list-container');
  if(!currentProfile.is_admin) {
      container.innerHTML = `
        <div class="chat-item" onclick="openChatRoom('${farihaProfile.full_name}', '${farihaProfile.avatar_url}', '${farihaProfile.id}')">
            <div class="chat-avatar">
              <img src="${farihaProfile.avatar_url}" alt="Fariha">
              <span class="status-dot ${farihaProfile.is_online ? 'online' : ''}"></span>
            </div>
            <div class="chat-info">
              <h4>${farihaProfile.full_name}</h4>
              <p>Tap to message...</p>
            </div>
        </div>`;
      return;
  }

  const { data: users } = await db.from('profiles').select('*').eq('is_admin', false);
  if(!users || users.length === 0) {
      container.innerHTML = `<p style="text-align:center; color:var(--text-sub); margin-top:30px;">No registered users yet.</p>`;
      return;
  }

  container.innerHTML = "";
  users.forEach(user => {
    const div = document.createElement('div');
    div.className = 'chat-item';
    div.onclick = () => openChatRoom(user.full_name, user.avatar_url, user.id);
    div.innerHTML = `
        <div class="chat-avatar">
          <img src="${user.avatar_url || 'https://via.placeholder.com/50'}" alt="User">
          <span class="status-dot ${user.is_online ? 'online' : ''}"></span>
        </div>
        <div class="chat-info">
          <h4>${user.full_name}</h4>
          <p>Tap to view conversation</p>
        </div>`;
    container.appendChild(div);
  });
}

function openChatRoom(name, avatar, userId) {
  currentChatUserId = userId;
  document.getElementById('chat-room-name').innerText = name;
  document.getElementById('chat-room-avatar').src = avatar || 'https://via.placeholder.com/40';
  switchTab('chat-room-view');
  loadMessages();
}

async function sendMessage() {
  const input = document.getElementById('message-input');
  const content = input.value.trim();
  if (!content || !currentChatUserId) return;

  await db.from('messages').insert([{
    sender_id: currentUser.id,
    receiver_id: currentChatUserId,
    content: content,
    media_type: 'text'
  }]);
  input.value = "";
  loadMessages();
}

function handleKeyPress(e) { if (e.key === 'Enter') sendMessage(); }

async function loadMessages() {
  if(!currentChatUserId) return;
  const { data } = await db.from('messages')
    .select('*')
    .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${currentChatUserId}),and(sender_id.eq.${currentChatUserId},receiver_id.eq.${currentUser.id})`)
    .order('created_at', { ascending: true });

  const container = document.getElementById('chat-messages');
  container.innerHTML = "";

  if(!data || data.length === 0) {
    container.innerHTML = `<p style="text-align:center; color:var(--text-sub); font-size:0.8rem; margin-top:20px;">No messages yet.</p>`;
    return;
  }

  data.forEach(msg => {
    const isMe = msg.sender_id === currentUser.id;
    const div = document.createElement('div');
    div.className = `msg-bubble ${isMe ? 'sent' : 'received'}`;
    div.innerText = msg.content;
    container.appendChild(div);
  });
  container.scrollTop = container.scrollHeight;
}

async function toggleAdminOnlineStatus(isOnline) {
  await db.from('profiles').update({ is_online: isOnline }).eq('id', currentUser.id);
}

async function adminDelete20MinMedia() {
  if (!confirm("Delete media from last 20 mins?")) return;
  const twentyMinsAgo = new Date(Date.now() - 20 * 60 * 1000).toISOString();
  await db.from('messages').delete().gte('created_at', twentyMinsAgo).neq('media_type', 'text');
  alert("Media deleted successfully!");
}

async function adminDelete7DaysInactive() {
  if (!confirm("Purge users inactive for 7 days?")) return;
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  await db.from('profiles').delete().eq('is_admin', false).lt('last_active', sevenDaysAgo);
  alert("Inactive users purged!");
}

async function saveProfileChanges() {
  const newName = document.getElementById('edit-name').value;
  if(!newName) return;
  await db.from('profiles').update({ full_name: newName }).eq('id', currentUser.id);
  alert("Profile updated successfully!");
  loadUserProfile();
}

async function handleLogout() {
  await db.auth.signOut();
  window.location.reload();
}

function setupRealtimeSubscriptions() {
  db.channel('public:messages').on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
    if(document.getElementById('chat-room-view').classList.contains('active')) loadMessages();
  }).subscribe();
}

window.onload = checkSession;
  
