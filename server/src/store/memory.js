import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

export const COLLECTIONS = [
  'users',
  'projects',
  'workflows',
  'products',
  'companies',
  'goals',
  'members',
  'notifications',
];

function matches(doc, filter = {}) {
  return Object.entries(filter).every(([key, cond]) => {
    const value = doc[key];
    if (cond && typeof cond === 'object' && !Array.isArray(cond)) {
      if ('$in' in cond) return cond.$in.includes(value);
      if ('$ne' in cond) return value !== cond.$ne;
      if ('$regex' in cond) {
        return new RegExp(cond.$regex, cond.$options || '').test(String(value ?? ''));
      }
      return JSON.stringify(value) === JSON.stringify(cond);
    }
    return value === cond;
  });
}

function compare(a, b) {
  if (a === b) return 0;
  if (a === undefined || a === null) return -1;
  if (b === undefined || b === null) return 1;
  return a < b ? -1 : 1;
}

/**
 * Lightweight JSON-backed store that mirrors the small slice of the Mongoose
 * API the StormLink routes rely on. Used when MONGODB_URI is not configured.
 */
export function createMemoryStore({ dataFile }) {
  let state = null;
  try {
    state = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  } catch {
    state = null;
  }
  if (!state || typeof state !== 'object') {
    state = Object.fromEntries(COLLECTIONS.map((c) => [c, []]));
  }
  for (const c of COLLECTIONS) if (!Array.isArray(state[c])) state[c] = [];

  function persist() {
    try {
      fs.mkdirSync(path.dirname(dataFile), { recursive: true });
      fs.writeFileSync(dataFile, JSON.stringify(state, null, 2));
    } catch (err) {
      console.error('[stormlink] Failed to persist memory store:', err.message);
    }
  }

  function collection(name) {
    const docs = () => state[name];
    return {
      async find(filter = {}, options = {}) {
        let rows = docs().filter((d) => matches(d, filter)).map((d) => ({ ...d }));
        const sort = options.sort ?? { createdAt: -1 };
        const [key, dir] = Object.entries(sort)[0] ?? ['createdAt', -1];
        rows.sort((a, b) => compare(a[key], b[key]) * dir);
        if (options.limit) rows = rows.slice(0, options.limit);
        return rows;
      },
      async findOne(filter = {}) {
        const row = docs().find((d) => matches(d, filter));
        return row ? { ...row } : null;
      },
      async findById(id) {
        const row = docs().find((d) => d.id === id);
        return row ? { ...row } : null;
      },
      async create(doc) {
        const now = new Date().toISOString();
        const row = { ...doc, id: doc.id || randomUUID(), createdAt: now, updatedAt: now };
        docs().push(row);
        persist();
        return { ...row };
      },
      async update(id, patch) {
        const row = docs().find((d) => d.id === id);
        if (!row) return null;
        Object.assign(row, patch, { id: row.id, updatedAt: new Date().toISOString() });
        persist();
        return { ...row };
      },
      async remove(id) {
        const before = docs().length;
        state[name] = docs().filter((d) => d.id !== id);
        const removed = state[name].length !== before;
        if (removed) persist();
        return removed;
      },
      async count(filter = {}) {
        return docs().filter((d) => matches(d, filter)).length;
      },
    };
  }

  const store = { kind: 'memory' };
  for (const name of COLLECTIONS) store[name] = collection(name);
  return store;
}
