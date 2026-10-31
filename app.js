// ১. সুপাবেশ সংযোগ (তোমার Credentials সরাসরি বসানো হলো)
const SUPABASE_URL = "https://bagscbfokioflnuyxcuz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhZ3NjYmZva2lvZmxudXl4Y3V6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM0MjAxOTEsImV4cCI6MjEwODk5NjE5MX0.9iU1vhruNSO54Van2GIBM1OrofuUfplWtPC7O7cV60s";
const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ২. i18n ভাষা অভিধান (Language Dictionary)
const i18n = {
  en: {
    welcomeTitle: "Welcome to My Platform",
    welcomeSub: "Connect directly with Fariha Jannat",
    loginTab: "Login",
    signupTab: "Register",
    fullNameLabel: "Full Name",
    emailLabel: "Email Address",
    passwordLabel: "Password",
    loginBtn: "Login",
    signupBtn: "Register Account",
    statusOnline: "Currently Online (Media Allowed)",
    statusOffline: "Currently Offline (Text Only)",
    btnStartChat: "Message Fariha",
    adminControlTitle: "🛡️ Admin Command Center",
    adminLiveStatus: "Online Presence Status:",
    btnDelete20Min: "🗑️ Delete 20 Min Media",
    btnDeleteInactive: "🧹 Purge 7-Day Inactive Users",
    userListTitle: "👥 Registered Users",
    typeMessagePlaceholder: "Type a message...",
    btnSend: "Send",
    profileModalTitle: "Profile Settings",
    editNameLabel: "Your Display Name",
    selectAvatarLabel: "Choose Coded Avatar:",
    tabMale: "Male",
    tabFemale: "Female",
    adminPhotoLabel: "Upload Official Profile Photo:",
    btnSaveProfile: "Save Changes",
    btnDeleteAccount: "Delete My Account Permanently",
    alertMediaDeleted: "All media sent in the last 20 minutes has been deleted!",
    alertInactivePurged: "Inactive users have been purged successfully!",
    alertProfileSaved: "Profile updated successfully!",
    confirmDeleteAccount: "Are you sure you want to permanently delete your account?",
    confirmPurge20Min: "Are you sure you want to delete all photos & voice messages from the last 20 minutes?",
    confirmPurgeInactive: "Purge all users who have been inactive for over 7 days?"
  },
  bn: {
    welcomeTitle: "স্বাগতম আমার প্ল্যাটফর্মে",
    welcomeSub: "ফারিহা জান্নাতের সাথে সরাসরি যুক্ত থাকুন",
    loginTab: "লগইন",
    signupTab: "রেজিস্ট্রেশন",
    fullNameLabel: "আপনার পূর্ণ নাম",
    emailLabel: "ইমেইল এড্রেস",
    passwordLabel: "পাসওয়ার্ড",
    loginBtn: "লগইন করুন",
    signupBtn: "একাউন্ট তৈরি করুন",
    statusOnline: "বর্তমানে অনলাইনে আছেন (মিডিয়া চালু)",
    statusOffline: "বর্তমানে অফলাইনে আছেন (শুধু টেক্সট করা যাবে)",
    btnStartChat: "ফারিহাকে মেসেজ দিন",
    adminControlTitle: "🛡️ অ্যাডমিন কমান্ড সেন্টার",
    adminLiveStatus: "অনলাইন উপস্থিতি স্ট্যাটাস:",
    btnDelete20Min: "🗑️ ২০ মিনিটের মিডিয়া ডিলিট",
    btnDeleteInactive: "🧹 ৭ দিনের ইনঅ্যাক্টিভ ইউজার ক্লিনআপ",
    userListTitle: "👥 নিবন্ধিত ইউজার তালিকা",
    typeMessagePlaceholder: "মেসেজ লিখুন...",
    btnSend: "পাঠান",
    profileModalTitle: "প্রোফাইল সেটিংস",
    editNameLabel: "আপনার প্রদর্শিত নাম",
    selectAvatarLabel: "কোডেড এভাটার পছন্দ করুন:",
    tabMale: "ছেলে",
    tabFemale: "মেয়ে",
    adminPhotoLabel: "অফিসিয়াল প্রোফাইল ছবি আপলোড:",
    btnSaveProfile: "পরিবর্তনগুলো সেভ করুন",
    btnDeleteAccount: "আমার একাউন্ট চিরতরে ডিলিট করুন",
    alertMediaDeleted: "গত ২০ মিনিটে পাঠানো সকল মিডিয়া সফলভাবে মুছে ফেলা হয়েছে!",
    alertInactivePurged: "নিষ্ক্রিয় ইউজারদের সফলভাবে রিমুভ করা হয়েছে!",
    alertProfileSaved: "প্রোফাইল সফলভাবে আপডেট হয়েছে!",
    confirmDeleteAccount: "আপনি কি নিশ্চিত যে আপনার একাউন্ট স্থায়ীভাবে ডিলিট করতে চান?",
    confirmPurge20Min: "গত ২০ মিনিটের সমস্ত ছবি ও ভয়েস মুছে ফেলতে চান?",
    confirmPurgeInactive: "৭ দিন ইনঅ্যাক্টিভ থাকা সমস্ত ইউজার ডিলিট করতে চান?"
  }
};

