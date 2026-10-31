const SUPABASE_URL = "https://bagscbfokioflnuyxcuz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhZ3NjYmZva2lvZmxudXl4Y3V6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM0MjAxOTEsImV4cCI6MjEwODk5NjE5MX0.9iU1vhruNSO54Van2GIBM1OrofuUfplWtPC7O7cV60s";
const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUser = null;
let currentProfile = null;
let isLoginMode = true;

// UI Tab Switching Logic
function switchTab(screenId, navElement) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
  
  if (navElement) {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    navElement.classList.add('active');
  }

  // Hide bottom nav in chat room
  if(screenId === 'chat-room-view') {
    document.getElementById('bottom-nav').style.display = 'none';
  } else {
    document.getElementById('bottom-nav').style.display = 'flex';
  }
}

function openChatRoom(name, avatar) {
  document.getElementById('chat-room-name').innerText = name;
  document.getElementById('chat-room-avatar').src = avatar;
  switchTab('chat-room-view');
}

function closeChatRoom() {
  switchTab('chat-list-view');
  document.querySelectorAll('.nav-item')[1].classList.add('active'); // Highlight Chat tab
}

function openEditProfile() {
  alert("Edit Profile Modal will open here. (Supabase integration)");
}

function switchAuthTab() {
  isLoginMode = !isLoginMode;
  document.getElementById('name-group').style.display = isLoginMode ? 'none' : 'block';
  document.getElementById('auth-submit-btn').innerText = isLoginMode ? "Login" : "Register";
  document.querySelector('#auth-screen p').innerText = isLoginMode ? "Switch to Register" : "Switch to Login";
}

async function handleAuth(e) {
  e.preventDefault();
  const email = document.getElementById('auth-email').value;
  const password = document.getElementById('auth-password').value;

  if (!isLoginMode) {
    const fullName = document.getElementById('auth-name').value || "User";
    const { error } = await db.auth.signUp({ 
      email, password, 
      options: { data: { full_name: fullName } } 
    });
    if (error) return alert(error.message);
    alert("Registration successful! Please login.");
    switchAuthTab();
  } else {
    const { error } = await db.auth.signInWithPassword({ email, password });
    if (error) return alert(error.message);
    checkSession();
  }
}

async function checkSession() {
  const { data: { session } } = await db.auth.getSession();
  if (session) {
    currentUser = session.user;
    const { data } = await db.from('profiles').select('*').eq('id', currentUser.id).single();
    currentProfile = data;

    document.getElementById('auth-screen').classList.remove('active');
    
    if (currentProfile && currentProfile.is_admin) {
      switchTab('admin-view', document.querySelectorAll('.nav-item')[2]);
      document.getElementById('admin-online-toggle').checked = currentProfile.is_online;
    } else {
      switchTab('home-view', document.querySelectorAll('.nav-item')[0]);
    }
  } else {
    document.getElementById('auth-screen').classList.add('active');
  }
}

async function toggleAdminOnlineStatus(isOnline) {
  if(!currentUser) return;
  await db.from('profiles').update({ is_online: isOnline }).eq('id', currentUser.id);
  alert(isOnline ? "You are now Online!" : "You are now Offline.");
}

function toggleTheme() {
  document.body.classList.toggle('dark-mode');
}

function changeLanguage(lang) {
  // Language switch logic (Could be expanded later)
  console.log("Language changed to:", lang);
}

window.onload = checkSession;
