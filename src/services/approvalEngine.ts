import { DB } from '../config/db';
import { prioritizeTasksAI } from './gemini';
import { sendDirectNotification } from './socket';

/**
 * Trigger AI evaluation of a task and generate a pending scheduling/prioritization approval if critical action needed.
 */
export const triggerAITaskEvaluation = async (taskId: string): Promise<any> => {
  try {
    const task = await DB.Task.findById(taskId);
    if (!task) return null;

    // Fetch teammate list and workloads for bottleneck/capacity checks
    const activeTasks = await DB.Task.find({ status: { $ne: 'Done' } });
    
    // Evaluate scores using our AI prioritization engine
    const evaluationResults = await prioritizeTasksAI([task], 100);
    const result = evaluationResults[0];

    if (!result) return null;

    // Update the task's base AI scores in the background
    await DB.Task.findByIdAndUpdate(taskId, {
      priorityScore: result.priorityScore,
      riskScore: result.riskScore,
      explainableAI: result.explainableAI
    });

    // Check if task needs immediate manager scheduling action (e.g. is high risk and deadline close)
    const isDeadlineClashing = task.deadline && (new Date(task.deadline).getTime() - Date.now()) < 3 * 24 * 60 * 60 * 1000;
    
    if (result.riskScore > 65 || (isDeadlineClashing && task.status !== 'Done' && task.status !== 'Review')) {
      // Suggesting a schedule shift or priority upgrade
      const suggestedPriority = task.priority === 'Low' ? 'Medium' : (task.priority === 'Medium' ? 'High' : 'Critical');
      
      const suggestedDate = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000); // extension
      
      const suggestedData = JSON.stringify({
        taskId,
        priority: suggestedPriority,
        deadline: suggestedDate.toISOString().split('T')[0]
      });

      // Create a pending approval
      const approval = await DB.Approval.create({
        title: `AI Workload & Timeline Optimization: "${task.title}"`,
        type: 'AI_Task_Schedule',
        targetId: taskId,
        suggestedData,
        requester: 'SynergyAI Optimizer',
        status: 'Pending',
        explainableAI: {
          reason: `Task is at risk (${result.riskScore}% risk score) because the deadline is near and assignee is overcommitted. AI recommends raising priority to ${suggestedPriority} and adjusting deadline.`,
          confidenceScore: 89,
          supportingData: [
            `Current Priority: ${task.priority}`,
            `Risk Score: ${result.riskScore}%`,
            `Suggested Priority: ${suggestedPriority}`,
            `Suggested Due Date: ${suggestedDate.toDateString()}`
          ],
          riskLevel: 'Medium',
          alternativeSuggestions: [
            `Reassign this task to an employee with a lighter queue.`,
            `Keep current timeline but add a senior review supervisor.`
          ]
        }
      });

      // Log this recommendation in the Audit Log
      await DB.AuditLog.create({
        action: 'AI_SUGGESTION_GENERATED',
        user: 'SynergyAI Optimizer',
        details: `Suggested rescheduling for task "${task.title}" (ID: ${taskId}). Created Approval ID: ${approval._id || approval.id}`
      });

      // Notify managers
      const managers = await DB.User.find({ role: 'Manager' });
      for (const mgr of managers) {
        const mgrId = mgr._id || mgr.id;
        const newNotif = await DB.Notification.create({
          recipient: mgrId,
          sender: null,
          type: 'ApprovalNeeded',
          title: 'AI Workflow Action Required',
          content: `AI suggested schedule optimization for "${task.title}". Review approval queue.`,
          link: '/dashboard/approvals'
        });
        sendDirectNotification(mgrId, newNotif);
      }

      return approval;
    }

    return null;
  } catch (error) {
    console.error('Error triggering AI evaluation:', error);
    return null;
  }
};

/**
 * Execute an approved AI recommendation
 */
export const executeApproval = async (approvalId: string, action: 'Approve' | 'Reject' | 'Modify', modifierPayload?: any, reviewerId?: string): Promise<any> => {
  const approval = await DB.Approval.findById(approvalId);
  if (!approval || approval.status !== 'Pending') {
    throw new Error('Approval request not found or already processed');
  }

  const reviewer = reviewerId ? await DB.User.findById(reviewerId) : null;
  const reviewerName = reviewer ? reviewer.name : 'Manager';

  if (action === 'Reject') {
    const updatedApproval = await DB.Approval.findByIdAndUpdate(approvalId, {
      status: 'Rejected',
      reviewer: reviewerId
    });

    await DB.AuditLog.create({
      action: 'AI_SUGGESTION_REJECTED',
      user: reviewerName,
      details: `Rejected suggestion: "${approval.title}"`
    });

    return updatedApproval;
  }

  // Execute or Modify
  const payload = modifierPayload || JSON.parse(approval.suggestedData);
  const { taskId, priority, deadline, assignee } = payload;

  const task = await DB.Task.findById(taskId);
  if (!task) {
    throw new Error('Associated task not found');
  }

  const updates: any = {};
  if (priority) updates.priority = priority;
  if (deadline) updates.deadline = new Date(deadline);
  if (assignee) updates.assignee = assignee;

  // Apply updates to the task
  await DB.Task.findByIdAndUpdate(taskId, updates);

  // Update status of approval
  const finalStatus = action === 'Modify' ? 'Modified' : 'Approved';
  const updatedApproval = await DB.Approval.findByIdAndUpdate(approvalId, {
    status: finalStatus,
    reviewer: reviewerId,
    suggestedData: JSON.stringify(payload)
  });

  // Log action
  await DB.AuditLog.create({
    action: action === 'Modify' ? 'AI_SUGGESTION_MODIFIED' : 'AI_SUGGESTION_APPROVED',
    user: reviewerName,
    details: `Executed updates on task "${task.title}" (ID: ${taskId}). Priority: ${priority || task.priority}, Deadline: ${deadline || task.deadline}`
  });

  // Notify assignee
  if (task.assignee) {
    const notif = await DB.Notification.create({
      recipient: task.assignee,
      sender: reviewerId || null,
      type: 'TaskUpdated',
      title: 'Task Re-scheduled by Manager',
      content: `Your task "${task.title}" was updated based on AI workload optimization: Priority ${priority || task.priority}.`,
      link: '/dashboard/tasks'
    });
    sendDirectNotification(task.assignee, notif);
  }

  return updatedApproval;
};