let currentLang = localStorage.getItem('app_lang') || 'en';
let currentUser = null;
let currentProfile = null;
let farihaProfile = null;
let selectedAvatarUrl = "";

// ৩. ভাষা পরিবর্তন ফাংশন
function changeLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('app_lang', lang);
  document.getElementById('lang-selector').value = lang;
  
  // UI টেক্সট রেন্ডার
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (i18n[lang][key]) el.innerText = i18n[lang][key];
  });
  
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (i18n[lang][key]) el.placeholder = i18n[lang][key];
  });
}

// ৪. থিম পরিবর্তন (Dark/Light)
function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('app_theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
}

// ৫. সেশন ও প্রোফাইল ব্যবস্থাপনা
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
    document.getElementById('btn-settings').classList.remove('hidden');
    document.getElementById('btn-logout').classList.remove('hidden');
    
    setupRealtimeSubscriptions();
  } else {
    document.getElementById('auth-screen').classList.add('active');
    document.getElementById('user-view').classList.remove('active');
    document.getElementById('admin-view').classList.remove('active');
  }
}

async function loadUserProfile() {
  const { data } = await db.from('profiles').select('*').eq('id', currentUser.id).single();
  currentProfile = data;

  if (data.is_admin) {
    document.getElementById('admin-view').classList.add('active');
    document.getElementById('user-view').classList.remove('active');
  } else {
    document.getElementById('user-view').classList.add('active');
    document.getElementById('admin-view').classList.remove('active');
  }
}

async function loadFarihaProfile() {
  const { data } = await db.from('profiles').select('*').eq('is_admin', true).single();
  if (data) {
    farihaProfile = data;
    document.getElementById('owner-photo').src = data.avatar_url || 'https://via.placeholder.com/150';
    
    const dot = document.getElementById('owner-status-dot');
    const text = document.getElementById('owner-status-text');
    
    if (data.is_online) {
      dot.className = "status-badge online";
      text.innerText = i18n[currentLang].statusOnline;
      enableMediaButtons(true);
    } else {
      dot.className = "status-badge offline";
      text.innerText = i18n[currentLang].statusOffline;
      enableMediaButtons(false);
    }
  }
}

function enableMediaButtons(enable) {
  const btnImg = document.getElementById('btn-attach-image');
  const btnVoice = document.getElementById('btn-record-voice');
  if (enable || (currentProfile && currentProfile.is_admin)) {
    btnImg.classList.remove('disabled');
    btnVoice.classList.remove('disabled');
  } else {
    btnImg.classList.add('disabled');
    btnVoice.classList.add('disabled');
  }
}

// ৬. অথেনটিকেশন ফর্ম
function switchAuthTab(type) {
  document.getElementById('tab-login').classList.toggle('active', type === 'login');
  document.getElementById('tab-signup').classList.toggle('active', type === 'signup');
  document.getElementById('name-group').style.display = type === 'signup' ? 'block' : 'none';
  document.getElementById('auth-submit-btn').innerText = type === 'signup' ? i18n[currentLang].signupBtn : i18n[currentLang].loginBtn;
}

