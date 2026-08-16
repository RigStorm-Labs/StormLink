import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { requireFields, clampProgress } from '../middleware/validate.js';

/**
 * Generic CRUD router with role-based access control:
 *   Viewer  → read only
 *   Member  → create + update
 *   Admin   → everything, including delete
 */
export function crudRouter(store, collection, { required = [], listFilters = [], readRoles = null } = {}) {
  const col = store[collection];
  const router = Router();
  router.use(requireAuth);
  const readGuard = readRoles ? requireRole(...readRoles) : (req, res, next) => next();

  router.get('/', readGuard, async (req, res, next) => {
    try {
      const filter = {};
      for (const key of listFilters) {
        if (req.query[key]) filter[key] = String(req.query[key]).slice(0, 120);
      }
      const items = await col.find(filter);
      res.json({ items });
    } catch (err) {
      next(err);
    }
  });

  router.get('/:id', readGuard, async (req, res, next) => {
    try {
      const item = await col.findById(req.params.id);
      if (!item) return res.status(404).json({ error: 'Not found' });
      res.json({ item });
    } catch (err) {
      next(err);
    }
  });

  router.post('/', requireRole('admin', 'member'), requireFields(...required), async (req, res, next) => {
    try {
      const item = await col.create(clampProgress(req.body || {}));
      res.status(201).json({ item });
    } catch (err) {
      next(err);
    }
  });

  const updateHandler = async (req, res, next) => {
    try {
      const item = await col.update(req.params.id, clampProgress(req.body || {}));
      if (!item) return res.status(404).json({ error: 'Not found' });
      res.json({ item });
    } catch (err) {
      next(err);
    }
  };
  router.put('/:id', requireRole('admin', 'member'), updateHandler);
  router.patch('/:id', requireRole('admin', 'member'), updateHandler);

  router.delete('/:id', requireRole('admin'), async (req, res, next) => {
    try {
      const removed = await col.remove(req.params.id);
      if (!removed) return res.status(404).json({ error: 'Not found' });
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
