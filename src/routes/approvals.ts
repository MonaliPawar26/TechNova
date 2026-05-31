import { Router, Response } from 'express';
import { DB } from '../config/db';
import { authenticateJWT, AuthRequest, requireRole } from '../middleware/auth';
import { executeApproval } from '../services/approvalEngine';

const router = Router();

// 1. GET ALL APPROVAL REQUESTS (Queue)
router.get('/', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const approvals = await DB.Approval.find({});
    
    // Sort so Pending is on top
    const sorted = approvals.sort((a: any, b: any) => {
      if (a.status === 'Pending' && b.status !== 'Pending') return -1;
      if (a.status !== 'Pending' && b.status === 'Pending') return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    res.json({ success: true, approvals: sorted });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// 2. PROCESS AN APPROVAL (Approve, Reject, Modify) - Restrict to Manager/Lead/Admin roles
router.post('/:id/action', authenticateJWT, requireRole(['Manager', 'Team Lead', 'Admin']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { action, modifierPayload } = req.body; // 'Approve', 'Reject', 'Modify'
    const approvalId = req.params.id;

    if (!['Approve', 'Reject', 'Modify'].includes(action)) {
      res.status(400).json({ message: 'Invalid action. Must be Approve, Reject, or Modify' });
      return;
    }

    const updatedApproval = await executeApproval(
      approvalId,
      action,
      modifierPayload,
      req.user?.id
    );

    res.json({ success: true, approval: updatedApproval });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
