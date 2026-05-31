import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { DB } from '../config/db';
import { authenticateJWT, AuthRequest } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'synergyai_secret_jwt_token_key_2026';

// Helper to generate token
const generateToken = (user: any) => {
  return jwt.sign(
    {
      id: user._id || user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      department: user.department
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// 1. SIGNUP
router.post('/signup', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, department, role } = req.body;

    const existingUser = await DB.User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'A user with this email already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Set default avatar based on name initials
    const initials = name ? name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'US';
    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8b5cf6&color=fff&bold=true`;

    const user = await DB.User.create({
      name,
      email,
      password: hashedPassword,
      avatar,
      department,
      role: role || 'Employee',
      joinedDate: new Date()
    });

    const token = generateToken(user);

    // Create Audit Log
    await DB.AuditLog.create({
      action: 'USER_REGISTER',
      user: `${name} (${email})`,
      details: `Created new user account with role: ${role || 'Employee'}`
    });

    // Create Workspace for the user if none exists
    const existingWorkspaces = await DB.Workspace.find();
    if (existingWorkspaces.length === 0) {
      await DB.Workspace.create({
        name: 'SynergyAI Default Workspace',
        owner: user._id || user.id,
        members: [user._id || user.id],
        channels: ['general', 'announcements', 'rnd-ai', 'product-ops']
      });
    } else {
      // Add to default workspace
      const defaultWS = existingWorkspaces[0];
      const members = [...(defaultWS.members || [])];
      const userIdStr = (user._id || user.id).toString();
      if (!members.map(m => m.toString()).includes(userIdStr)) {
        members.push(userIdStr);
        await DB.Workspace.findByIdAndUpdate(defaultWS._id || defaultWS.id, { members });
      }
    }

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        avatar: user.avatar,
        joinedDate: user.joinedDate
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// 2. LOGIN
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await DB.User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: 'Invalid credentials. User does not exist.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password || '');
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid credentials. Wrong password.' });
      return;
    }

    const token = generateToken(user);

    // Log the audit event
    await DB.AuditLog.create({
      action: 'USER_LOGIN',
      user: `${user.name} (${user.email})`,
      details: `Logged in successfully from IP: ${req.ip}`
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        avatar: user.avatar,
        joinedDate: user.joinedDate
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// 3. GOOGLE SIGN-IN
router.post('/google', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name, avatar, googleId } = req.body;

    let user = await DB.User.findOne({ email });

    if (!user) {
      // Create new user automatically
      user = await DB.User.create({
        name,
        email,
        avatar: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8b5cf6&color=fff`,
        department: 'Operations',
        role: 'Employee',
        joinedDate: new Date()
      });

      await DB.AuditLog.create({
        action: 'USER_REGISTER_OAUTH',
        user: `${name} (${email})`,
        details: `Registered via Google Authentication`
      });
    } else {
      await DB.AuditLog.create({
        action: 'USER_LOGIN_OAUTH',
        user: `${user.name} (${user.email})`,
        details: `Logged in via Google Authentication`
      });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        avatar: user.avatar,
        joinedDate: user.joinedDate
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// 4. FORGOT PASSWORD (Simulated)
router.post('/forgot-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await DB.User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: 'User with this email does not exist' });
      return;
    }

    // Return a mock OTP code for instant client convenience
    const mockOTP = '6492';
    res.json({
      success: true,
      message: 'Password reset OTP code sent to your registered email address',
      otp: mockOTP // Returning in response so the frontend user can bypass mail client during test!
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// 5. OTP VERIFY (Simulated)
router.post('/verify-otp', (req: Request, res: Response) => {
  const { otp } = req.body;
  if (otp === '6492') {
    res.json({
      success: true,
      message: 'OTP validated successfully. You can reset your password.'
    });
  } else {
    res.status(400).json({ message: 'Invalid OTP code. Please enter 6492.' });
  }
});

// 6. GET PROFILE
router.get('/profile', authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const user = await DB.User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json({
      success: true,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        avatar: user.avatar,
        joinedDate: user.joinedDate
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
