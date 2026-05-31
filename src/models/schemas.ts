import mongoose, { Schema, Document } from 'mongoose';

// ==========================================
// 1. USER SCHEMA & INTERFACE
// ==========================================
export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  avatar: string;
  department: string;
  role: 'Employee' | 'Team Lead' | 'Manager' | 'Admin';
  joinedDate: Date;
}

export const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  avatar: { type: String, default: '' },
  department: { type: String, required: true },
  role: { type: String, enum: ['Employee', 'Team Lead', 'Manager', 'Admin'], default: 'Employee' },
  joinedDate: { type: Date, default: Date.now }
});

// ==========================================
// 2. PROJECT SCHEMA & INTERFACE
// ==========================================
export interface IProject extends Document {
  name: string;
  description: string;
  owner: mongoose.Types.ObjectId | string;
  members: (mongoose.Types.ObjectId | string)[];
  status: 'Planning' | 'Active' | 'On Hold' | 'Completed';
  createdAt: Date;
}

export const ProjectSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['Planning', 'Active', 'On Hold', 'Completed'], default: 'Active' },
  createdAt: { type: Date, default: Date.now }
});

// ==========================================
// 3. TASK SCHEMA & INTERFACE
// ==========================================
export interface IComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: Date;
}

export interface IAttachment {
  name: string;
  url: string;
  size?: number;
}

export interface IExplainableAI {
  reason: string;
  confidenceScore: number; // 0-100
  supportingData: string[];
  riskLevel: 'Low' | 'Medium' | 'High';
  alternativeSuggestions: string[];
}

export interface ITask extends Document {
  title: string;
  description: string;
  assignee: mongoose.Types.ObjectId | string | null;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  deadline: Date;
  status: 'Backlog' | 'To Do' | 'In Progress' | 'Review' | 'Done';
  project: mongoose.Types.ObjectId | string | null;
  attachments: IAttachment[];
  comments: IComment[];
  priorityScore: number; // AI generated 0-100
  riskScore: number; // AI generated 0-100
  explainableAI?: IExplainableAI;
  createdAt: Date;
}

export const TaskSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  assignee: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  deadline: { type: Date, required: true },
  status: { type: String, enum: ['Backlog', 'To Do', 'In Progress', 'Review', 'Done'], default: 'To Do' },
  project: { type: Schema.Types.ObjectId, ref: 'Project', default: null },
  attachments: [{
    name: { type: String },
    url: { type: String },
    size: { type: Number }
  }],
  comments: [{
    id: { type: String },
    userId: { type: String },
    userName: { type: String },
    userAvatar: { type: String },
    content: { type: String },
    timestamp: { type: Date, default: Date.now }
  }],
  priorityScore: { type: Number, default: 50 },
  riskScore: { type: Number, default: 10 },
  explainableAI: {
    reason: { type: String },
    confidenceScore: { type: Number },
    supportingData: [String],
    riskLevel: { type: String, enum: ['Low', 'Medium', 'High'] },
    alternativeSuggestions: [String]
  },
  createdAt: { type: Date, default: Date.now }
});

// ==========================================
// 4. TEAM SCHEMA & INTERFACE
// ==========================================
export interface ITeam extends Document {
  name: string;
  description: string;
  lead: mongoose.Types.ObjectId | string;
  members: (mongoose.Types.ObjectId | string)[];
  createdAt: Date;
}

export const TeamSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  lead: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

// ==========================================
// 5. WORKSPACE SCHEMA & INTERFACE
// ==========================================
export interface IWorkspace extends Document {
  name: string;
  owner: mongoose.Types.ObjectId | string;
  members: (mongoose.Types.ObjectId | string)[];
  channels: string[];
  createdAt: Date;
}