async function handleAuth(e) {
  e.preventDefault();
  const email = document.getElementById('auth-email').value;
  const password = document.getElementById('auth-password').value;
  const isSignup = document.getElementById('tab-signup').classList.contains('active');

  if (isSignup) {
    const fullName = document.getElementById('auth-name').value || "User";
    const { error } = await db.auth.signUp({ 
      email, 
      password, 
      options: { data: { full_name: fullName, avatar_url: Avatars.female[0] } } 
    });
    if (error) return alert(error.message);
  } else {
    const { error } = await db.auth.signInWithPassword({ email, password });
    if (error) return alert(error.message);
  }
  checkSession();
}

// ৭. চ্যাট লজিক
function openChatModal() { document.getElementById('chat-modal').classList.add('active'); loadMessages(); }
function closeChatModal() { document.getElementById('chat-modal').classList.remove('active'); }

async function sendMessage() {
  const input = document.getElementById('message-input');
  const content = input.value.trim();
  if (!content) return;

  await db.from('messages').insert([{
    sender_id: currentUser.id,
    receiver_id: farihaProfile.id,
    content: content,
    media_type: 'text'
  }]);

  input.value = "";
  loadMessages();
}

async function loadMessages() {
  if (!farihaProfile) return;
  const { data } = await db.from('messages')
    .select('*')
    .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
    .order('created_at', { ascending: true });

  const container = document.getElementById('chat-messages');
  container.innerHTML = "";

  data.forEach(msg => {
    const isMe = msg.sender_id === currentUser.id;
    const div = document.createElement('div');
    div.className = `msg-bubble ${isMe ? 'sent' : 'received'}`;
    
    if (msg.media_type === 'image') {
      div.innerHTML = `<img src="${msg.media_url}" width="180" style="border-radius:8px;" /><br>${msg.content || ''}`;
    } else {
      div.innerText = msg.content;
    }
    container.appendChild(div);
  });
  container.scrollTop = container.scrollHeight;
}

// ৮. অ্যাডমিন অ্যাকশনসমূহ
async function toggleAdminOnlineStatus(isOnline) {
  await db.from('profiles').update({ is_online: isOnline }).eq('id', currentUser.id);
}

async function adminDelete20MinMedia() {
  if (!confirm(i18n[currentLang].confirmPurge20Min)) return;
  const twentyMinsAgo = new Date(Date.now() - 20 * 60 * 1000).toISOString();
  await db.from('messages').delete().gte('created_at', twentyMinsAgo).neq('media_type', 'text');
  alert(i18n[currentLang].alertMediaDeleted);
}

async function adminDelete7DaysInactive() {
  if (!confirm(i18n[currentLang].confirmPurgeInactive)) return;
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  await db.from('profiles').delete().eq('is_admin', false).lt('last_active', sevenDaysAgo);
  alert(i18n[currentLang].alertInactivePurged);
}

// ৯. ইউজার স্বাধিকার ও প্রোফাইল এডিট
async function deleteMyAccount() {
  if (!confirm(i18n[currentLang].confirmDeleteAccount)) return;
  await db.from('profiles').delete().eq('id', currentUser.id);
  await db.auth.signOut();
  window.location.reload();
}

function openProfileModal() {
  document.getElementById('profile-modal').classList.add('active');
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
function closeProfileModal() { document.getElementById('profile-modal').classList.remove('active'); }

function renderAvatarGrid(gender) {
  const grid = document.getElementById('avatar-grid');
  grid.innerHTML = "";
  Avatars[gender].forEach(url => {
    const img = document.createElement('img');
    img.src = url;
    img.className = "avatar-item";
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
  alert(i18n[currentLang].alertProfileSaved);
  closeProfileModal();
  loadUserProfile();
}

async function handleLogout() {
  await db.auth.signOut();
  window.location.reload();
}

function setupRealtimeSubscriptions() {
  db.channel('public:messages').on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => loadMessages()).subscribe();
  db.channel('public:profiles').on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, () => loadFarihaProfile()).subscribe();
}

window.onload = checkSession;
    
