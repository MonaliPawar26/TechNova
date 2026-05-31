import { Router, Response } from 'express';
import { DB } from '../config/db';
import { authenticateJWT, AuthRequest } from '../middleware/auth';

const router = Router();

// 1. GET PROJECTS
router.get('/', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const projects = await DB.Project.find({});
    res.json({ success: true, projects });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// 2. CREATE PROJECT
router.post('/', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, members, status } = req.body;
    
    if (!name) {
      res.status(400).json({ message: 'Project name is required' });
      return;
    }

    const project = await DB.Project.create({
      name,
      description: description || '',
      owner: req.user?.id || '',
      members: members || [req.user?.id || ''],
      status: status || 'Active',
      createdAt: new Date()
    });

    await DB.AuditLog.create({
      action: 'PROJECT_CREATE',
      user: req.user?.name || 'System',
      details: `Created new project: "${name}"`
    });

    res.status(201).json({ success: true, project });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
