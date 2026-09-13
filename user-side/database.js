import { DatabaseSync } from 'node:sqlite';
import { resolve } from 'node:path';
import { charities as seedCharities } from './data.js';
import { CATEGORY_IDS, allocationSummary } from './allocation.js';

const dbPath = process.env.DEMO_DB_PATH === ':memory:' ? ':memory:' : resolve(process.env.DEMO_DB_PATH || resolve(import.meta.dirname, 'charities.sqlite'));
const db = new DatabaseSync(dbPath);
db.exec(`PRAGMA journal_mode = DELETE;
CREATE TABLE IF NOT EXISTS charities (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL CHECK(category IN ('local','national','international')),
  name TEXT NOT NULL,
  initials TEXT NOT NULL DEFAULT '',
  theme TEXT NOT NULL DEFAULT 'green',
  logo_url TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  cause TEXT NOT NULL DEFAULT '',
  goal REAL NOT NULL DEFAULT 0 CHECK(goal >= 0),
  raised REAL NOT NULL DEFAULT 0 CHECK(raised >= 0),
  youtube_url TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published')),
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS saved_allocations (
  client_id TEXT PRIMARY KEY,
  snapshot_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);`);

// Upgrade databases created by an earlier version of the demo without clearing saved plans.
const hasRaised = db.prepare('PRAGMA table_info(charities)').all().some(column => column.name === 'raised');
if (!hasRaised) {
  db.exec('ALTER TABLE charities ADD COLUMN raised REAL NOT NULL DEFAULT 0 CHECK(raised >= 0)');
  const setRaised = db.prepare('UPDATE charities SET raised = ? WHERE id = ?');
  for (const item of seedCharities) setRaised.run(item.raised ?? 0, item.id);
}

