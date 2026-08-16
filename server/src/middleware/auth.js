import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export const ROLES = { ADMIN: 'admin', MEMBER: 'member', VIEWER: 'viewer' };

export function signToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role, image: user.image },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

/** Verify the Bearer token and attach the decoded user to req.user. */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    req.user = jwt.verify(token, config.jwtSecret);
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/** Role-based access control — usage: requireRole('admin', 'member'). */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions for this action' });
    }
    return next();
  };
}
