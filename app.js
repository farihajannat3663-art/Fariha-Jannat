const SUPABASE_URL = "https://bagscbfokioflnuyxcuz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhZ3NjYmZva2lvZmxudXl4Y3V6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM0MjAxOTEsImV4cCI6MjEwODk5NjE5MX0.9iU1vhruNSO54Van2GIBM1OrofuUfplWtPC7O7cV60s";
const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const i18n = {
  en: {
    welcomeTitle: "Welcome", welcomeSub: "Connect directly with Fariha", loginTab: "Login", signupTab: "Register",
    fullNameLabel: "Full Name", emailLabel: "Email", passwordLabel: "Password", loginBtn: "Login", signupBtn: "Register Account",
    statusOnline: "Currently Online", statusOffline: "Currently Offline", btnStartChat: "Message Fariha",
    adminControlTitle: "🛡️ Admin Control Panel", adminLiveStatus: "Online Status:", btnDelete20Min: "🗑️ Delete 20 Min Media",
    btnDeleteInactive: "🧹 Purge Inactive Users", userListTitle: "👥 Registered Users", typeMessagePlaceholder: "Type a message...",
    btnSend: "Send", profileModalTitle: "Settings", editNameLabel: "Your Name", selectAvatarLabel: "Select Avatar:",
    tabMale: "Male", tabFemale: "Female", adminPhotoLabel: "Upload Photo:", btnSaveProfile: "Save Changes",
    btnDeleteAccount: "Delete My Account", navHome: "Home", navChat: "Chat", navProfile: "Profile", adminPanel: "Admin Panel", aboutMe: "About Me", messages: "Messages"
  },
  bn: {
    welcomeTitle: "স্বাগতম", welcomeSub: "ফারিহা জান্নাতের সাথে যুক্ত হোন", loginTab: "লগইন", signupTab: "রেজিস্ট্রেশন",
    fullNameLabel: "পূর্ণ নাম", emailLabel: "ইমেইল", passwordLabel: "পাসওয়ার্ড", loginBtn: "লগইন করুন", signupBtn: "একাউন্ট তৈরি",
    statusOnline: "বর্তমানে অনলাইনে", statusOffline: "বর্তমানে অফলাইনে", btnStartChat: "মেসেজ দিন",
    adminControlTitle: "🛡️ অ্যাডমিন প্যানেল", adminLiveStatus: "অনলাইন স্ট্যাটাস:", btnDelete20Min: "🗑️ ২০ মিনিটের মিডিয়া ডিলিট",
    btnDeleteInactive: "🧹 ইনঅ্যাক্টিভ ডিলিট", userListTitle: "👥 ইউজার তালিকা", typeMessagePlaceholder: "মেসেজ লিখুন...",
    btnSend: "পাঠান", profileModalTitle: "সেটিংস", editNameLabel: "আপনার নাম", selectAvatarLabel: "এভাটার:",
    tabMale: "ছেলে", tabFemale: "মেয়ে", adminPhotoLabel: "ছবি আপলোড:", btnSaveProfile: "সেভ করুন",
    btnDeleteAccount: "একাউন্ট ডিলিট করুন", navHome: "হোম", navChat: "চ্যাট", navProfile: "প্রোফাইল", adminPanel: "অ্যাডমিন প্যানেল", aboutMe: "আমার সম্পর্কে", messages: "মেসেজ"
  }
};

let currentLang = localStorage.getItem('app_lang') || 'en';
let currentUser = null;
let currentProfile = null;
let farihaProfile = null;
let selectedAvatarUrl = "";
let isLoginMode = true;
let currentChatUserId = null;

// ================= NAVIGATION & UI =================
function switchTab(screenId, navElement) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
  
  if (navElement) {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    navElement.classList.add('active');
  }
  
  document.getElementById('bottom-nav').style.display = (screenId === 'chat-room-view') ? 'none' : 'flex';
  document.getElementById('main-header').style.display = (screenId === 'chat-room-view') ? 'none' : 'flex';

  if(screenId === 'chat-list-view') {
    loadChatList();
  }
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

function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('app_theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
}

// ================= AUTH LOGIC =================
function switchAuthTab(type) {
  isLoginMode = (type === 'login');
  document.getElementById('name-group').style.display = isLoginMode ? 'none' : 'block';
  document.getElementById('auth-submit-btn').innerText = i18n[currentLang][isLoginMode ? 'loginBtn' : 'signupBtn'];
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
  const savedTheme = localStorage.getItem('app_theme');
  if (savedTheme === 'dark') document.body.classList.add('dark-mode');
  changeLanguage(currentLang);

  const { data: { session } } = await db.auth.getSession();
  if (session) {
    currentUser = session.user;
    await loadUserProfile();
    await loadFarihaProfile();
    
    document.getElementById('auth-screen').classList.remove('active');
    document.getElementById('btn-logout').classList.remove('hidden');
    
    // Auto-navigate to Chat List on login (as per Image 4)
    switchTab('chat-list-view', document.getElementById('nav-chat'));
    
    setupRealtimeSubscriptions();
  } else {
    document.getElementById('auth-screen').classList.add('active');
    document.getElementById('btn-logout').classList.add('hidden');
    document.getElementById('bottom-nav').style.display = 'none';
  }
}

async function loadUserProfile() {
  const { data } = await db.from('profiles').select('*').eq('id', currentUser.id).maybeSingle();
  currentProfile = data;

  if (data) {
    if(data.is_admin) {
       document.getElementById('admin-profile-photo').src = data.avatar_url || 'https://via.placeholder.com/150';
       document.getElementById('header-admin-photo').src = data.avatar_url || 'https://via.placeholder.com/150';
       document.getElementById('admin-section-title').style.display = 'block';
       document.getElementById('admin-actions-container').style.display = 'block';
    }
  }
}