const count = db.prepare('SELECT COUNT(*) AS count FROM charities').get().count;
if (!count) {
  const insert = db.prepare(`INSERT INTO charities
    (id,category,name,initials,theme,logo_url,description,cause,goal,raised,youtube_url,status,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  for (const item of seedCharities) insert.run(item.id, item.category, item.name, item.initials, item.theme, '', item.description, item.cause, item.goal, item.raised ?? 0, item.youtubeUrl, 'published', new Date().toISOString());
}

// Translate only untouched records from the earlier Chinese demo; team edits are preserved.
const translateSeed = db.prepare('UPDATE charities SET name = ?, initials = ?, description = ?, cause = ?, updated_at = ? WHERE id = ?');
for (const item of seedCharities) {
  const row = db.prepare('SELECT name FROM charities WHERE id = ?').get(item.id);
  if (row && /[\u3400-\u9fff]/.test(row.name)) translateSeed.run(item.name, item.initials, item.description, item.cause, new Date().toISOString(), item.id);
}

function toCharity(row) {
  return { id: row.id, category: row.category, name: row.name, initials: row.initials, theme: row.theme, logoUrl: row.logo_url, description: row.description, cause: row.cause, goal: row.goal, raised: row.raised, youtubeUrl: row.youtube_url, status: row.status, updatedAt: row.updated_at };
}

export function listCharities(includeDrafts = false) {
  const order = "ORDER BY CASE category WHEN 'local' THEN 1 WHEN 'national' THEN 2 ELSE 3 END, name";
  const rows = includeDrafts ? db.prepare(`SELECT * FROM charities ${order}`).all() : db.prepare(`SELECT * FROM charities WHERE status = 'published' ${order}`).all();
  return rows.map(toCharity);
}

function shortText(value, max, label, required = false) {
  if (typeof value !== 'string') throw new Error(`${label} must be text`);
  const text = value.trim();
  if (required && !text) throw new Error(`${label} is required`);
  if (text.length > max) throw new Error(`${label} is too long`);
  return text;
}

function optionalHttps(value, label) {
  const text = shortText(value ?? '', 500, label);
  if (!text) return '';
  let url;
  try { url = new URL(text); } catch { throw new Error(`${label} must be a valid URL`); }
  if (url.protocol !== 'https:') throw new Error(`${label} must use HTTPS`);
  return url.href;
}

function optionalYoutube(value) {
  const url = optionalHttps(value, 'youtubeUrl');
  if (!url) return '';
  const parsed = new URL(url);
  const validHost = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'].includes(parsed.hostname.toLowerCase());
  if (!validHost) throw new Error('youtubeUrl must point to YouTube');
  return url;
}

export function upsertCharity(id, input) {
  if (!/^[a-zA-Z0-9_-]{2,80}$/.test(id)) throw new Error('ID may only contain letters, numbers, underscores, or hyphens');
  if (!CATEGORY_IDS.includes(input.category)) throw new Error('category must be local, national, or international');
  if (!['draft', 'published'].includes(input.status)) throw new Error('status must be draft or published');
  const goal = Number(input.goal);
  if (!Number.isFinite(goal) || goal < 0 || goal > 1e12) throw new Error('goal must be a valid non-negative amount');
  const raised = Number(input.raised ?? 0);
  if (!Number.isFinite(raised) || raised < 0 || raised > 1e12) throw new Error('raised must be a valid non-negative amount');
  const value = {
    category: input.category,
    name: shortText(input.name, 120, 'name', true),
    initials: shortText(input.initials ?? '', 8, 'initials'),
    theme: shortText(input.theme ?? 'green', 30, 'theme'),
    logoUrl: optionalHttps(input.logoUrl, 'logoUrl'),
    description: shortText(input.description ?? '', 1000, 'description'),
    cause: shortText(input.cause ?? '', 200, 'cause'),
    goal,
    raised,
    youtubeUrl: optionalYoutube(input.youtubeUrl),
    status: input.status,
    updatedAt: new Date().toISOString()
  };
  db.prepare(`INSERT INTO charities (id,category,name,initials,theme,logo_url,description,cause,goal,raised,youtube_url,status,updated_at)
    VALUES (@id,@category,@name,@initials,@theme,@logoUrl,@description,@cause,@goal,@raised,@youtubeUrl,@status,@updatedAt)
    ON CONFLICT(id) DO UPDATE SET category=excluded.category,name=excluded.name,initials=excluded.initials,theme=excluded.theme,logo_url=excluded.logo_url,description=excluded.description,cause=excluded.cause,goal=excluded.goal,raised=excluded.raised,youtube_url=excluded.youtube_url,status=excluded.status,updated_at=excluded.updated_at`).run({ id, ...value });
  return toCharity(db.prepare('SELECT * FROM charities WHERE id = ?').get(id));
}

function validateAllocation(input) {
  if (!input || typeof input !== 'object') throw new Error('Missing allocation data');
  const clientId = shortText(input.clientId, 80, 'clientId', true);
  if (!/^[a-zA-Z0-9_-]{8,80}$/.test(clientId)) throw new Error('Invalid clientId');
  const income = Number(input.income);
  if (!Number.isFinite(income) || income < 0 || income > 1e9) throw new Error('Invalid simulated income');
  const frequency = input.frequency;
  if (!['one_time', 'monthly'].includes(frequency)) throw new Error('Choose a one-time or monthly plan');
  const paymentMethod = input.paymentMethod;
  if (!['visa_4242', 'visa_1881', 'apple_pay_demo'].includes(paymentMethod)) throw new Error('Choose a demo payment method');
  const categoryShares = input.categoryShares;
  if (!categoryShares || CATEGORY_IDS.some(id => !Number.isInteger(categoryShares[id]) || categoryShares[id] < 1) || CATEGORY_IDS.reduce((sum, id) => sum + categoryShares[id], 0) !== 100) throw new Error('Reach percentages must total 100%, with at least 1% each');
  const charityShares = {};
  const published = new Map(listCharities().map(charity => [charity.id, charity]));
  for (const categoryId of CATEGORY_IDS) {
    const shares = input.charityShares?.[categoryId] ?? {};
    if (!shares || typeof shares !== 'object' || Array.isArray(shares)) throw new Error('Invalid nonprofit shares');
    const entries = Object.entries(shares);
    if (entries.length && entries.reduce((sum, [id, share]) => {
      const charity = published.get(id);
      if (!charity || charity.category !== categoryId || !Number.isInteger(share) || share < 0 || share > 100) throw new Error('Allocation includes an invalid or unpublished nonprofit');
      return sum + share;
    }, 0) !== 100) throw new Error('Nonprofit shares within a level must total 100%');
    charityShares[categoryId] = Object.fromEntries(entries);
  }
  return { clientId, income, frequency, paymentMethod, categoryShares, charityShares, published };
}

export function saveAllocation(input) {
  const { clientId, income, frequency, paymentMethod, categoryShares, charityShares, published } = validateAllocation(input);
  const summary = allocationSummary(income, categoryShares, charityShares);
  const savedAt = new Date().toISOString();
  const snapshot = {
    clientId,
    savedAt,
    income,
    frequency,
    paymentMethod,
    categoryShares,
    charityShares,
    giving: summary.giving,
    reserved: summary.reserved,
    categories: CATEGORY_IDS.map(id => ({ id, percent: categoryShares[id], amount: summary.categories[id], charities: Object.entries(summary.charities[id] || {}).map(([charityId, amount]) => ({ id: charityId, name: published.get(charityId).name, percent: charityShares[id][charityId], amount })) }))
  };
  db.prepare(`INSERT INTO saved_allocations (client_id,snapshot_json,updated_at) VALUES (?,?,?)
    ON CONFLICT(client_id) DO UPDATE SET snapshot_json=excluded.snapshot_json,updated_at=excluded.updated_at`).run(clientId, JSON.stringify(snapshot), savedAt);
  return snapshot;
}

export function getAllocation(clientId) {
  if (!/^[a-zA-Z0-9_-]{8,80}$/.test(clientId)) return null;
  const row = db.prepare('SELECT snapshot_json FROM saved_allocations WHERE client_id = ?').get(clientId);
  return row ? JSON.parse(row.snapshot_json) : null;
}
