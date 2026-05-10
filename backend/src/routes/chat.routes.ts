import { Router } from 'express';
import { ChatController } from '@controllers/chat.controller';
import { authMiddleware, roleMiddleware } from '@middleware/auth.middleware';

const router = Router();

const staffRoles = ['sale', 'accountant', 'manager', 'admin'];

// Customer: create or resume their open conversation
router.post('/conversations', authMiddleware, roleMiddleware(['customer']), ChatController.createOrGetConversation);

// Both: get messages & send messages (customer owns the conv; staff can access any)
router.get('/conversations/:id/messages', authMiddleware, ChatController.getMessages);
router.post('/conversations/:id/messages', authMiddleware, ChatController.sendMessage);
router.patch('/conversations/:id/read', authMiddleware, ChatController.markConversationRead);

// Staff only: list all conversations, close a conversation
router.get('/conversations', authMiddleware, roleMiddleware(staffRoles), ChatController.getConversations);
router.patch('/conversations/:id/close', authMiddleware, roleMiddleware(staffRoles), ChatController.closeConversation);

export default router;
