/**
 * Input sanitization & validation — strips angle brackets (XSS hardening),
 * trims strings, caps lengths and enforces required fields.
 */

export function sanitizeValue(value, depth = 0) {
  if (depth > 6) return null;
  if (typeof value === 'string') {
    return value.replace(/[<>]/g, '').trim().slice(0, 4000);
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === 'boolean') return value;
  if (Array.isArray(value)) {
    return value.slice(0, 50).map((v) => sanitizeValue(v, depth + 1)).filter((v) => v !== null);
  }
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (/^[a-zA-Z0-9_$-]{1,64}$/.test(k)) out[k] = sanitizeValue(v, depth + 1);
    }
    return out;
  }
  return value === undefined || value === null ? value : null;
}

export function sanitizeBody(req, res, next) {
  if (req.body && typeof req.body === 'object') req.body = sanitizeValue(req.body);
  next();
}

export function requireFields(...fields) {
  return (req, res, next) => {
    const body = req.body || {};
    const missing = fields.filter(
      (f) => body[f] === undefined || body[f] === null || String(body[f]).trim() === ''
    );
    if (missing.length) {
      return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
    }
    return next();
  };
}

export function clampProgress(body) {
  if (body.progress !== undefined) {
    const n = Number(body.progress);
    body.progress = Number.isFinite(n) ? Math.max(0, Math.min(100, Math.round(n))) : 0;
  }
  return body;
}