async function loadFarihaProfile() {
  const { data } = await db.from('profiles').select('*').eq('is_admin', true).limit(1).maybeSingle();
  if (data) farihaProfile = data;
}

async function handleLogout() {
  await db.auth.signOut();
  window.location.reload();
}

// ================= CHAT LIST (Image 4) =================
async function loadChatList() {
  const container = document.getElementById('chat-list-container');
  // Keep the static dummy data from HTML for now as placeholders, 
  // In real scenario, you would fetch from 'messages' table unique users.
}

// ================= CHAT ROOM (Image 5) =================
function openChatRoom(name, avatar) {
  document.getElementById('chat-room-name').innerText = name;
  document.getElementById('chat-room-avatar').src = avatar;
  switchTab('chat-room-view');
  loadMessages();
}

function closeChatRoom() {
  switchTab('chat-list-view', document.getElementById('nav-chat'));
}

async function sendMessage() {
  const input = document.getElementById('message-input');
  const content = input.value.trim();
  if (!content || !farihaProfile) return;

  const receiverId = currentProfile.is_admin ? currentChatUserId : farihaProfile.id;

  await db.from('messages').insert([{
    sender_id: currentUser.id,
    receiver_id: receiverId || farihaProfile.id,
    content: content,
    media_type: 'text'
  }]);
  input.value = "";
  loadMessages();
}

function handleKeyPress(e) {
  if (e.key === 'Enter') sendMessage();
}

async function loadMessages() {
  const targetId = currentProfile.is_admin ? currentChatUserId : farihaProfile?.id;
  if(!targetId) return;

  const { data } = await db.from('messages')
    .select('*')
    .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${targetId}),and(sender_id.eq.${targetId},receiver_id.eq.${currentUser.id})`)
    .order('created_at', { ascending: true });

  const container = document.getElementById('chat-messages');
  container.innerHTML = "";

  if(!data || data.length === 0) {
    container.innerHTML = `<p style="text-align:center; color:var(--text-sub); font-size:0.8rem; margin-top:20px;">No messages yet. Say hi!</p>`;
    return;
  }

  data.forEach(msg => {
    const isMe = msg.sender_id === currentUser.id;
    const div = document.createElement('div');
    div.className = `msg-bubble ${isMe ? 'sent' : 'received'}`;
    
    if (msg.media_type === 'image') {
      div.innerHTML = `<img src="${msg.media_url}" class="msg-img" /><br>${msg.content || ''}`;
    } else {
      div.innerText = msg.content;
    }
    container.appendChild(div);
  });
  container.scrollTop = container.scrollHeight;
}

// ================= SETTINGS MODAL =================
function openSettingsModal() {
  document.getElementById('settings-modal').classList.add('active');
  document.getElementById('edit-name').value = currentProfile.full_name;

  if (currentProfile.is_admin) {
    document.getElementById('admin-photo-section').style.display = 'block';
    document.getElementById('avatar-section').style.display = 'none';
  } else {
    document.getElementById('admin-photo-section').style.display = 'none';
    document.getElementById('avatar-section').style.display = 'block';
    renderAvatarGrid('female');
  }
}

function closeSettingsModal() {
  document.getElementById('settings-modal').classList.remove('active');
}

function renderAvatarGrid(gender) {
  const grid = document.getElementById('avatar-grid');
  grid.innerHTML = "";
  Avatars[gender].forEach(url => {
    const img = document.createElement('img');
    img.src = url;
    img.className = "avatar-item";
    if(url === currentProfile.avatar_url) img.classList.add('selected');
    img.onclick = () => {
      document.querySelectorAll('.avatar-item').forEach(i => i.classList.remove('selected'));
      img.classList.add('selected');
      selectedAvatarUrl = url;
    };
    grid.appendChild(img);
  });
}

async function saveProfileChanges() {
  const newName = document.getElementById('edit-name').value;
  const updateData = { full_name: newName };
  if (!currentProfile.is_admin && selectedAvatarUrl) updateData.avatar_url = selectedAvatarUrl;

  await db.from('profiles').update(updateData).eq('id', currentUser.id);
  alert(i18n[currentLang].alertProfileSaved || "Profile updated!");
  closeSettingsModal();
  loadUserProfile();
}

async function deleteMyAccount() {
  if (!confirm(i18n[currentLang].confirmDeleteAccount || "Delete account permanently?")) return;
  await db.from('profiles').delete().eq('id', currentUser.id);
  await db.auth.signOut();
  window.location.reload();
}

// ================= ADMIN ACTIONS =================
async function toggleAdminOnlineStatus(isOnline) {
  await db.from('profiles').update({ is_online: isOnline }).eq('id', currentUser.id);
}

async function adminDelete20MinMedia() {
  if (!confirm("Delete media from last 20 mins?")) return;
  const twentyMinsAgo = new Date(Date.now() - 20 * 60 * 1000).toISOString();
  await db.from('messages').delete().gte('created_at', twentyMinsAgo).neq('media_type', 'text');
  alert("Media deleted!");
}

async function adminDelete7DaysInactive() {
  if (!confirm("Purge inactive users?")) return;
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  await db.from('profiles').delete().eq('is_admin', false).lt('last_active', sevenDaysAgo);
  alert("Inactive users purged!");
}

// ================= REAL-TIME =================
function setupRealtimeSubscriptions() {
  db.channel('public:messages').on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
    if(document.getElementById('chat-room-view').classList.contains('active')) loadMessages();
  }).subscribe();
}

// ================= INIT =================
window.onload = checkSession;
