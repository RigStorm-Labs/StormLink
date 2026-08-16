import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

const average = (items, key = 'progress') =>
  items.length
    ? Math.round(items.reduce((sum, item) => sum + (Number(item[key]) || 0), 0) / items.length)
    : 0;

const groupCount = (items, key) =>
  items.reduce((acc, item) => {
    const value = item[key] || 'unknown';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});

export function statsRoutes(store) {
  const router = Router();

  router.get('/', requireAuth, async (req, res, next) => {
    try {
      const [projects, workflows, products, companies, goals, members, notifications] =
        await Promise.all([
          store.projects.find({}),
          store.workflows.find({}),
          store.products.find({}),
          store.companies.find({}),
          store.goals.find({}),
          store.members.find({}),
          store.notifications.find({}),
        ]);

      res.json({
        counts: {
          projects: projects.length,
          activeProjects: projects.filter((p) => p.status === 'active').length,
          workflows: workflows.length,
          products: products.length,
          companies: companies.length,
          goals: goals.length,
          members: members.length,
          unreadNotifications: notifications.filter((n) => !n.read).length,
        },
        projectsByStatus: groupCount(projects, 'status'),
        workflowsByStage: groupCount(workflows, 'stage'),
        productsByStatus: groupCount(products, 'status'),
        averageProgress: {
          projects: average(projects),
          products: average(products),
          goals: average(goals),
        },
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
