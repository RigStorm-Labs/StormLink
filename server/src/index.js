import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import { config } from './config.js';
import { createStore } from './store/index.js';
import { seedStore } from './seed.js';
import { requireAuth } from './middleware/auth.js';
import { sanitizeBody } from './middleware/validate.js';
import { authRoutes } from './routes/auth.js';
import { crudRouter } from './routes/crud.js';
import { statsRoutes } from './routes/stats.js';

async function main() {
  const store = await createStore();
  await seedStore(store);

  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  // Security & performance hardening
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));
  app.use(sanitizeBody);

  const apiLimiter = rateLimit({
    windowMs: 60_000,
    max: 600,
    standardHeaders: true,
    legacyHeaders: false,
  });
  const authLimiter = rateLimit({
    windowMs: 15 * 60_000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.get('/api/health', (req, res) =>
    res.json({ ok: true, service: 'stormlink-api', store: store.kind, time: new Date().toISOString() })
  );

  app.use('/api', apiLimiter);
  app.use('/api/auth', authLimiter, authRoutes(store));
  app.use('/api/stats', statsRoutes(store));

  // Mark all notifications as read (before the generic CRUD mount)
  app.post('/api/notifications/read-all', requireAuth, async (req, res, next) => {
    try {
      const unread = await store.notifications.find({ read: false });
      for (const note of unread) await store.notifications.update(note.id, { read: true });
      res.json({ ok: true, updated: unread.length });
    } catch (err) {
      next(err);
    }
  });

  app.use('/api/projects', crudRouter(store, 'projects', { required: ['name'], listFilters: ['status', 'company'] }));
  app.use('/api/workflows', crudRouter(store, 'workflows', { required: ['name'], listFilters: ['stage', 'company'] }));
  app.use('/api/products', crudRouter(store, 'products', { required: ['name'], listFilters: ['status', 'company'] }));
  app.use('/api/companies', crudRouter(store, 'companies', { required: ['name'] }));
  app.use('/api/goals', crudRouter(store, 'goals', { required: ['title'], listFilters: ['status', 'company'] }));
  app.use('/api/members', crudRouter(store, 'members', { required: ['name'] }));
  app.use('/api/notifications', crudRouter(store, 'notifications', { required: ['title'] }));
  app.use('/api/users', crudRouter(store, 'users', { required: ['name'], readRoles: ['admin'] }));

  app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

  // Central error handler
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error('[stormlink] API error:', err);
    res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
  });

  app.listen(config.port, '0.0.0.0', () => {
    console.log(`[stormlink] API ready on http://localhost:${config.port} (store: ${store.kind})`);
  });
}

main().catch((err) => {
  console.error('[stormlink] Failed to start:', err);
  process.exit(1);
});
