import { firebaseConfig, subscription } from './config.js';

const $ = id => document.getElementById(id);
let auth = null, db = null, currentUser = null, approved = false;
let firebaseReady = false;

const subjects = [
  {name:'Mathematics',icon:'➗',topics:['Numbers','Algebra','Geometry','Statistics'],notes:'Mathematics helps us describe quantities, patterns and relationships. Start by identifying what is known and what you need to find.',example:'Solve 2x + 3 = 11. Subtract 3 from both sides: 2x = 8. Divide by 2: x = 4.',quiz:{q:'Solve 3x = 15.',options:['x = 3','x = 5','x = 12'],answer:1,why:'Divide both sides by 3, so x = 5.'}},
  {name:'English Language',icon:'📚',topics:['Grammar','Comprehension','Vocabulary','Essay writing'],notes:'Clear English depends on understanding sentence structure, word meaning and audience. A complete sentence usually expresses a full thought.',example:'Subject: The students. Verb: revised. Complete sentence: The students revised their notes.',quiz:{q:'Which word is a verb in “Ada reads daily”?',options:['Ada','reads','daily'],answer:1,why:'“Reads” describes the action.'}},
  {name:'Biology',icon:'🧬',topics:['Cells','Nutrition','Ecology','Reproduction'],notes:'Biology is the study of living things. Cells are the basic structural and functional units of living organisms.',example:'Plant cells usually have a cell wall, cell membrane, cytoplasm, nucleus and often chloroplasts.',quiz:{q:'What is the basic unit of life?',options:['Organ','Cell','System'],answer:1,why:'The cell is the basic unit of life.'}},
  {name:'Chemistry',icon:'⚗️',topics:['Atoms','Periodic table','Chemical reactions','Acids and bases'],notes:'Chemistry studies matter, its properties and how substances change. An atom contains a nucleus and electrons around it.',example:'A chemical equation represents a reaction. In a balanced equation, each element has the same number of atoms on both sides.',quiz:{q:'Which particle has a negative charge?',options:['Proton','Neutron','Electron'],answer:2,why:'Electrons have a negative electrical charge.'}},
  {name:'Physics',icon:'🔭',topics:['Motion','Energy','Waves','Electricity'],notes:'Physics explains matter, energy, forces and motion. Measurements and units help us describe observations accurately.',example:'Average speed = distance ÷ time. Travelling 100 metres in 20 seconds gives 5 m/s.',quiz:{q:'What is the SI unit of force?',options:['Joule','Newton','Watt'],answer:1,why:'Force is measured in newtons (N).'}},
  {name:'Government',icon:'🏛️',topics:['Constitution','Democracy','Arms of government','Political parties'],notes:'Government studies how societies make and apply public decisions. Constitutions establish the main rules and institutions of a state.',example:'The legislative arm makes laws, the executive implements laws and policies, and the judiciary interprets laws.',quiz:{q:'Which arm interprets laws?',options:['Legislature','Executive','Judiciary'],answer:2,why:'The judiciary interprets and applies the law in cases.'}},
  {name:'Economics',icon:'📈',topics:['Demand and supply','Production','Money','Banking'],notes:'Economics studies choices about limited resources. Scarcity means people must choose how to use available resources.',example:'When price rises, quantity demanded generally falls, all else being equal. This is the law of demand.',quiz:{q:'What does scarcity mean?',options:['Unlimited resources','Limited resources compared with wants','No human wants'],answer:1,why:'Scarcity exists because resources are limited while wants are many.'}},
  {name:'Geography',icon:'🌍',topics:['Map reading','Climate','Landforms','Population'],notes:'Geography explores places, environments and how people interact with them. Maps represent places using symbols and scale.',example:'A map scale of 1:100,000 means 1 cm on the map represents 100,000 cm (1 km) on the ground.',quiz:{q:'What does a map scale help you calculate?',options:['Real-world distance','Air temperature only','Population age'],answer:0,why:'A scale relates map distance to ground distance.'}}
];

function toast(message) {
  const el = $('toast');
  if (!el) { alert(message); return; }
  el.textContent = message; el.classList.remove('hidden');
  clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.add('hidden'), 4500);
}
function openWhatsApp(message) {
  const number = String(subscription.whatsappNumber || '').replace(/\D/g,'');
  if (!number) { toast('WhatsApp number is missing in js/config.js.'); return; }
  const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}
