import { categories } from './data.js';
import { CATEGORY_IDS, changeCategoryPercent, changeCharityShare, equalShares, allocationSummary, clampIncome } from './allocation.js';
import { apiUrl } from './config.js';
import { TEST_VISA, formatCardNumber, formatExpiry, validateDemoCard } from './payment-demo.js';

if (window.self !== window.top) document.documentElement.classList.add('embedded');

const STORAGE_KEY = 'giving-allocation-demo-v2';
const CATEGORY_LABEL = { local: 'Local', national: 'National', international: 'International' };

function inAppShell() {
  return window.self !== window.top;
}

function nonprofitBrowseHref(categoryId) {
  if (!inAppShell()) return '#discover';
  const category = CATEGORY_LABEL[categoryId] || '';
  return category ? `/nonprofits?category=${encodeURIComponent(category)}` : '/nonprofits';
}

function nonprofitDetailHref(id) {
  return inAppShell() ? `/nonprofits/${encodeURIComponent(id)}` : '#discover';
}

function nonprofitLinkAttrs() {
  return inAppShell() ? ' target="_top"' : '';
}

function mapNonprofitCard(item) {
  const category = String(item.category || '').trim().toLowerCase();
  if (!CATEGORY_IDS.includes(category)) return null;
  const name = item.orgName || item.name || '';
  if (!name) return null;
  return {
    id: item.id,
    category,
    name,
    initials: name.split(/\s+/).filter(Boolean).map(word => word[0]).join('').slice(0, 8).toUpperCase() || 'NP',
    theme: 'blue',
    logoUrl: item.logoUrl || '',
    description: item.description || '',
    cause: item.fundingNeedStatement || item.description || '',
    goal: Number(item.targetAmount || 0),
    raised: Number(item.amountRaised || 0),
    youtubeUrl: item.videoUrl || ''
  };
}

async function fetchNonprofitModule() {
  try {
    const response = await fetch(apiUrl('/api/nonprofits?page=1&pageSize=100'), { cache: 'no-store', credentials: 'include' });
    if (!response.ok) return null;
    const payload = await response.json();
    const list = payload?.data?.list;
    if (payload?.code !== 0 || !Array.isArray(list)) return null;
    return list.map(mapNonprofitCard).filter(Boolean);
  } catch {
    return null;
  }
}
const defaults = { user: null, clientId: '', saved: null, income: 1000, frequency: 'one_time', paymentMethod: 'visa_4242', pickerCategory: 'local', categoryShares: { local: 30, national: 30, international: 40 }, charityShares: { local: {}, national: {}, international: {} }, filter: 'all' };
let charities = [];
let state = loadState();
let toastTimer;

function freshState() { return { ...structuredClone(defaults), clientId: crypto.randomUUID().replaceAll('-', '') }; }

function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || localStorage.getItem('giving-allocation-demo-v1'));
    if (!stored || typeof stored !== 'object') return freshState();
    const safe = freshState();
    if (/^[a-zA-Z0-9_-]{8,80}$/.test(stored.clientId || '')) safe.clientId = stored.clientId;
    if (stored.saved && Array.isArray(stored.saved.categories)) safe.saved = stored.saved;
    if (stored.user && typeof stored.user.name === 'string' && typeof stored.user.email === 'string') safe.user = { name: stored.user.name.slice(0, 80), email: stored.user.email.slice(0, 160) };
    safe.income = clampIncome(stored.income ?? 1000);
    if (['one_time', 'monthly'].includes(stored.frequency)) safe.frequency = stored.frequency;
    if (['visa_4242', 'apple_pay_demo'].includes(stored.paymentMethod)) safe.paymentMethod = stored.paymentMethod;
    if (CATEGORY_IDS.includes(stored.pickerCategory)) safe.pickerCategory = stored.pickerCategory;
    const shares = stored.categoryShares;
    if (shares && CATEGORY_IDS.every(id => Number.isInteger(shares[id]) && shares[id] >= 1) && CATEGORY_IDS.reduce((sum, id) => sum + shares[id], 0) === 100) safe.categoryShares = shares;
    if (stored.charityShares) for (const categoryId of CATEGORY_IDS) {
      const raw = stored.charityShares[categoryId];
      if (!raw || typeof raw !== 'object') continue;
      const entries = Object.entries(raw).filter(([id, percent]) => /^[a-zA-Z0-9_-]{2,80}$/.test(id) && Number.isInteger(percent) && percent >= 0 && percent <= 100);
      if (entries.length && entries.reduce((sum, [, percent]) => sum + percent, 0) === 100) safe.charityShares[categoryId] = Object.fromEntries(entries);
    }
    return safe;
  } catch { return freshState(); }
}

