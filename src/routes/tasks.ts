import { Router, Response } from 'express';
import { DB } from '../config/db';
import { authenticateJWT, AuthRequest } from '../middleware/auth';
import { triggerAITaskEvaluation } from '../services/approvalEngine';
import { getIO } from '../services/socket';

const router = Router();

// 1. GET ALL TASKS (with filters)
router.get('/', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { status, priority, projectId, search } = req.query;
    const query: any = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (projectId) query.project = projectId;

    let tasks = await DB.Task.find(query);

    // Filter by search text
    if (search) {
      const searchStr = (search as string).toLowerCase();
      tasks = tasks.filter((t: any) => 
        t.title.toLowerCase().includes(searchStr) || 
        t.description.toLowerCase().includes(searchStr)
      );
    }

    res.json({ success: true, tasks });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// 2. GET TASK BY ID
router.get('/:id', authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await DB.Task.findById(req.params.id);
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }
    res.json({ success: true, task });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// 3. CREATE TASK
router.post('/', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, assignee, priority, deadline, status, project } = req.body;

    const task = await DB.Task.create({
      title,
      description: description || '',
      assignee: assignee || null,
      priority: priority || 'Medium',
      deadline: deadline ? new Date(deadline) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      status: status || 'To Do',
      project: project || null,
      attachments: [],
      comments: [],
      priorityScore: 50,
      riskScore: 10,
      createdAt: new Date()
    });

    // Create Audit Log
    const creatorName = req.user ? req.user.name : 'Unknown';
    await DB.AuditLog.create({
      action: 'TASK_CREATE',
      user: creatorName,
      details: `Created task "${title}" in state: ${status || 'To Do'}`
    });

    // Trigger AI evaluation in the background
    triggerAITaskEvaluation(task._id || task.id).catch(console.error);

    // Notify assignee
    if (assignee) {
      await DB.Notification.create({
        recipient: assignee,
        sender: req.user ? req.user.id : null,
        type: 'TaskAssigned',
        title: 'New Task Assigned',
        content: `You have been assigned to task: "${title}".`,
        link: '/dashboard/tasks'
      });
    }

    res.status(201).json({ success: true, task });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// 4. UPDATE TASK
router.put('/:id', authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, assignee, priority, deadline, status, project } = req.body;
    const taskId = req.params.id;

    const existingTask = await DB.Task.findById(taskId);
    if (!existingTask) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (assignee !== undefined) updates.assignee = assignee;
    if (priority !== undefined) updates.priority = priority;
    if (deadline !== undefined) updates.deadline = new Date(deadline);
    
    const statusChanged = status !== undefined && existingTask.status !== status;
    if (status !== undefined) updates.status = status;
    if (project !== undefined) updates.project = project;

    const updatedTask = await DB.Task.findByIdAndUpdate(taskId, updates);

    // Broadcast update via Socket.io if task status was dragged/moved
    if (statusChanged && req.user) {
      try {
        const io = getIO();
        io.emit('task:moved', {
          taskId,
          fromStatus: existingTask.status,
          toStatus: status,
          updatedBy: req.user.name
        });
      } catch (e) {
        // Socket not running/initialized yet
      }

      // Log drag and drop
      await DB.AuditLog.create({
        action: 'TASK_STATUS_MOVE',
        user: req.user.name,
        details: `Moved task "${existingTask.title}" from "${existingTask.status}" to "${status}"`
      });
    }

    // Trigger AI evaluation in the background (will re-score based on status, deadline, etc.)
    triggerAITaskEvaluation(taskId).catch(console.error);

    res.json({ success: true, task: updatedTask });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// 5. ADD COMMENT
router.post('/:id/comments', authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { content } = req.body;
    if (!content) {
      res.status(400).json({ message: 'Comment content is required' });
      return;
    }

    const task = await DB.Task.findById(req.params.id);
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    const newComment = {
      id: Math.random().toString(36).substring(2, 9),
      userId: req.user?.id || '',
      userName: req.user?.name || 'Anonymous User',
      userAvatar: req.user?.name 
        ? `https://ui-avatars.com/api/?name=${encodeURIComponent(req.user.name)}&background=8b5cf6&color=fff`
        : 'https://ui-avatars.com/api/?name=User',
      content,
      timestamp: new Date()
    };

    const comments = [...(task.comments || []), newComment];
    const updatedTask = await DB.Task.findByIdAndUpdate(req.params.id, { comments });

    // Notify assignee if someone else commented
    if (task.assignee && task.assignee.toString() !== req.user?.id) {
      await DB.Notification.create({
        recipient: task.assignee,
        sender: req.user?.id || null,
        type: 'Mentioned',
        title: 'New Comment on Task',
        content: `${req.user?.name} commented on "${task.title}": "${content.slice(0, 30)}..."`,
        link: '/dashboard/tasks'
      });
    }

    res.status(201).json({ success: true, comment: newComment, task: updatedTask });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// 6. ADD ATTACHMENT
router.post('/:id/attachments', authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, url, size } = req.body;
    if (!name || !url) {
      res.status(400).json({ message: 'Attachment name and URL are required' });
      return;
    }

    const task = await DB.Task.findById(req.params.id);
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    const newAttachment = { name, url, size: size || 0 };
    const attachments = [...(task.attachments || []), newAttachment];
    const updatedTask = await DB.Task.findByIdAndUpdate(req.params.id, { attachments });

    res.status(201).json({ success: true, attachment: newAttachment, task: updatedTask });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// 7. DELETE TASK
router.delete('/:id', authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await DB.Task.findById(req.params.id);
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    await DB.Task.deleteOne({ _id: req.params.id });

    // Create Audit Log
    const userName = req.user ? req.user.name : 'Unknown';
    await DB.AuditLog.create({
      action: 'TASK_DELETE',
      user: userName,
      details: `Deleted task "${task.title}"`
    });

    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
