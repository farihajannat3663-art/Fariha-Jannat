// ১. সুপাবেশ কনফিগারেশন (তোমার Supabase URL এবং Anon Key বসাবে)
const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_KEY = "YOUR_SUPABASE_ANON_KEY";
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentUser = null;
let currentProfile = null;
let farihaProfile = null;
let selectedAvatarUrl = "";
let isRecording = false;

// ২. অথেনটিকেশন ও সাইন-আপ/লগইন
function switchAuthTab(type) {
  document.getElementById('tab-login').classList.toggle('active', type === 'login');
  document.getElementById('tab-signup').classList.toggle('active', type === 'signup');
  document.getElementById('name-group').style.display = type === 'signup' ? 'block' : 'none';
  document.getElementById('auth-submit-btn').innerText = type === 'signup' ? 'রেজিস্ট্রেশন করুন' : 'লগইন করুন';
}

async function handleAuth(e) {
  e.preventDefault();
  const email = document.getElementById('auth-email').value;
  const password = document.getElementById('auth-password').value;
  const isSignup = document.getElementById('tab-signup').classList.contains('active');

  if (isSignup) {
    const fullName = document.getElementById('auth-name').value || "নতুন ইউজার";
    const { data, error } = await db.auth.signUp({ email, password });
    if (error) return alert(error.message);
    
    // ডিফল্ট প্রোফাইল তৈরি
    const defaultAvatar = Avatars.female[0];
    await db.from('profiles').insert([{
      id: data.user.id,
      full_name: fullName,
      avatar_url: defaultAvatar,
      is_admin: false
    }]);
    alert("রেজিস্ট্রেশন সফল হয়েছে!");
  } else {
    const { data, error } = await db.auth.signInWithPassword({ email, password });
    if (error) return alert(error.message);
  }
  checkSession();
}

// ৩. সেশন চেক ও প্রোফাইল লোড
async function checkSession() {
  const { data: { session } } = await db.auth.getSession();
  if (session) {
    currentUser = session.user;
    await loadUserProfile();
    await loadFarihaProfile();
    
    document.getElementById('auth-screen').classList.remove('active');
    document.getElementById('app-screen').classList.add('active');
    
    setupRealtimeSubscriptions();
  } else {
    document.getElementById('auth-screen').classList.add('active');
    document.getElementById('app-screen').classList.remove('active');
  }
}

async function loadUserProfile() {
  const { data } = await db.from('profiles').select('*').eq('id', currentUser.id).single();
  currentProfile = data;
  
  document.getElementById('my-name').innerText = data.full_name;
  document.getElementById('my-avatar-preview').innerHTML = `<img src="${data.avatar_url}">`;
  document.getElementById('my-role-badge').innerText = data.is_admin ? "অ্যাডমিন" : "ইউজার";

  // রোল অনুযায়ী ভিউ সেটআপ
  if (data.is_admin) {
    document.getElementById('admin-view').style.display = 'block';
    document.getElementById('user-view').style.display = 'none';
    loadAllUsersForAdmin();
  } else {
    document.getElementById('user-view').style.display = 'block';
    document.getElementById('admin-view').style.display = 'none';
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
      dot.className = "status-dot online";
      text.innerText = "অনলাইনে আছেন (ছবি ও ভয়েস রেডি)";
      enableMediaButtons(true);
    } else {
      dot.className = "status-dot offline";
      text.innerText = "বর্তমানে অফলাইনে আছেন (শুধু টেক্সট করা যাবে)";
      enableMediaButtons(false);
    }
  }
}

function enableMediaButtons(enable) {
  const btnImg = document.getElementById('btn-upload-img');
  const btnVoice = document.getElementById('btn-record-voice');
  if (enable || (currentProfile && currentProfile.is_admin)) {
    btnImg.classList.remove('disabled');
    btnVoice.classList.remove('disabled');
  } else {
    btnImg.classList.add('disabled');
    btnVoice.classList.add('disabled');
  }
}

// ৪. অ্যাডমিন স্পেশাল ফিচারস
async function toggleAdminOnlineStatus(isOnline) {
  await db.from('profiles').update({ is_online: isOnline }).eq('id', currentUser.id);
}

// ২০ মিনিটের মিডিয়া ডিলিট (১ ক্লিকে)
async function deleteRecentMedia20Min() {
  if (!confirm("আপনি কি নিশ্চিত যে গত ২০ মিনিটের পাঠানো সব ছবি এবং ভয়েস ডিলিট করবেন?")) return;
  
  const twentyMinutesAgo = new Date(Date.now() - 20 * 60 * 1000).toISOString();
  
  const { error } = await db.from('messages')
    .delete()
    .gte('created_at', twentyMinutesAgo)
    .neq('media_type', 'text');

  if (!error) alert("গত ২০ মিনিটের সকল মিডিয়া সফলভাবে মুছে ফেলা হয়েছে!");
}

// ৭ দিন ইনঅ্যাক্টিভ ইউজার ক্লিনআপ
async function deleteInactiveUsers7Days() {
  if (!confirm("১ সপ্তাহ ধরে যারা ইনঅ্যাক্টিভ তাদের একাউন্ট ডিলিট করতে চান?")) return;
  
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  
  const { error } = await db.from('profiles')
    .delete()
    .eq('is_admin', false)
    .lt('last_active', sevenDaysAgo);

  if (!error) alert("ইনঅ্যাক্টিভ ইউজারদের সফলভাবে রিমুভ করা হয়েছে!");
}

// ৫. চ্যাট ও মেসেজিং
function openChatWithFariha() {
  document.getElementById('chat-modal').classList.add('active');
  loadMessages();
}
function closeChatModal() {
  document.getElementById('chat-modal').classList.remove('active');
}

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
      div.innerHTML = `<img src="${msg.media_url}" width="200" /><br>${msg.content || ''}`;
    } else if (msg.media_type === 'voice') {
      div.innerHTML = `<audio controls src="${msg.media_url}"></audio>`;
    } else {
      div.innerText = msg.content;
    }
    container.appendChild(div);
  });
  container.scrollTop = container.scrollHeight;
}

// ৬. রিয়েলটাইম আপডেট
function setupRealtimeSubscriptions() {
  db.channel('public:messages')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
      loadMessages();
    })
    .subscribe();

  db.channel('public:profiles')
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, () => {
      loadFarihaProfile();
    })
    .subscribe();
}

// প্রোফাইল মোডাল লজিক
function openProfileModal() {
  document.getElementById('profile-modal').classList.add('active');
  document.getElementById('edit-name').value = currentProfile.full_name;

  if (currentProfile.is_admin) {
    document.getElementById('admin-photo-section').style.display = 'block';
    document.getElementById('avatar-picker-section').style.display = 'none';
  } else {
    document.getElementById('admin-photo-section').style.display = 'none';
    document.getElementById('avatar-picker-section').style.display = 'block';
    renderAvatarGrid('female');
  }
}
function closeProfileModal() {
  document.getElementById('profile-modal').classList.remove('active');
}

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

  if (!currentProfile.is_admin && selectedAvatarUrl) {
    updateData.avatar_url = selectedAvatarUrl;
  }

  await db.from('profiles').update(updateData).eq('id', currentUser.id);
  alert("প্রোফাইল আপডেট হয়েছে!");
  closeProfileModal();
  loadUserProfile();
}

async function handleLogout() {
  await db.auth.signOut();
  window.location.reload();
}

window.onload = checkSession;
        