function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* Demo still works without browser storage. */ }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

function money(value) {
  return '$' + Number(value || 0).toLocaleString('en-NZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function categoryName(id) { return categories.find(item => item.id === id)?.name || id; }
function charityById(id) { return charities.find(item => item.id === id); }
function paymentLabel(method) { return method === 'apple_pay_demo' ? 'Apple Pay · demo' : method === 'visa_1881' ? 'Visa ending 1881 · demo' : 'Visa ending 4242 · demo'; }

function renderPaymentChoice() {
  const apple = state.paymentMethod === 'apple_pay_demo';
  document.querySelector('#card-fields').hidden = apple;
  document.querySelector('#apple-preview').hidden = !apple;
  document.querySelectorAll('[data-method-choice]').forEach(button => {
    const selected = button.dataset.methodChoice === state.paymentMethod;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  document.querySelector('#payment-error').hidden = true;
}

function showWallet() {
  const summary = allocationSummary(state.income, state.categoryShares, state.charityShares);
  document.querySelector('#wallet-amount').textContent = money(summary.giving);
  document.querySelector('#wallet-frequency').textContent = state.frequency === 'monthly' ? 'Monthly plan' : 'One-time plan';
  document.querySelector('#wallet-overlay').hidden = false;
  document.querySelector('#wallet-confirm').focus();
}

function hideWallet() {
  document.querySelector('#wallet-overlay').hidden = true;
  document.querySelector('#save-allocation').focus();
}

function safeYoutubeUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return null;
    const host = url.hostname.toLowerCase();
    if (host === 'youtu.be' && /^\/[a-zA-Z0-9_-]{6,}$/.test(url.pathname)) return url.href;
    if (['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(host) &&
        ((url.pathname === '/watch' && /^[a-zA-Z0-9_-]{6,}$/.test(url.searchParams.get('v') || '')) || /^\/(shorts|embed)\/[a-zA-Z0-9_-]{6,}$/.test(url.pathname))) return url.href;
  } catch { /* Invalid URL. */ }
  return null;
}

function safeImageUrl(value) {
  try { const url = new URL(value); return url.protocol === 'https:' ? url.href : null; } catch { return null; }
}

function notify(message) {
  const toast = document.querySelector('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

function renderAccount() {
  const root = document.querySelector('#account-view');
  document.querySelector('#signup-panel-title').textContent = state.user ? 'Welcome back' : 'Create a demo profile';
  document.querySelector('#signup-panel-subtitle').textContent = state.user ? 'Your demo profile is ready' : 'About 30 seconds';
  document.querySelector('#signup-skip').hidden = Boolean(state.user);
  if (state.user) {
    root.innerHTML = `<div class="account-active"><a class="account-active-main" href="#step1" aria-label="Continue as ${escapeHtml(state.user.name)} to Step 1"><span class="account-avatar">${escapeHtml(state.user.name[0] || 'G')}</span><span><h3>Hello, ${escapeHtml(state.user.name)}</h3><p>${escapeHtml(state.user.email)} · demo profile</p></span><span class="account-enter" aria-hidden="true">→</span></a><a class="button button-primary account-continue" href="#step1">Continue to Step 1 →</a><button class="button-quiet" id="reset-account" type="button">Switch profile</button></div>`;
  } else {
    root.innerHTML = `<div class="account-intro"><div><h3>Create a demo profile</h3><p>Try the personal giving dashboard.</p></div><span aria-hidden="true">✳</span></div><form class="account-form" id="signup-form"><input name="name" aria-label="Name" placeholder="Your name" maxlength="80" required><input name="email" type="email" aria-label="Email" placeholder="Email address" maxlength="160" required><button class="button button-primary" type="submit">Get started</button></form>`;
  }
}

function renderRoute() {
  const requested = location.hash.slice(1);
  const step = /^step[123]$/.test(requested) ? Number(requested.slice(-1)) : requested === 'dashboard' ? 1 : null;
  const page = step ? 'dashboard' : ['home', 'signup', 'discover', 'summary'].includes(requested) ? requested : 'home';
  document.querySelectorAll('[data-page]').forEach(element => element.classList.toggle('is-active', element.dataset.page === page));
  document.querySelectorAll('[data-nav]').forEach(element => element.classList.toggle('active', element.dataset.nav === page));
  document.querySelectorAll('[data-step-panel]').forEach(element => element.classList.toggle('is-active', Number(element.dataset.stepPanel) === step));
  document.querySelectorAll('[data-step-link]').forEach(element => {
    const active = Number(element.dataset.stepLink) === step;
    element.classList.toggle('active', active);
    if (active) element.setAttribute('aria-current', 'step'); else element.removeAttribute('aria-current');
  });
  if (step) {
    const titles = { 1: ['Set your amount and reach', 'Start with simulated income, then divide the giving amount.'], 2: ['Choose your nonprofits', 'Select recipients one level at a time.'], 3: ['Review and save', 'Choose a giving plan and check the amounts before submitting.'] };
    document.querySelector('#wizard-kicker').textContent = `STEP ${step} OF 3`;
    document.querySelector('#wizard-title').textContent = titles[step][0];
    document.querySelector('#dashboard-welcome').textContent = titles[step][1];
  }
  document.title = `${({ home: 'Home', signup: 'Demo signup', dashboard: 'My allocation', discover: 'Discover', summary: 'My overview' })[page]} · Giving Compass`;
  if (page === 'discover' || page === 'dashboard') refreshCharities();
  window.scrollTo(0, 0);
}

function renderCategories(summary) {
  document.querySelector('#category-total').textContent = `Total ${CATEGORY_IDS.reduce((sum, id) => sum + state.categoryShares[id], 0)}%`;
  document.querySelector('#category-grid').innerHTML = categories.map(category => `<article class="category-card"><div class="category-top"><span class="category-icon">${category.icon}</span><span class="category-name">${category.name}</span></div><p>${category.description}</p><div class="percent-row"><label class="percent-input"><input type="number" min="1" max="98" step="1" value="${state.categoryShares[category.id]}" data-category-input="${category.id}" aria-label="${category.name} percentage"><span>%</span></label><span class="category-amount">${money(summary.categories[category.id])}</span></div><input type="range" min="1" max="98" step="1" value="${state.categoryShares[category.id]}" data-category-range="${category.id}" aria-label="Adjust ${category.name} percentage"></article>`).join('');
}

function renderSelections(summary) {
  document.querySelector('#selection-tabs').innerHTML = categories.map(category => `<button type="button" class="selection-tab${state.pickerCategory === category.id ? ' active' : ''}" data-selection-tab="${category.id}" role="tab" aria-selected="${state.pickerCategory === category.id}">${category.name}<small>${Object.keys(state.charityShares[category.id]).length} selected</small></button>`).join('');
  document.querySelector('#selection-list').innerHTML = categories.filter(category => category.id === state.pickerCategory).map(category => {
    const shares = state.charityShares[category.id];
    const ids = Object.keys(shares);
    const available = charities.filter(charity => charity.category === category.id && !(charity.id in shares));
    const rows = ids.length ? ids.map(id => {
      const charity = charityById(id) || { name: 'Nonprofit details changed', cause: 'Please choose again' };
      return `<div class="selected-charity"><div class="selected-name">${escapeHtml(charity.name)}<small>${money(summary.charities[category.id]?.[id] || 0)} / ${escapeHtml(charity.cause)}</small></div><label class="share-control"><input type="number" min="0" max="100" step="1" value="${shares[id]}" data-share-input="${id}" aria-label="${escapeHtml(charity.name)} share within ${category.name}">%</label><button type="button" class="remove-button" data-remove="${id}" aria-label="Remove ${escapeHtml(charity.name)}" title="Remove nonprofit">×</button></div>`;
    }).join('') : `<div class="empty-selection">No nonprofit selected. ${money(summary.categories[category.id])} in ${category.name} is reserved and unassigned.</div>`;
    const browse = `<a class="inline-details-link" href="${nonprofitBrowseHref(category.id)}"${nonprofitLinkAttrs()}>Browse ${category.name} nonprofits →</a>`;
    const picker = available.length
      ? `<div class="inline-picker"><label>Add a ${category.name} nonprofit</label><p class="picker-hint">These organizations come from the nonprofit directory.</p>${available.map(charity => `<div class="module-pick-row"><span>${escapeHtml(charity.name)}</span><a href="${nonprofitDetailHref(charity.id)}"${nonprofitLinkAttrs()}>Details</a><button type="button" class="add-button" data-add="${charity.id}">+ Add</button></div>`).join('')}${browse}</div>`
      : `<div class="inline-picker inline-picker-empty">No published ${category.name} nonprofits yet. ${browse}</div>`;
    return `<div class="selection-card"><div class="selection-title"><strong>${category.icon} ${category.name} nonprofits</strong><span>${ids.length ? `${ids.length} selected · 100% assigned` : 'Awaiting selection'}</span></div>${rows}${picker}</div>`;
  }).join('');
}

function addCharity(id) {
  const charity = charityById(id);
  if (!charity) { notify('Choose an available nonprofit first.'); return; }
  if (id in state.charityShares[charity.category]) return;
  const ids = [...Object.keys(state.charityShares[charity.category]), id];
  state.charityShares[charity.category] = equalShares(ids);
  state.pickerCategory = charity.category;
  renderAllocation();
  notify(`${charity.name} was added. Shares in this level were split evenly.`);
}

function renderSummary(summary) {
  document.querySelector('#summary-giving').textContent = money(summary.giving);
  document.querySelector('#reserved-amount').textContent = money(summary.reserved);
  document.querySelector('#summary-breakdown').innerHTML = categories.map(category => {
    const rows = Object.entries(summary.charities[category.id] || {});
    return `<div class="summary-group"><div class="summary-group-head"><span>${category.icon} ${category.name} · ${state.categoryShares[category.id]}%</span><strong>${money(summary.categories[category.id])}</strong></div>${rows.length ? rows.map(([id, amount]) => `<div class="summary-row"><span>${escapeHtml(charityById(id)?.name || 'Nonprofit details changed')}</span><span>${money(amount)}</span></div>`).join('') : `<div class="summary-empty">No nonprofit selected · reserved</div>`}</div>`;
  }).join('');
}

function renderSavedOverview() {
  const saved = state.saved;
  document.querySelector('#saved-empty').hidden = Boolean(saved);
  document.querySelector('#saved-view').hidden = !saved;
  if (!saved) return;
  document.querySelector('#saved-subtitle').textContent = 'This page shows your most recently saved allocation.';
  document.querySelector('#result-giving').textContent = money(saved.giving);
  document.querySelector('#result-income').textContent = `10% of ${money(saved.income)} simulated income`;
  document.querySelector('#result-reserved').textContent = money(saved.reserved);
  document.querySelector('#saved-at').textContent = `Saved ${new Date(saved.savedAt).toLocaleString('en-NZ')}. Your overview changes only when you submit again.`;
  document.querySelector('#result-plan-details').innerHTML = `<div class="plan-detail"><span>Giving frequency</span><strong>${saved.frequency === 'monthly' ? 'Monthly' : 'One-time'}</strong></div><div class="plan-detail"><span>Payment method</span><strong>${paymentLabel(saved.paymentMethod)}</strong></div><div class="plan-detail"><span>Payment status</span><strong>Demo only · not charged</strong></div>`;
  const local = saved.categoryShares.local;
  const national = local + saved.categoryShares.national;
  document.querySelector('#result-ring').style.background = `conic-gradient(#1E90FF 0 ${local}%, #67B7FF ${local}% ${national}%, #B8DEFF ${national}% 100%)`;
  document.querySelector('#result-breakdown').innerHTML = saved.categories.map(item => {
    const category = categories.find(value => value.id === item.id);
    return `<div class="result-category"><div class="result-category-head"><span>${category.icon} ${category.name} · ${item.percent}%</span><strong>${money(item.amount)}</strong></div><div class="result-category-sub">${item.charities.length ? `${item.charities.length} nonprofits · 100% assigned within this level` : 'No nonprofit selected · amount reserved'}</div>${item.charities.map(charity => `<div class="result-charity"><span>${escapeHtml(charity.name)} · ${charity.percent}%</span><span>${money(charity.amount)}</span></div>`).join('')}</div>`;
  }).join('');
}

function renderSaveStatus() {
  const saved = state.saved;
  const same = saved && saved.income === state.income && saved.frequency === state.frequency && saved.paymentMethod === state.paymentMethod && JSON.stringify(saved.categoryShares) === JSON.stringify(state.categoryShares) && JSON.stringify(saved.charityShares) === JSON.stringify(state.charityShares);
  document.querySelector('#save-status').textContent = !saved ? 'When you are ready, save to create your personal overview.' : same ? 'Your current plan is saved. Open My overview to see it.' : 'You have unsaved changes. Submit again to update My overview.';
}

function renderDiscovery() {
  const tabs = [{ id: 'all', name: 'All nonprofits' }, ...categories];
  document.querySelector('#filter-tabs').innerHTML = tabs.map(tab => `<button class="filter-tab${state.filter === tab.id ? ' active' : ''}" type="button" data-filter="${tab.id}" aria-pressed="${state.filter === tab.id}">${tab.name}</button>`).join('');
  const shown = state.filter === 'all' ? charities : charities.filter(item => item.category === state.filter);
  if (!shown.length) {
    document.querySelector('#charity-grid').innerHTML = '<div class="directory-empty">No published nonprofits are available yet. Refresh this list later.</div>';
    return;
  }
  document.querySelector('#charity-grid').innerHTML = shown.map(charity => {
    const selected = charity.id in state.charityShares[charity.category];
    const videoUrl = safeYoutubeUrl(charity.youtubeUrl);
    const logoUrl = safeImageUrl(charity.logoUrl);
    const progress = charity.goal > 0 ? Math.min(100, Math.round(charity.raised / charity.goal * 100)) : 0;
    const profileUrl = `/nonprofits/${encodeURIComponent(charity.id)}`;
    return `<article class="charity-card"><div class="charity-card-top"><span class="logo ${escapeHtml(charity.theme)}">${logoUrl ? `<img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(charity.name)} logo">` : escapeHtml(charity.initials)}</span><span class="scope-tag">${categoryName(charity.category)}</span></div><h3><a class="charity-card-title-link" href="${profileUrl}" target="_top">${escapeHtml(charity.name)}</a></h3><p>${escapeHtml(charity.description)}</p><div class="cause">Funding cause · <strong>${escapeHtml(charity.cause)}</strong></div><div class="goal">${money(charity.raised)} raised of ${money(charity.goal)}</div><div class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}" aria-label="Fundraising progress"><span style="width:${progress}%"></span></div><div class="charity-card-actions"><div class="charity-card-links">${videoUrl ? `<a class="intro-link" href="${escapeHtml(videoUrl)}" target="_blank" rel="noopener noreferrer">▶ Watch introduction</a>` : `<span class="intro-link disabled">No intro video yet</span>`}<a class="intro-link" href="${profileUrl}" target="_top">View full profile →</a></div><button type="button" class="add-button${selected ? ' selected' : ''}" data-add="${charity.id}" ${selected ? 'disabled' : ''}>${selected ? '✓ Added' : '+ Add to my plan'}</button></div></article>`;
  }).join('');
}

function renderAllocation() {
  const summary = allocationSummary(state.income, state.categoryShares, state.charityShares);
  renderCategories(summary);
  renderSelections(summary);
  renderSummary(summary);
  renderDiscovery();
  renderSaveStatus();
  document.querySelector('#giving-amount').textContent = money(summary.giving);
  document.querySelector('#giving-period').textContent = state.frequency === 'monthly' ? 'Planned monthly contribution' : 'Planned one-time contribution';
  document.querySelector('#income-note').textContent = state.frequency === 'monthly' ? 'Simulated monthly income — change it any time.' : 'Simulated income for this one-time plan.';
  saveState();
}

async function refreshCharities(showMessage = false) {
  try {
    const fromModule = await fetchNonprofitModule();
    if (fromModule) {
      charities = fromModule;
    } else {
      const response = await fetch(apiUrl('/api/charities'), { cache: 'no-store' });
      if (!response.ok) throw new Error('Could not load nonprofits');
      const data = await response.json();
      charities = data.charities;
    }
    let removed = 0;
    for (const categoryId of CATEGORY_IDS) {
      const original = state.charityShares[categoryId];
      const ids = Object.keys(original).filter(id => charities.some(charity => charity.id === id && charity.category === categoryId));
      if (ids.length !== Object.keys(original).length) {
        state.charityShares[categoryId] = equalShares(ids);
        removed++;
      }
    }
    renderAllocation();
    if (removed) notify('Some nonprofits are no longer published. Your draft was updated; your saved overview is unchanged.');
    else if (showMessage) notify('Nonprofit information is up to date.');
  } catch { if (showMessage) notify('Could not load nonprofits. Check the demo server.'); }
}

async function loadSavedAllocation() {
  const clientId = state.clientId;
  try {
    const response = await fetch(apiUrl(`/api/allocations/${encodeURIComponent(clientId)}`), { cache: 'no-store' });
    if (state.clientId !== clientId) return;
    if (response.status === 404) { state.saved = null; renderSavedOverview(); renderSaveStatus(); return; }
    if (!response.ok) return;
    state.saved = (await response.json()).allocation;
    saveState(); renderSavedOverview(); renderSaveStatus();
  } catch { /* Keep local snapshot if offline. */ }
}

async function submitAllocation(walletConfirmed = false) {
  if (state.paymentMethod === 'apple_pay_demo' && !walletConfirmed) { showWallet(); return; }
  if (state.paymentMethod !== 'apple_pay_demo') {
    const error = validateDemoCard({
      name: document.querySelector('#card-name').value,
      number: document.querySelector('#card-number').value,
      expiry: document.querySelector('#card-expiry').value,
      cvc: document.querySelector('#card-cvc').value
    });
    if (error) {
      const box = document.querySelector('#payment-error');
      box.textContent = error.message;
      box.hidden = false;
      document.querySelector(`#${error.field}`).focus();
      return;
    }
  }
  const button = document.querySelector('#save-allocation');
  button.disabled = true;
  button.textContent = 'Saving…';
  try {
    const response = await fetch(apiUrl('/api/allocations'), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ clientId: state.clientId, income: state.income, frequency: state.frequency, paymentMethod: state.paymentMethod, categoryShares: state.categoryShares, charityShares: state.charityShares }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Could not save the plan');
    state.saved = data.allocation;
    document.querySelector('#card-name').value = '';
    document.querySelector('#card-number').value = '';
    document.querySelector('#card-expiry').value = '';
    document.querySelector('#card-cvc').value = '';
    saveState(); renderSavedOverview(); renderSaveStatus();
    notify('Your plan has been saved.');
    location.hash = '#summary';
  } catch (error) { notify(error.message || 'Could not save the plan. Please try again.'); }
  finally { button.disabled = false; button.textContent = 'Submit & save →'; }
}

document.addEventListener('submit', event => {
  if (event.target.id !== 'signup-form') return;
  event.preventDefault();
  const form = new FormData(event.target);
  const name = String(form.get('name') || '').trim();
  const email = String(form.get('email') || '').trim();
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { notify('Please enter your name and a valid email address.'); return; }
  state.user = { name: name.slice(0, 80), email: email.slice(0, 160) };
  renderAccount(); saveState(); notify('Your demo profile is ready.'); location.hash = '#step1';
});

document.querySelector('#income').addEventListener('input', event => {
  state.income = clampIncome(event.target.value);
  renderAllocation();
});

document.addEventListener('input', event => {
  if (event.target.id === 'card-number') { event.target.value = formatCardNumber(event.target.value); document.querySelector('#payment-error').hidden = true; return; }
  if (event.target.id === 'card-expiry') { event.target.value = formatExpiry(event.target.value); document.querySelector('#payment-error').hidden = true; return; }
  if (event.target.id === 'card-cvc') { event.target.value = event.target.value.replace(/\D/g, '').slice(0, 3); document.querySelector('#payment-error').hidden = true; return; }
  if (event.target.id === 'card-name') { document.querySelector('#payment-error').hidden = true; return; }
  const id = event.target.dataset.categoryRange;
  if (!id) return;
  state.categoryShares = changeCategoryPercent(state.categoryShares, id, event.target.value);
  renderAllocation();
});

document.addEventListener('change', event => {
  if (event.target.id === 'income') { event.target.value = String(state.income); return; }
  if (event.target.name === 'frequency') {
    state.frequency = event.target.value; renderAllocation(); return;
  }
  const categoryId = event.target.dataset.categoryInput;
  if (categoryId) {
    state.categoryShares = changeCategoryPercent(state.categoryShares, categoryId, event.target.value);
    renderAllocation(); return;
  }
  const charityId = event.target.dataset.shareInput;
  if (charityId) {
    const charity = charityById(charityId);
    state.charityShares[charity.category] = changeCharityShare(state.charityShares[charity.category], charityId, event.target.value);
    renderAllocation();
  }
});

document.addEventListener('click', event => {
  if (event.target.closest('#wallet-confirm')) { hideWallet(); submitAllocation(true); return; }
  if (event.target.closest('[data-wallet-close]')) { hideWallet(); return; }
  if (event.target.closest('#fill-demo-card')) {
    const future = new Date().getFullYear() + 2;
    document.querySelector('#card-name').value = 'Demo Supporter';
    document.querySelector('#card-number').value = TEST_VISA;
    document.querySelector('#card-expiry').value = `12 / ${String(future).slice(-2)}`;
    document.querySelector('#card-cvc').value = '123';
    document.querySelector('#payment-error').hidden = true;
    notify('Test card filled. No real card details are needed.'); return;
  }
  const method = event.target.closest('[data-method-choice]')?.dataset.methodChoice;
  if (method) { state.paymentMethod = method; renderPaymentChoice(); renderSaveStatus(); saveState(); return; }
  if (event.target.closest('#save-allocation')) { submitAllocation(); return; }
  if (event.target.closest('#refresh-charities')) { refreshCharities(true); return; }
  const browseLink = event.target.closest('[data-browse-nonprofits]');
  if (browseLink) {
    if (inAppShell()) {
      event.preventDefault();
      window.top.location.href = nonprofitBrowseHref(state.pickerCategory);
    }
    return;
  }
  const selectionTab = event.target.closest('[data-selection-tab]')?.dataset.selectionTab;
  if (selectionTab) { state.pickerCategory = selectionTab; renderSelections(allocationSummary(state.income, state.categoryShares, state.charityShares)); saveState(); return; }
  const pickedCategory = event.target.closest('[data-add-picked]')?.dataset.addPicked;
  if (pickedCategory) { addCharity(document.querySelector(`[data-picker="${pickedCategory}"]`)?.value); return; }
  const find = event.target.closest('[data-find]')?.dataset.find;
  if (find) { state.filter = find; renderDiscovery(); location.hash = '#discover'; return; }
  const filter = event.target.closest('[data-filter]')?.dataset.filter;
  if (filter) { state.filter = filter; renderDiscovery(); return; }
  const add = event.target.closest('[data-add]')?.dataset.add;
  if (add) { addCharity(add); return; }
  const remove = event.target.closest('[data-remove]')?.dataset.remove;
  if (remove) {
    const charity = charityById(remove);
    if (!charity) return;
    state.charityShares[charity.category] = equalShares(Object.keys(state.charityShares[charity.category]).filter(id => id !== remove));
    renderAllocation(); notify(`${charity.name} was removed.`); return;
  }
  if (event.target.closest('#reset-account')) {
    state = freshState(); document.querySelector('#income').value = String(state.income);
    document.querySelector(`input[name="frequency"][value="${state.frequency}"]`).checked = true;
    renderPaymentChoice();
    renderAccount(); renderAllocation(); renderSavedOverview(); saveState(); notify('A new demo profile has been started.'); location.hash = '#signup';
  }
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !document.querySelector('#wallet-overlay').hidden) hideWallet();
});

document.querySelector('#income').value = String(state.income);
document.querySelector(`input[name="frequency"][value="${state.frequency}"]`).checked = true;
renderPaymentChoice();
renderAccount();
renderAllocation();
renderSavedOverview();
window.addEventListener('hashchange', renderRoute);
renderRoute();
loadSavedAllocation();
