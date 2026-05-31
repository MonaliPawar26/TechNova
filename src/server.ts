import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import path from 'path';

// Load env variables
dotenv.config();

import { connectDB, DB } from './config/db';
import { initSocket } from './services/socket';
import { rateLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';

// Import Routes
import authRoutes from './routes/auth';
import taskRoutes from './routes/tasks';
import projectRoutes from './routes/projects';
import workspaceRoutes from './routes/workspaces';
import messageRoutes from './routes/messages';
import meetingRoutes from './routes/meetings';
import approvalRoutes from './routes/approvals';
import reportRoutes from './routes/reports';
import analyticsRoutes from './routes/analytics';
import adminRoutes from './routes/admin';

const app = express();
const server = http.createServer(app);

// Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(rateLimiter);

// Serve static assets if any
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Mount API Routers
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'SynergyAI - Enterprise Workplace Platform API is online',
    status: 'Healthy',
    timestamp: new Date()
  });
});

// Error handling middleware
app.use(errorHandler);

// SEED DATABASE WITH COMPREHENSIVE INDIAN CORPORATE DEMO DATA
const seedDatabase = async () => {
  try {
    console.log('🧹 Wiping existing database records to prepare fresh demo mode...');
    await DB.User.deleteMany({});
    await DB.Project.deleteMany({});
    await DB.Task.deleteMany({});
    await DB.Team.deleteMany({});
    await DB.Workspace.deleteMany({});
    await DB.Message.deleteMany({});
    await DB.Notification.deleteMany({});
    await DB.Meeting.deleteMany({});
    await DB.Approval.deleteMany({});
    await DB.Report.deleteMany({});
    await DB.AuditLog.deleteMany({});

    console.log('🌱 Seeding TechNova Solutions Pvt Ltd Hackathon Demo Dataset...');

    // Hash passwords
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    // 1. CREATE USERS (66 total: 1 Admin, 5 Managers, 10 Team Leads, 50 Employees)
    const departments = [
      'Engineering',
      'Artificial Intelligence',
      'Data Analytics',
      'Product Management',
      'UI/UX Design',
      'Marketing',
      'Sales',
      'Human Resources',
      'Operations'
    ];

    // Admin
    const adminUser = await DB.User.create({
      name: 'Monali Pawar',
      email: 'admin@synergyai.com',
      password: passwordHash,
      avatar: 'https://ui-avatars.com/api/?name=Monali+Pawar&background=7c3aed&color=fff&bold=true',
      department: 'Executive Office',
      role: 'Admin',
      joinedDate: new Date('2024-01-15')
    });

    // Managers
    const managersList = [
      { name: 'Rahul Sharma', email: 'manager@synergyai.com', dept: 'Engineering' },
      { name: 'Priya Verma', email: 'priya@synergyai.com', dept: 'Artificial Intelligence' },
      { name: 'Amit Joshi', email: 'amit@synergyai.com', dept: 'Data Analytics' },
      { name: 'Sneha Kulkarni', email: 'sneha@synergyai.com', dept: 'UI/UX Design' },
      { name: 'Vikram Deshmukh', email: 'vikram@synergyai.com', dept: 'Operations' }
    ];

    const managers: any[] = [];
    for (const m of managersList) {
      const u = await DB.User.create({
        name: m.name,
        email: m.email,
        password: passwordHash,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=0284c7&color=fff&bold=true`,
        department: m.dept,
        role: 'Manager',
        joinedDate: new Date('2024-03-10')
      });
      managers.push(u);
    }

    // Team Leads
    const leadsList = [
      { name: 'Pranjal Navgale', email: 'lead@synergyai.com', dept: 'Engineering' },
      { name: 'Nikhil Rathod', email: 'nikhil@synergyai.com', dept: 'Artificial Intelligence' },
      { name: 'Pranav Patil', email: 'pranav@synergyai.com', dept: 'Data Analytics' },
      { name: 'Rohan Patil', email: 'rohan@synergyai.com', dept: 'Product Management' },
      { name: 'Anjali Sharma', email: 'anjali@synergyai.com', dept: 'UI/UX Design' },
      { name: 'Sakshi Gupta', email: 'sakshi@synergyai.com', dept: 'Marketing' },
      { name: 'Omkar Wankhede', email: 'omkar@synergyai.com', dept: 'Sales' },
      { name: 'Vaibhav Deshpande', email: 'vaibhav@synergyai.com', dept: 'Human Resources' },
      { name: 'Aarav Mehta', email: 'aarav@synergyai.com', dept: 'Operations' },
      { name: 'Neha Kulkarni', email: 'neha@synergyai.com', dept: 'Engineering' }
    ];

    const leads: any[] = [];
    for (const l of leadsList) {
      const u = await DB.User.create({
        name: l.name,
        email: l.email,
        password: passwordHash,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(l.name)}&background=db2777&color=fff&bold=true`,
        department: l.dept,
        role: 'Team Lead',
        joinedDate: new Date('2024-05-18')
      });
      leads.push(u);
    }

    // Employees (50 total)
    const employeeNames = [
      'Arjun Patil', 'Aditya Deshmukh', 'Aakash Verma', 'Yash Sharma', 'Tanmay Joshi',
      'Karan Pawar', 'Rohit Mishra', 'Harsh Gupta', 'Aniket Wankhede', 'Abhishek Jadhav',
      'Riya Patel', 'Ananya Sharma', 'Pooja Verma', 'Sakshi Patil', 'Kavya Joshi',
      'Neha Gupta', 'Shruti Kulkarni', 'Ishita Mehta', 'Aditi Deshmukh', 'Prachi Pawar',
      'Swapnil Shinde', 'Gauri Kulkarni', 'Kunal Kamble', 'Tejas Rane', 'Divya Nair',
      'Manish Joshi', 'Nehal Shah', 'Parth Desai', 'Rutuja Sawant', 'Shalini Iyer',
      'Shreeram Nair', 'Sandeep Rao', 'Vivek Hegde', 'Jyoti Pillai', 'Akhil Reddy',
      'Swathi Bhat', 'Manoj Gowda', 'Kiran Kumar', 'Nidhi Hegde', 'Abhay Sharma',
      'Ritu Jain', 'Deepa Singh', 'Vikas Gupta', 'Pooja Gupta', 'Sneha Sharma',
      'Ajay Sen', 'Vishal Seth', 'Meera Nair', 'Suresh Kumar', 'Rajesh Nair'
    ];

    const employees: any[] = [];
    // Seed first employee as employee@synergyai.com to match quicklogin
    const emp1 = await DB.User.create({
      name: employeeNames[0],
      email: 'employee@synergyai.com',
      password: passwordHash,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(employeeNames[0])}&background=2563eb&color=fff&bold=true`,
      department: 'Engineering',
      role: 'Employee',
      joinedDate: new Date('2024-06-01')
    });
    employees.push(emp1);

    for (let i = 1; i < employeeNames.length; i++) {
      const name = employeeNames[i];
      const dept = departments[i % departments.length];
      const email = `${name.toLowerCase().replace(/\s+/g, '')}@synergyai.com`;
      const u = await DB.User.create({
        name,
        email,
        password: passwordHash,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2563eb&color=fff&bold=true`,
        department: dept,
        role: 'Employee',
        joinedDate: new Date('2024-08-10')
      });
      employees.push(u);
    }

    console.log(`✅ ${employees.length + leads.length + managers.length + 1} users created successfully.`);

    // 2. CREATE DEFAULT WORKSPACE
    const allUserIds = [
      adminUser._id || adminUser.id,
      ...managers.map(m => m._id || m.id),
      ...leads.map(l => l._id || l.id),
      ...employees.map(e => e._id || e.id)
    ];

    const workspace = await DB.Workspace.create({
      name: 'TechNova Solutions Workspace',
      owner: adminUser._id || adminUser.id,
      members: allUserIds,
      channels: ['general', 'announcements', 'rnd-ai', 'product-ops', 'marketing-campaigns', 'sales-leads'],
      createdAt: new Date()
    });

    // 3. CREATE PROJECTS (20 total)
    const projectNames = [
      'AI Collaboration Platform',
      'Smart HR Automation',
      'Predictive Analytics Dashboard',
      'Industrial Threat Detection System',
      'Customer Experience AI',
      'Smart Inventory Management',
      'Bengaluru Smart Grid Platform',
      'Mumbai FinTech Gateway',
      'Digital India Health Portal',
      'Namami Gange Analytics Engine',
      'Kochi Smart Port Router',
      'Cyberabad AgriTech Core',
      'Nagpur Logistics Optimizer',
      'Pune Auto-Manufacturing Analytics',
      'Hyderabad Biotech Cloud',
      'Chennai SaaS Billing Core',
      'Bharat Supply Chain Dashboard',
      'TechNova Employee Performance Hub',
      'Real-Time Telecom Latency Monitor',
      'Indian Retail Omnichannel Core'
    ];

    const projects: any[] = [];
    for (let i = 0; i < projectNames.length; i++) {
      const managerIndex = i % managers.length;
      const leadIndex = i % leads.length;
      const empIndex1 = (i * 2) % employees.length;
      const empIndex2 = (i * 2 + 1) % employees.length;

      const proj = await DB.Project.create({
        name: projectNames[i],
        description: `TechNova initiative targeting high-performance ${projectNames[i].toLowerCase()} deliverables in the South Asian enterprise sector.`,
        owner: managers[managerIndex]._id || managers[managerIndex].id,
        members: [
          leads[leadIndex]._id || leads[leadIndex].id,
          employees[empIndex1]._id || employees[empIndex1].id,
          employees[empIndex2]._id || employees[empIndex2].id
        ],
        status: i % 5 === 0 ? 'Planning' : i % 5 === 4 ? 'Completed' : 'Active',
        createdAt: new Date('2024-02-01')
      });
      projects.push(proj);
    }

    console.log(`✅ ${projects.length} Indian Corporate projects initialized.`);

    // 4. CREATE 250 TASKS
    const taskTitlesTemplate = [
      'Implement JWT Authentication', 'Create Dashboard Analytics', 'Integrate Gemini API',
      'Optimize MongoDB Queries', 'Design User Profile Page', 'Implement Role-Based Access',
      'Build Kanban Board', 'Create AI Recommendation Engine', 'Generate Monthly Reports',
      'Develop Notification System', 'Refactor Global CSS', 'Deploy to AWS Cloud',
      'Audit AWS S3 Encryption Keys', 'Optimize Image Asset Compression', 'Add Multi-Factor Security Check',
      'Construct Excel Exporter Service', 'Localize Workspace Timelines', 'Configure Docker Compose Scripts',
      'Benchmark API Route Durations', 'Perform Penetration Assessment', 'Verify SSL Certificate Expiry',
      'Setup Socket.io Rooms', 'Build Slack Bot Webhooks', 'Draft System Architecture Artifact',
      'Build Executive PDF Layout', 'Integrate Redis Session Logs', 'Audit MongoDB Index Fragmentation'
    ];

    const taskStatuses = ['Backlog', 'To Do', 'In Progress', 'Review', 'Done'];
    const taskPriorities = ['Critical', 'High', 'Medium', 'Low'];

    console.log('Generating 250 tasks...');
    for (let i = 1; i <= 250; i++) {
      const proj = projects[i % projects.length];
      const assignee = employees[i % employees.length];
      const leadUser = leads[i % leads.length];
      const titleTemplate = taskTitlesTemplate[i % taskTitlesTemplate.length];
      const title = `${titleTemplate} – Batch ${Math.ceil(i / taskTitlesTemplate.length)}`;
      const status = taskStatuses[i % taskStatuses.length];
      const priority = taskPriorities[i % taskPriorities.length];

      const priorityScore = Math.floor(Math.random() * 60) + 30; // 30 - 90
      const riskScore = Math.floor(Math.random() * 70) + 15; // 15 - 85
      const deadlineDays = (i % 7) - 3; // -3 to +3 days from now
      const deadline = new Date(Date.now() + deadlineDays * 24 * 60 * 60 * 1000);

      // Create a few detailed comments for task realism
      const comments = i % 10 === 0 ? [
        {
          id: `comment_${i}`,
          userId: leadUser._id || leadUser.id,
          userName: leadUser.name,
          userAvatar: leadUser.avatar,
          content: 'Please verify that index scopes are fully functional before committing code.',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000)
        }
      ] : [];

      await DB.Task.create({
        title,
        description: `This critical TechNova operations task delivers high-priority features for ${proj.name}. Ensure strict compliance with coding benchmarks.`,
        assignee: assignee._id || assignee.id,
        priority,
        deadline,
        status,
        project: proj._id || proj.id,
        attachments: [],
        comments,
        priorityScore,
        riskScore,
        explainableAI: i % 4 === 0 ? {
          reason: `Explainable AI Engine: Prioritized at ${priorityScore}% due to downstream dependency triggers on project ${proj.name}. Assignee workload index is currently at ${Math.floor(Math.random() * 40) + 60}%.`,
          confidenceScore: Math.floor(Math.random() * 20) + 75,
          supportingData: ['Milestone critical path analysis', 'Team latency logs'],
          riskLevel: riskScore > 65 ? 'High' : riskScore > 40 ? 'Medium' : 'Low',
          alternativeSuggestions: [`Delegate task allocations to another engineer, or schedule reviews by Lead ${leadUser.name}.`]
        } : undefined
      });
    }

    console.log('✅ 250 tasks created and distributed.');

    // 5. CREATE 15 MEETINGS
    const meetingTemplates = [
      { title: 'TechNova Q3 Sprint Planning', desc: 'Planning the upcoming release cycle deliverables.' },
      { title: 'AI Feature & Model Optimization', desc: 'Assessing Gemini token context limits and output formatting.' },
      { title: 'Client Requirement Gateway Review', desc: 'Syncing custom SaaS widgets with offshore client partners.' },
      { title: 'Monthly Workplace Performance Review', desc: 'Reviewing employee efficiency ratios and index increases.' },
      { title: 'Product Roadmap & Bengaluru Launch', desc: 'Evaluating product marketing strategies for the local hackathon.' },
      { title: 'Information Security System Audit Review', desc: 'Reviewing JWT expiration thresholds and database fallback caches.' },
      { title: 'Bengaluru AI Core Sync', desc: 'Reviewing smart grid integrations.' },
      { title: 'FinTech Payment Gateway Check', desc: 'Assessing Mumbai branch transactions routing latency.' },
      { title: 'AgriTech Regional Coordination', desc: 'AgriTech pilot updates.' },
      { title: 'Ganges Water Analytics Sync', desc: 'Reviewing database telemetry pipelines.' },
      { title: 'Operations & Smart Grid Launch', desc: 'Preparing final client deployments.' },
      { title: 'Weekly Product Management Alignment', desc: 'Aligning weekly milestones across Bengaluru offices.' },
      { title: 'UI/UX Visual Design Critique', desc: 'Critique of glassmorphic elements.' },
      { title: 'Operations Resource Optimization', desc: 'Discussing budget revisions.' },
      { title: 'Nagpur Logistics Integration Sync', desc: 'Operations pipeline checks.' }
    ];

    const meetings: any[] = [];
    for (let i = 0; i < 15; i++) {
      const m = meetingTemplates[i];
      const leadUser = leads[i % leads.length];
      const meet = await DB.Meeting.create({
        title: m.title,
        summary: `Meeting minutes for "${m.title}".\n\nExecutive Summary:\n${m.desc} The Bangalore R&D teams have finalized the primary architecture parameters.\n\nDecisions:\n- Approve architectural layouts and code migration reviews.\n- Setup database fallbacks for offline testing.\n- Deliver task reports by tomorrow.\n- Enforce JWT authentication rotation scripts.`,
        decisions: [
          'Approve architectural blueprints and SaaS index additions.',
          'Optimize database queries below 100ms.',
          'Enforce JWT token rotation scripts.'
        ],
        followUps: [
          `John Doe to coordinate with Lead ${leadUser.name} on database benchmarks.`,
          'Deploy updated code files to AWS staging clusters.'
        ],
        actionItems: [
          { task: `Optimize core databases indices and verify latency profiles`, assignee: 'Arjun Patil', deadline: '2026-06-12' },
          { task: `Conduct security penetration testing on staging server`, assignee: 'Aditya Deshmukh', deadline: '2026-06-18' }
        ],
        createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      });
      meetings.push(meet);
    }

    console.log(`✅ ${meetings.length} meeting intelligence logs created.`);

    // 6. CREATE 50 AI RECOMMENDATIONS
    const recommendationTemplates = [
      'High workload detected for Engineering team. Recommend reassigning 12 tasks.',
      'Sales department productivity increased by 18%. Recommend increasing campaign budget.',
      'Three critical tasks are likely to miss deadlines. Recommend manager review.',
      'Operations queue latency is high in the Pune branch. Recommend delegating review items.',
      'High index utilization observed on fallback databases. Consider Atlas cluster upgrades.',
      'Marketing campaign deliverables require creative design resources. Recommend task transfer.'
    ];

    for (let i = 1; i <= 50; i++) {
      const randText = recommendationTemplates[i % recommendationTemplates.length];
      const leadUser = leads[i % leads.length];
      await DB.Approval.create({
        title: `AI Optimization Recommendation #${i}: ${randText.substring(0, 45)}...`,
        type: 'AI_Task_Schedule',
        targetId: adminUser._id || adminUser.id,
        suggestedData: JSON.stringify({
          recommendationId: `ai_rec_${i}`,
          impactFactor: 'High',
          actionSuggested: randText
        }),
        requester: 'TechNova SynergyAI Optimizer',
        status: i % 3 === 0 ? 'Approved' : 'Pending',
        explainableAI: {
          reason: `AI detected bottleneck patterns in Team Lead ${leadUser.name}'s task pipeline. Accept recommendation to optimize efficiency ratios immediately.`,
          confidenceScore: Math.floor(Math.random() * 20) + 78,
          supportingData: ['Workload analysis', 'Latency thresholds exceeded'],
          riskLevel: i % 2 === 0 ? 'Medium' : 'Low',
          alternativeSuggestions: ['Manually adjust sprint hours or defer database optimizations.']
        }
      });
    }

    console.log('✅ 50 AI recommendations generated.');

    // 7. CREATE 25 APPROVAL REQUESTS
    const approvalTypes = [
      'Budget Approval',
      'Leave Approval',
      'Project Deadline Extension',
      'Task Reassignment',
      'Team Resource Allocation'
    ];

    for (let i = 1; i <= 25; i++) {
      const type = approvalTypes[i % approvalTypes.length];
      const leadUser = leads[i % leads.length];
      const managerUser = managers[i % managers.length];

      const proj = projects[i % projects.length];

      await DB.Approval.create({
        title: `TechNova ${type} Request #${1000 + i} – Bengaluru Branch`,
        type: 'Resource_Request',
        targetId: proj._id || proj.id,
        suggestedData: JSON.stringify({
          amount: `${Math.floor(Math.random() * 50000) + 10000} INR`,
          reason: `Required for cloud scaling staging nodes during client demo cycles.`
        }),
        requester: leadUser.name,
        status: i % 4 === 0 ? 'Approved' : i % 4 === 3 ? 'Rejected' : 'Pending',
        explainableAI: {
          reason: `Explainable AI Engine: Workflow verified with zero conflicts. Recommend immediate Manager approval to maintain milestone timeline deliverables.`,
          confidenceScore: Math.floor(Math.random() * 15) + 82,
          supportingData: ['Available budget overhead', 'Timeline risk index'],
          riskLevel: 'Low',
          alternativeSuggestions: ['Request partial allocation first or use cheaper staging clusters.']
        }
      });
    }

    console.log('✅ 25 approval requests seeded.');

    // 8. CREATE 100 NOTIFICATIONS
    const notificationTemplates = [
      'Rahul Sharma assigned a new task to your queue.',
      'Sprint review meeting starts in 30 minutes in conference room 3B.',
      'AI generated the monthly TechNova productivity report.',
      'Manager Rahul Sharma approved the workload workflow recommendation.',
      'Anjali Sharma posted a comment on database schema optimization task.',
      'Critical system update: Fallback database JSON cached successfully.',
      'Priya Verma requested resource logs access.',
      'Amit Joshi rescheduled client requirement meeting.'
    ];

    for (let i = 1; i <= 100; i++) {
      const leadUser = leads[i % leads.length];
      const template = notificationTemplates[i % notificationTemplates.length];
      await DB.Notification.create({
        recipient: leadUser._id || leadUser.id,
        sender: managers[i % managers.length]._id || managers[i % managers.length].id,
        type: i % 3 === 0 ? 'TaskAssigned' : i % 3 === 1 ? 'ApprovalNeeded' : 'SystemMessage',
        title: 'Workplace Update',
        content: `Hey ${leadUser.name}, ${template}`,
        link: '/dashboard/tasks'
      });
    }

    console.log('✅ 100 Indian workplace notifications generated.');

    // 9. CREATE CHAT MESSAGES
    const chatTemplates = [
      'Good morning team, today\'s sprint review is at 3 PM.',
      'Gemini integration is completed and ready for testing.',
      'Please review the dashboard UI before deployment.',
      'Client demo scheduled for tomorrow.',
      'Please update all database schema patterns before the evening standup.',
      'Outstanding metrics graphs verified in Bangalore office. Moving to staging!'
    ];

    for (let i = 0; i < 60; i++) {
      const sender = allUserIds[i % allUserIds.length];
      const content = chatTemplates[i % chatTemplates.length];
      await DB.Message.create({
        channel: 'general',
        sender,
        content,
        timestamp: new Date(Date.now() - (60 - i) * 10 * 60 * 1000)
      });
    }

    // 10. CREATE AUDIT LOGS
    await DB.AuditLog.create({
      action: 'SYSTEM_BOOT',
      user: 'Monali Pawar (Admin)',
      details: 'Started TechNova Solutions Pvt Ltd enterprise network databases.'
    });

    await DB.AuditLog.create({
      action: 'DEMO_MODE_SEEDED',
      user: 'Monali Pawar (Admin)',
      details: 'Populated 250 tasks, 50 employees, 20 projects, 15 meetings, 50 AI alerts, and 25 approval requests successfully.'
    });

    console.log('🌱 TechNova Solutions Pvt Ltd demo dataset seeded successfully!');
  } catch (error) {
    console.error('❌ Failed to seed database:', error);
  }
};

// Start Server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Initialize Socket.io
  initSocket(server);
  
  // Establish database connection
  await connectDB();
  
  // Seed demo metrics
  await seedDatabase();

  server.listen(PORT, () => {
    console.log('\x1b[36m%s\x1b[0m', `🚀 SynergyAI Server running in development mode on port ${PORT}`);
    console.log('\x1b[36m%s\x1b[0m', `🔗 Base API endpoint: http://localhost:${PORT}`);
  });
};

startServer().catch(err => {
  console.error('🔥 Server bootstrap failed:', err);
});
