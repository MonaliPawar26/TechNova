import { Router, Response } from 'express';
import { DB } from '../config/db';
import { authenticateJWT, AuthRequest } from '../middleware/auth';
import { broadcastToChannel, sendDirectMessage } from '../services/socket';

const router = Router();

// 1. GET MESSAGES IN CHANNEL OR DM ROOM
router.get('/:channel', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const channelName = req.params.channel;
    const messages = await DB.Message.find({ channel: channelName });
    
    // Populate user names and avatars for rendering
    const users = await DB.User.find({});
    const userMap = new Map(users.map((u: any) => [u._id.toString() || u.id.toString(), u]));

    const populatedMessages = messages.map((msg: any) => {
      const senderId = msg.sender.toString();
      const senderDetail = userMap.get(senderId);
      return {
        ...msg,
        senderName: senderDetail ? senderDetail.name : 'Unknown User',
        senderAvatar: senderDetail ? senderDetail.avatar : 'https://ui-avatars.com/api/?name=User'
      };
    });

    res.json({ success: true, messages: populatedMessages });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// 2. SEND MESSAGE TO CHANNEL OR DM
router.post('/', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { channel, content, attachments, isDirect, recipient } = req.body;

    if (!channel || !content) {
      res.status(400).json({ message: 'Channel and content are required' });
      return;
    }

    const message = await DB.Message.create({
      channel,
      sender: req.user?.id || '',
      content,
      attachments: attachments || [],
      reactions: [],
      isDirect: isDirect || false,
      recipient: recipient || null,
      timestamp: new Date()
    });

    // Populate sender details for socket relay
    const sender = await DB.User.findById(req.user?.id || '');
    const populatedMsg = {
      ...message,
      senderName: sender ? sender.name : 'Unknown User',
      senderAvatar: sender ? sender.avatar : 'https://ui-avatars.com/api/?name=User'
    };

    // Emit via Socket.io
    if (isDirect && recipient) {
      // Direct message routing
      sendDirectMessage(recipient, populatedMsg);
      // Send to self socket too if they are logged in on multiple tabs
      sendDirectMessage(req.user?.id || '', populatedMsg);
    } else {
      // Channel message routing
      broadcastToChannel(channel, 'message:new', populatedMsg);
    }

    res.status(201).json({ success: true, message: populatedMsg });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// 3. REACT TO MESSAGE (Emoji reaction)
router.post('/:id/react', authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { emoji } = req.body;
    const userId = req.user?.id;
    if (!emoji || !userId) {
      res.status(400).json({ message: 'Emoji and user authentication required' });
      return;
    }

    const message = await DB.Message.findById(req.params.id);
    if (!message) {
      res.status(404).json({ message: 'Message not found' });
      return;
    }

    const reactions = [...(message.reactions || [])];
    const existingReactIdx = reactions.findIndex(r => r.emoji === emoji);

    if (existingReactIdx > -1) {
      const reaction = reactions[existingReactIdx];
      const userIdx = reaction.users.indexOf(userId);

      if (userIdx > -1) {
        // Toggle off if already reacted
        reaction.users.splice(userIdx, 1);
        if (reaction.users.length === 0) {
          reactions.splice(existingReactIdx, 1);
        }
      } else {
        // Add user to reaction
        reaction.users.push(userId);
      }
    } else {
      // Create new reaction emoji group
      reactions.push({ emoji, users: [userId] });
    }

    const updatedMsg = await DB.Message.findByIdAndUpdate(req.params.id, { reactions });

    // Populate sender details for client
    const sender = await DB.User.findById(updatedMsg.sender.toString());
    const populatedMsg = {
      ...updatedMsg,
      senderName: sender ? sender.name : 'Unknown User',
      senderAvatar: sender ? sender.avatar : 'https://ui-avatars.com/api/?name=User'
    };

    // Broadcast reaction update
    if (updatedMsg.isDirect && updatedMsg.recipient) {
      sendDirectMessage(updatedMsg.recipient.toString(), populatedMsg);
      sendDirectMessage(updatedMsg.sender.toString(), populatedMsg);
    } else {
      broadcastToChannel(updatedMsg.channel, 'message:reaction-updated', populatedMsg);
    }

    res.json({ success: true, message: populatedMsg });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
