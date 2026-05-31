import { Router, Response } from 'express';
import { DB, isMongoConnected } from '../config/db';
import { authenticateJWT, AuthRequest, requireRole } from '../middleware/auth';
import os from 'os';

const router = Router();

// Apply admin access restriction to all sub-routes
router.use(authenticateJWT, requireRole(['Admin']));

// 1. GET ALL USERS WITH DETAILED ROLES
router.get('/users', async (req: AuthRequest, res: Response) => {
  try {
    const users = await DB.User.find({});
    // Remove passwords before returning
    const safeUsers = users.map((u: any) => ({
      id: u._id || u.id,
      name: u.name,
      email: u.email,
      department: u.department,
      role: u.role,
      avatar: u.avatar,
      joinedDate: u.joinedDate
    }));

    res.json({ success: true, users: safeUsers });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// 2. MODIFY USER ROLE
router.put('/users/:id/role', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role } = req.body;
    if (!['Employee', 'Team Lead', 'Manager', 'Admin'].includes(role)) {
      res.status(400).json({ message: 'Invalid role assignment' });
      return;
    }

    const user = await DB.User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const updatedUser = await DB.User.findByIdAndUpdate(req.params.id, { role });

    await DB.AuditLog.create({
      action: 'ADMIN_ROLE_CHANGE',
      user: req.user?.name || 'Admin',
      details: `Changed role of user "${user.name}" from "${user.role}" to "${role}"`
    });

    res.json({
      success: true,
      message: 'User role updated successfully',
      user: {
        id: updatedUser._id || updatedUser.id,
        name: updatedUser.name,
        role
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// 3. GET SECURITY AUDIT LOGS
router.get('/logs', async (req: AuthRequest, res: Response) => {
  try {
    const logs = await DB.AuditLog.find({});
    // Sort in reverse chronological order
    const sortedLogs = logs.sort((a: any, b: any) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    res.json({ success: true, logs: sortedLogs });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// 4. SYSTEM HEALTH MONITOR
router.get('/monitor', async (req: AuthRequest, res: Response) => {
  try {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;

    const stats = {
      uptime: process.uptime(),
      platform: os.platform(),
      cpuCount: os.cpus().length,
      memory: {
        total: Math.round(totalMemory / (1024 * 1024)) + ' MB',
        used: Math.round(usedMemory / (1024 * 1024)) + ' MB',
        free: Math.round(freeMemory / (1024 * 1024)) + ' MB',
        percentage: Math.round((usedMemory / totalMemory) * 100) + '%'
      },
      database: {
        connected: isMongoConnected,
        type: isMongoConnected ? 'MongoDB Atlas' : 'Local JSON Fallback File'
      },
      status: 'Healthy'
    };

    res.json({ success: true, monitor: stats });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// 5. DELETE USER
router.delete('/users/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await DB.User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (user.email === req.user?.email) {
      res.status(400).json({ message: 'Cannot delete your own admin account' });
      return;
    }

    await DB.User.deleteOne({ _id: req.params.id });

    await DB.AuditLog.create({
      action: 'ADMIN_USER_DELETE',
      user: req.user?.name || 'Admin',
      details: `Deleted user account: "${user.name}" (${user.email})`
    });

    res.json({ success: true, message: 'User account removed successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// 6. AGGREGATE SYSTEM METRICS
router.get('/metrics', async (req: AuthRequest, res: Response) => {
  try {
    const [users, tasks, approvals, projects, messages, meetings] = await Promise.all([
      DB.User.find({}),
      DB.Task.find({}),
      DB.Approval.find({ status: 'Pending' }),
      DB.Project.find({}),
      DB.Message.find({}),
      DB.Meeting.find({})
    ]);

    res.json({
      success: true,
      metrics: {
        totalUsers: users.length,
        activeTasks: tasks.filter((t: any) => t.status !== 'Done').length,
        pendingApprovals: approvals.length,
        totalProjects: projects.length,
        totalMessages: messages.length,
        totalMeetings: meetings.length
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
