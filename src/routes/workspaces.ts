import { Router, Response } from 'express';
import { DB } from '../config/db';
import { authenticateJWT, AuthRequest } from '../middleware/auth';

const router = Router();

// GET ACTIVE WORKSPACE DETAILS
router.get('/', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    let workspaces = await DB.Workspace.find({});
    if (workspaces.length === 0) {
      // Seed default workspace if none
      const defaultWS = await DB.Workspace.create({
        name: 'SynergyAI Default Workspace',
        owner: req.user?.id || '',
        members: [req.user?.id || ''],
        channels: ['general', 'announcements', 'rnd-ai', 'product-ops'],
        createdAt: new Date()
      });
      workspaces = [defaultWS];
    }

    res.json({ success: true, workspace: workspaces[0] });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE CHANNEL IN WORKSPACE
router.post('/channels', authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ message: 'Channel name is required' });
      return;
    }

    const workspaces = await DB.Workspace.find({});
    if (workspaces.length === 0) {
      res.status(404).json({ message: 'No workspace found' });
      return;
    }

    const workspace = workspaces[0];
    const cleanedName = name.toLowerCase().replace(/\s+/g, '-');
    
    if (workspace.channels.includes(cleanedName)) {
      res.status(400).json({ message: 'Channel already exists' });
      return;
    }

    const updatedChannels = [...workspace.channels, cleanedName];
    await DB.Workspace.findByIdAndUpdate(workspace._id || workspace.id, { channels: updatedChannels });

    await DB.AuditLog.create({
      action: 'CHANNEL_CREATE',
      user: req.user?.name || 'System',
      details: `Created workspace channel: #${cleanedName}`
    });

    res.status(201).json({ success: true, channel: cleanedName, channels: updatedChannels });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