function make(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}
function renderSubjects() {
  const grid = $('subjectGrid'); if (!grid) return;
  grid.replaceChildren();
  subjects.forEach((subject, index) => {
    const button = make('button','subject-card'); button.type = 'button';
    button.append(make('h3','',`${subject.icon} ${subject.name}`), make('p','',`${subject.topics.length} study topics · Notes and practice`));
    button.addEventListener('click', () => showLesson(index));
    grid.append(button);
  });
}
function showLesson(index) {
  const s = subjects[index], content = $('lessonContent');
  if (!s || !content) return;
  content.replaceChildren();
  content.append(make('p','eyebrow','STUDY NOTES'), make('h2','',`${s.icon} ${s.name}`), make('p','',s.notes), make('h3','','Topics to explore'));
  const list = make('ul'); s.topics.forEach(topic => list.append(make('li','',topic))); content.append(list);
  content.append(make('h3','','Worked example'), make('p','',s.example), make('h3','','Quick practice'));
  const quiz = make('div','quiz-question'); quiz.append(make('strong','',s.quiz.q));
  const form = make('form'); form.className = 'quiz-form';
  s.quiz.options.forEach((option,i) => {
    const label = make('label'); const radio = document.createElement('input');
    radio.type = 'radio'; radio.name = `answer-${index}`; radio.value = String(i); radio.required = true;
    label.append(radio, document.createTextNode(' '+option)); form.append(label);
  });
  const submit = make('button','btn btn-primary','Check answer'); submit.type = 'submit'; form.append(submit);
  const feedback = make('p','feedback',''); feedback.setAttribute('aria-live','polite');
  form.addEventListener('submit', e => {
    e.preventDefault(); const selected = form.querySelector('input:checked');
    if (!selected) return;
    const correct = Number(selected.value) === s.quiz.answer;
    feedback.textContent = (correct ? 'Correct! ' : 'Not quite. ') + s.quiz.why;
    feedback.style.color = correct ? '#18875b' : '#a14444';
    try { const key='learnnest-progress'; const p=JSON.parse(localStorage.getItem(key)||'{}'); p[s.name]={answered:true,correct}; localStorage.setItem(key,JSON.stringify(p)); } catch {}
  });
  quiz.append(form,feedback); content.append(quiz);
  content.append(make('p','tiny', approved ? 'Your subscription is approved.' : 'These are starter learning notes. Full premium access remains pending until an administrator verifies payment.'));
  $('subjectGrid')?.classList.add('hidden'); $('lessonArea')?.classList.remove('hidden'); $('lessonArea')?.scrollIntoView({behavior:'smooth',block:'start'});
}
function setupButtons() {
  $('backSubjects')?.addEventListener('click', () => { $('lessonArea')?.classList.add('hidden'); $('subjectGrid')?.classList.remove('hidden'); $('subjects')?.scrollIntoView({behavior:'smooth'}); });
  $('whatsappPay')?.addEventListener('click', e => { e.preventDefault(); openWhatsApp(`Hello, I want to subscribe to LearnNest for ₦${subscription.monthlyPrice || 2500} per month. Please confirm payment details.`); });
  $('liveRequest')?.addEventListener('click', e => { e.preventDefault(); openWhatsApp('Hello, I would like to request a live lesson on LearnNest. Please share available times.'); });
  $('copyAccount')?.addEventListener('click', async () => {
    const details = `Bank: ${subscription.bankName}\nAccount name: ${subscription.accountName}\nAccount number: ${subscription.accountNumber}\nAmount: ₦${subscription.monthlyPrice}`;
    try { await navigator.clipboard.writeText(details); toast('Payment details copied.'); }
    catch { toast(details); }
  });
  $('refreshSubscription')?.addEventListener('click', refreshSubscription);
  $('signInBtn')?.addEventListener('click', signIn);
  $('signOutBtn')?.addEventListener('click', async () => {
    if (!auth) { toast('Google sign-in is not configured yet.'); return; }
    try { const {signOut} = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js'); await signOut(auth); }
    catch (e) { toast(`Could not sign out: ${e.message}`); }
  });
}
async function signIn() {
  if (!auth) { toast('Sign-in is unavailable. Check your internet connection and Firebase configuration.'); return; }
  try {
    const {GoogleAuthProvider, signInWithPopup} = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js');
    await signInWithPopup(auth, new GoogleAuthProvider());
  } catch (e) { toast(`Sign-in failed: ${e.message || 'Please try again.'}`); }
}
async function refreshSubscription() {
  const status = $('subscriptionStatus'); if (!status) return;
  if (!currentUser || !db) { approved=false; status.textContent='Sign in with Google to check your subscription.'; return; }
  status.textContent='Checking subscription…';
  try {
    const {doc,getDoc} = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js');
    const snap = await getDoc(doc(db,'subscriptions',currentUser.uid));
    const data = snap.exists() ? snap.data() : {};
    const expiry = data.expiresAt?.toDate ? data.expiresAt.toDate() : null;
    approved = data.status === 'approved' && (!expiry || expiry > new Date());
    status.textContent = approved ? `Your subscription is approved${expiry ? ` until ${expiry.toLocaleDateString()}` : ''}.` : 'No active approval found yet. If you have paid, send your receipt on WhatsApp and wait for the administrator to review it.';
  } catch (e) { status.textContent='Could not check status. Check your internet connection and Firestore rules, then try again.'; console.error(e); }
}
async function initFirebase() {
  try {
    const appMod = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js');
    const authMod = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js');
    const dbMod = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js');
    const app = appMod.initializeApp(firebaseConfig);
    auth = authMod.getAuth(app); db = dbMod.getFirestore(app); firebaseReady = true;
    authMod.onAuthStateChanged(auth, user => {
      currentUser = user;
      $('userLabel').textContent = user ? (user.displayName || user.email || 'Signed in') : 'Not signed in';
      $('signInBtn')?.classList.toggle('hidden',!!user); $('signOutBtn')?.classList.toggle('hidden',!user);
      if (user) refreshSubscription();
      else { approved=false; $('subscriptionStatus').textContent='Sign in with Google, send your receipt on WhatsApp, then check your status after the administrator reviews it.'; }
    });
  } catch (e) {
    console.error('Firebase initialization failed:',e);
    $('userLabel').textContent='Sign-in unavailable';
    toast('Learning topics still work, but Google sign-in needs a working internet connection and valid Firebase setup.');
  }
}
function boot() {
  $('year').textContent = new Date().getFullYear();
  $('bankName').textContent=subscription.bankName; $('accountName').textContent=subscription.accountName; $('accountNumber').textContent=subscription.accountNumber;
  renderSubjects(); setupButtons();
  initFirebase();
}
boot();
