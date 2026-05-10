import { Response, NextFunction } from 'express';
import { ApiResponseBuilder } from '@models/api.model';
import { ChatService } from '@services/chat.service';
import type { AuthRequest } from '@middleware/auth.middleware';

export class ChatController {
  static async createOrGetConversation(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const conversation = await ChatService.createOrGetConversation(req.user!.id);
      res.status(200).json(ApiResponseBuilder.success(conversation));
    } catch (error) { next(error); }
  }

  static async getConversations(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const conversations = await ChatService.getConversations();
      res.status(200).json(ApiResponseBuilder.success(conversations));
    } catch (error) { next(error); }
  }

  static async getMessages(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const messages = await ChatService.getMessages(req.params['id'] as string, req.user!.id, req.user!.role);
      res.status(200).json(ApiResponseBuilder.success(messages));
    } catch (error) { next(error); }
  }

  static async sendMessage(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const message = await ChatService.sendMessage(
        req.params['id'] as string,
        req.user!.id,
        req.user!.role,
        req.body.content
      );
      res.status(201).json(ApiResponseBuilder.success(message));
    } catch (error) { next(error); }
  }

  static async markConversationRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const updatedMessages = await ChatService.markConversationAsRead(
        req.params['id'] as string,
        req.user!.id,
        req.user!.role
      );
      res.status(200).json(ApiResponseBuilder.success(updatedMessages));
    } catch (error) { next(error); }
  }

  static async closeConversation(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await ChatService.closeConversation(req.params['id'] as string);
      res.status(200).json(ApiResponseBuilder.success(null, 'Conversation closed'));
    } catch (error) { next(error); }
  }
}
