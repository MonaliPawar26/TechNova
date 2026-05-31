import { Router, Response } from 'express';
import { DB } from '../config/db';
import { authenticateJWT, AuthRequest } from '../middleware/auth';
import { analyzeMeetingIntelligence } from '../services/gemini';
import { sendDirectNotification } from '../services/socket';

const router = Router();

// 1. GET ALL MEETINGS
router.get('/', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const meetings = await DB.Meeting.find({});
    res.json({ success: true, meetings });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// 2. GET MEETING DETAILS
router.get('/:id', authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const meeting = await DB.Meeting.findById(req.params.id);
    if (!meeting) {
      res.status(404).json({ message: 'Meeting summary not found' });
      return;
    }
    res.json({ success: true, meeting });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// 3. ANALYZE NEW MEETING TRANSCRIPT (AI Integration)
router.post('/analyze', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { title, transcript } = req.body;
    if (!title || !transcript) {
      res.status(400).json({ message: 'Meeting title and transcript are required' });
      return;
    }

    // Call Gemini meeting parser service
    const analysis = await analyzeMeetingIntelligence(title, transcript);

    // Save to Database
    const meeting = await DB.Meeting.create({
      title,
      transcript,
      summary: analysis.summary,
      actionItems: analysis.actionItems,
      decisions: analysis.decisions,
      followUps: analysis.followUps,
      creator: req.user?.id || '',
      createdAt: new Date()
    });

    // Auto-create suggested action-item tasks in Kanban backlog if requested, or notify users
    for (const item of analysis.actionItems) {
      // Find user to assign to
      const targetUser = await DB.User.findOne({ name: new RegExp(item.assignee, 'i') });
      const assigneeId = targetUser ? (targetUser._id || targetUser.id) : null;

      // Create a background notification that a meeting task is generated
      if (assigneeId) {
        const notif = await DB.Notification.create({
          recipient: assigneeId,
          sender: req.user?.id || null,
          type: 'MeetingSummaryReady',
          title: `Action Item from: "${title}"`,
          content: `You were assigned: "${item.task}". Please view the meeting summary for deadlines.`,
          link: `/dashboard/meetings`
        });
        sendDirectNotification(assigneeId, notif);
      }
    }

    // Log the AI analysis
    await DB.AuditLog.create({
      action: 'MEETING_INTELLIGENCE_ANALYZE',
      user: req.user?.name || 'System',
      details: `Analyzed meeting "${title}" with ${analysis.actionItems.length} action items generated.`
    });

    res.status(201).json({ success: true, meeting });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
