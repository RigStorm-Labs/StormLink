import { Router } from 'express';
import { signToken, requireAuth } from '../middleware/auth.js';
import { config } from '../config.js';

const ADMIN_USERNAME = 'rigstorm ceo';
const ADMIN_PASSWORD = 'Mango123'; // case-sensitive

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, image: user.image };
}

export function authRoutes(store) {
  const router = Router();

  async function upsertUser(profile) {
    const email = (profile.email || '').toLowerCase();
    let user = email ? await store.users.findOne({ email }) : null;
    if (!user) {
      user = await store.users.create({
        ...profile,
        email,
        role: profile.role || 'member',
        provider: profile.provider || 'credentials',
      });
    } else if (profile.role && user.role !== profile.role) {
      user = await store.users.update(user.id, { role: profile.role });
    }
    return user;
  }

  /** Admin login — username is case-insensitive, password is case-sensitive. */
  router.post('/admin', async (req, res, next) => {
    try {
      const { username = '', password = '' } = req.body || {};
      if (String(username).trim().toLowerCase() !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Invalid admin credentials' });
      }
      const user = await upsertUser({
        name: 'RigStorm CEO',
        email: 'ceo@rigstorm.dev',
        role: 'admin',
        provider: 'credentials',
      });
      return res.json({ token: signToken(user), user: publicUser(user) });
    } catch (err) {
      return next(err);
    }
  });

  /** Demo login — lets visitors explore with Member or Viewer permissions. */
  router.post('/demo', async (req, res, next) => {
    try {
      const requested = req.body?.role;
      const role = ['member', 'viewer'].includes(requested) ? requested : 'member';
      const user = await upsertUser({
        name: role === 'member' ? 'Demo Member' : 'Demo Viewer',
        email: `${role}@demo.stormlink.dev`,
        role,
        provider: 'demo',
      });
      return res.json({ token: signToken(user), user: publicUser(user) });
    } catch (err) {
      return next(err);
    }
  });

  /** Google OAuth bridge — the client signs in via NextAuth then exchanges
   *  the verified profile for a StormLink JWT. */
  router.post('/google', async (req, res, next) => {
    try {
      const { name, email, image } = req.body || {};
      if (!email || typeof email !== 'string' || !email.includes('@')) {
        return res.status(400).json({ error: 'A valid Google account email is required' });
      }
      const role = config.adminEmails.includes(email.toLowerCase()) ? 'admin' : 'member';
      const user = await upsertUser({
        name: name || email.split('@')[0],
        email,
        image,
        role,
        provider: 'google',
      });
      return res.json({ token: signToken(user), user: publicUser(user) });
    } catch (err) {
      return next(err);
    }
  });

  router.get('/me', requireAuth, (req, res) => {
    res.json({ user: req.user });
  });

  return router;
}