export const WorkspaceSchema: Schema = new Schema({
  name: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  channels: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

// ==========================================
// 6. MESSAGE SCHEMA & INTERFACE
// ==========================================
export interface IMessage extends Document {
  channel: string; // e.g. "general", "design", or "dm-userId1-userId2"
  sender: mongoose.Types.ObjectId | string;
  content: string;
  attachments: IAttachment[];
  reactions: { emoji: string; users: string[] }[];
  isDirect: boolean;
  recipient?: mongoose.Types.ObjectId | string;
  timestamp: Date;
}

export const MessageSchema: Schema = new Schema({
  channel: { type: String, required: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  attachments: [{
    name: { type: String },
    url: { type: String },
    size: { type: Number }
  }],
  reactions: [{
    emoji: { type: String },
    users: [String]
  }],
  isDirect: { type: Boolean, default: false },
  recipient: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  timestamp: { type: Date, default: Date.now }
});

// ==========================================
// 7. NOTIFICATION SCHEMA & INTERFACE
// ==========================================
export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId | string;
  sender: mongoose.Types.ObjectId | string | null;
  type: 'TaskAssigned' | 'TaskUpdated' | 'Mentioned' | 'ApprovalNeeded' | 'ReportReady' | 'MeetingSummaryReady';
  title: string;
  content: string;
  read: boolean;
  link: string;
  createdAt: Date;
}

export const NotificationSchema: Schema = new Schema({
  recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  type: { type: String, enum: ['TaskAssigned', 'TaskUpdated', 'Mentioned', 'ApprovalNeeded', 'ReportReady', 'MeetingSummaryReady'], required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  read: { type: Boolean, default: false },
  link: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

// ==========================================
// 8. MEETING SCHEMA & INTERFACE
// ==========================================
export interface IMeeting extends Document {
  title: string;
  date: Date;
  transcript: string;
  summary: string;
  actionItems: { task: string; assignee: string; deadline: Date }[];
  decisions: string[];
  followUps: string[];
  creator: mongoose.Types.ObjectId | string;
  createdAt: Date;
}

export const MeetingSchema: Schema = new Schema({
  title: { type: String, required: true },
  date: { type: Date, default: Date.now },
  transcript: { type: String, required: true },
  summary: { type: String, default: '' },
  actionItems: [{
    task: { type: String },
    assignee: { type: String },
    deadline: { type: Date }
  }],
  decisions: [String],
  followUps: [String],
  creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

// ==========================================
// 9. APPROVAL SCHEMA & INTERFACE
// ==========================================
export interface IApproval extends Document {
  title: string;
  type: 'AI_Task_Schedule' | 'AI_Task_Priority' | 'AI_Task_ActionPlan' | 'Other';
  targetId: string; // The ID of the task or project being affected
  suggestedData: string; // JSON string of suggested updates
  requester: string; // AI
  reviewer: mongoose.Types.ObjectId | string | null; // User who needs to review
  status: 'Pending' | 'Approved' | 'Rejected' | 'Modified';
  explainableAI: IExplainableAI;
  createdAt: Date;
}

export const ApprovalSchema: Schema = new Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['AI_Task_Schedule', 'AI_Task_Priority', 'AI_Task_ActionPlan', 'Other'], required: true },
  targetId: { type: String, required: true },
  suggestedData: { type: String, required: true },
  requester: { type: String, default: 'SynergyAI Engine' },
  reviewer: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Modified'], default: 'Pending' },
  explainableAI: {
    reason: { type: String },
    confidenceScore: { type: Number },
    supportingData: [String],
    riskLevel: { type: String, enum: ['Low', 'Medium', 'High'] },
    alternativeSuggestions: [String]
  },
  createdAt: { type: Date, default: Date.now }
});

// ==========================================
// 10. REPORT SCHEMA & INTERFACE
// ==========================================
export interface IReport extends Document {
  title: string;
  type: 'Weekly' | 'Monthly' | 'Project' | 'Team';
  data: string; // JSON string containing metrics
  format: 'PDF' | 'CSV';
  filePath: string;
  createdBy: mongoose.Types.ObjectId | string;
  createdAt: Date;
}

export const ReportSchema: Schema = new Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['Weekly', 'Monthly', 'Project', 'Team'], required: true },
  data: { type: String, required: true },
  format: { type: String, enum: ['PDF', 'CSV'], required: true },
  filePath: { type: String, default: '' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

// ==========================================
// 11. AUDIT LOG SCHEMA & INTERFACE
// ==========================================
export interface IAuditLog extends Document {
  action: string;
  user: string; // e.g. "User Name (ID)" or "SynergyAI Engine"
  details: string;
  ipAddress?: string;
  timestamp: Date;
}

export const AuditLogSchema: Schema = new Schema({
  action: { type: String, required: true },
  user: { type: String, required: true },
  details: { type: String, required: true },
  ipAddress: { type: String },
  timestamp: { type: Date, default: Date.now }
});

// ==========================================
// MONGOOSE MODELS EXPORTS
// ==========================================
export const User = mongoose.model<IUser>('User', UserSchema);
export const Project = mongoose.model<IProject>('Project', ProjectSchema);
export const Task = mongoose.model<ITask>('Task', TaskSchema);
export const Team = mongoose.model<ITeam>('Team', TeamSchema);
export const Workspace = mongoose.model<IWorkspace>('Workspace', WorkspaceSchema);
export const Message = mongoose.model<IMessage>('Message', MessageSchema);
export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
export const Meeting = mongoose.model<IMeeting>('Meeting', MeetingSchema);
export const Approval = mongoose.model<IApproval>('Approval', ApprovalSchema);
export const Report = mongoose.model<IReport>('Report', ReportSchema);
export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
