import { apiUrl } from './config.js';

const form = document.querySelector('#editor');
const records = document.querySelector('#records');
const message = document.querySelector('#message');
let items = [];

function escapeHtml(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]); }
function status(text, error = false) { message.textContent = text; message.className = `status ${error ? 'error' : 'ok'}`; }

async function reload() {
  try {
    const response = await fetch(apiUrl('/api/admin/charities'), { cache: 'no-store' });
    if (!response.ok) throw new Error('Could not load records');
    items = (await response.json()).charities;
    records.innerHTML = items.map(item => `<tr><td>${escapeHtml(item.name)}</td><td>${escapeHtml(item.category)}</td><td>${escapeHtml(item.cause)}</td><td>${escapeHtml(item.status)}</td><td><button type="button" class="secondary" data-edit="${escapeHtml(item.id)}">Edit</button></td></tr>`).join('');
    if (!items.length) records.innerHTML = '<tr><td colspan="5">No records yet.</td></tr>';
  } catch (error) { status(error.message, true); }
}

function edit(item) {
  for (const name of ['id', 'category', 'status', 'name', 'initials', 'goal', 'raised', 'logoUrl', 'description', 'cause', 'youtubeUrl']) form.elements[name].value = item[name] ?? '';
  document.querySelector('#editor-heading').textContent = `Edit: ${item.name}`;
  form.elements.id.readOnly = true;
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

records.addEventListener('click', event => {
  const id = event.target.dataset.edit;
  if (id) { const item = items.find(row => row.id === id); if (item) edit(item); }
});
document.querySelector('#reload').addEventListener('click', reload);
document.querySelector('#new-record').addEventListener('click', () => { form.reset(); form.elements.id.readOnly = false; document.querySelector('#editor-heading').textContent = 'New nonprofit'; status(''); });
form.addEventListener('submit', async event => {
  event.preventDefault();
  const values = Object.fromEntries(new FormData(form));
  const id = values.id.trim();
  delete values.id;
  values.goal = Number(values.goal);
  values.raised = Number(values.raised);
  values.theme = 'green';
  try {
    const response = await fetch(apiUrl(`/api/admin/charities/${encodeURIComponent(id)}`), { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(values) });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || 'Could not save the record');
    await reload(); edit(body.charity); status('Saved. Published records are now available to the user-side demo.');
  } catch (error) { status(error.message, true); }
});
reload();
