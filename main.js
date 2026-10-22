
import { firebaseConfig, subscription } from './config.js';

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';

import {
  getFirestore,
  doc,
  getDoc
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';

const $ = (id) => document.getElementById(id);

let auth;
let db;
let currentUser = null;
let approved = false;

const subjects = [
  ['Mathematics', '➗', ['Numbers', 'Algebra', 'Geometry', 'Statistics']],
  ['English Language', '📚', ['Grammar', 'Comprehension', 'Vocabulary', 'Essay writing']],
  ['Biology', '🧬', ['Cells', 'Nutrition', 'Ecology', 'Reproduction']],
  ['Chemistry', '⚗️', ['Atoms', 'Periodic table', 'Chemical reactions', 'Acids and bases']],
  ['Physics', '🔭', ['Motion', 'Energy', 'Waves', 'Electricity']],
  ['Government', '🏛️', ['Constitution', 'Democracy', 'Arms of government', 'Political parties']],
  ['Economics', '📈', ['Demand and supply', 'Production', 'Money', 'Banking']],
  ['Geography', '🌍', ['Map reading', 'Climate', 'Landforms', 'Population']]
];

function toast(message) {
  const el = $('toast');
  if (!el) {
    alert(message);
    return;
  }
  el.textContent = message;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 5000);
}

function showMessage(id, message) {
  const el = $(id);
  if (el) el.textContent = message;
}

function openWhatsApp(message) {
  const number = String(subscription?.whatsappNumber || '').replace(/\D/g, '');
  if (!number) {
    toast('WhatsApp number is missing in js/config.js.');
    return;
  }
  window.open(
    `https://wa.me/${number}?text=${encodeURIComponent(message)}`,
    '_blank'
  );
}

function renderSubjects() {
  const grid = $('subjectGrid');
  if (!grid) return;

  grid.replaceChildren();

  subjects.forEach(([name, icon, topics]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'subject-card';

    const title = document.createElement('h3');
    title.textContent = `${icon} ${name}`;

    const description = document.createElement('p');
    description.textContent = 'Tap to view study topics.';

    button.append(title, description);
    button.addEventListener('click', () => {
      const content = $('lessonContent');
      if (!content) {
        toast('Lesson section is missing from index.html.');
        return;
      }

      content.replaceChildren();

      const heading = document.createElement('h2');
      heading.textContent = name;

      const list = document.createElement('ul');
      topics.forEach(topic => {
        const item = document.createElement('li');
        item.textContent = topic;
        list.appendChild(item);
      });

      const note = document.createElement('p');
      note.textContent = approved
        ? 'Your subscription is approved.'
        : 'These are sample topics. Payment approval is required for subscription lessons.';

      content.append(heading, list, note);
      $('subjectGrid')?.classList.add('hidden');
      $('lessonArea')?.classList.remove('hidden');
    });

    grid.appendChild(button);
  });
}

function setupButtons() {
  $('backSubjects')?.addEventListener('click', () => {
    $('lessonArea')?.classList.add('hidden');
    $('subjectGrid')?.classList.remove('hidden');
  });

  $('whatsappPay')?.addEventListener('click', () => {
    openWhatsApp(
      `Hello, I want to subscribe to LearnNest for ₦${subscription.monthlyPrice || 2500} per month. Please confirm payment details.`
    );
  });

  $('liveRequest')?.addEventListener('click', () => {
    openWhatsApp('Hello, I would like to request a live lesson on LearnNest.');
  });

  $('copyAccount')?.addEventListener('click', async () => {
    const details =
      `Bank: ${subscription.bankName || 'Opay'}\n` +
      `Account name: ${subscription.accountName || 'Babel Tech'}\n` +
      `Account number: ${subscription.accountNumber || ''}\n` +
      `Amount: ₦${subscription.monthlyPrice || 2500}`;

    try {
      await navigator.clipboard.writeText(details);
      toast('Payment details copied.');
    } catch {
      toast(details);
    }
  });

  $('refreshSubscription')?.addEventListener('click', refreshSubscription);
}

async function refreshSubscription() {
  const status = $('subscriptionStatus');
  if (!status) return;

  if (!currentUser || !db) {
    approved = false;
    status.textContent = 'Sign in with Google to check your subscription.';
    return;
  }

  status.textContent = 'Checking subscription...';

  try {
    const snap = await getDoc(doc(db, 'subscriptions', currentUser.uid));
    const data = snap.exists() ? snap.data() : {};
    const expiry = data.expiresAt?.toDate
      ? data.expiresAt.toDate()
      : null;

    approved =
      data.status === 'approved' &&
      (!expiry || expiry.getTime() > Date.now());

    status.textContent = approved
      ? 'Your subscription is approved. Enjoy LearnNest!'
      : 'No active approved subscription found. Send your payment receipt to the administrator.';
  } catch (error) {
    console.error(error);
    status.textContent =
      `Subscription check failed: ${error.code || error.message}`;
  }
}

function setupFirebase() {
  const signIn = $('signInBtn');
  const signOutButton = $('signOutBtn');

  if (!firebaseConfig?.apiKey || !firebaseConfig?.projectId) {
    showMessage('subscriptionStatus', 'Check Firebase settings in js/config.js.');
    signIn?.addEventListener('click', () =>
      toast('Firebase configuration is missing.')
    );
    return;
  }

  try {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);

    signIn?.addEventListener('click', async () => {
      try {
        await signInWithPopup(auth, new GoogleAuthProvider());
      } catch (error) {
        console.error('Sign-in error:', error);
        toast(`Google sign-in failed: ${error.code || error.message}`);
      }
    });

    signOutButton?.addEventListener('click', async () => {
      try {
        await signOut(auth);
      } catch (error) {
        toast(`Sign-out failed: ${error.message}`);
      }
    });

    onAuthStateChanged(auth, async user => {
      currentUser = user;

      showMessage(
        'userLabel',
        user ? (user.displayName || user.email) : 'Not signed in'
      );

      signIn?.classList.toggle('hidden', !!user);
      signOutButton?.classList.toggle('hidden', !user);

      await refreshSubscription();
    });
  } catch (error) {
    console.error('Firebase setup error:', error);
    showMessage(
      'subscriptionStatus',
      `Firebase setup failed: ${error.message}`
    );
    toast(`Firebase setup failed: ${error.message}`);
  }
}

function start() {
  showMessage('year', String(new Date().getFullYear()));
  renderSubjects();
  setupButtons();
  setupFirebase();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start, { once: true });
} else {
  start();
}
