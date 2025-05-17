// @ts-ignore - Vitest最新バージョンでのインポート
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userRoutes } from './users';
import prisma from '../lib/prisma';
import { Hono } from 'hono';

// Import setup
import '../test/setup';

describe('User Routes', () => {
  let app: Hono;
  
  beforeEach(() => {
    app = new Hono();
    app.route('/users', userRoutes);
  });

  describe('GET /users', () => {
    it('should return all users', async () => {
      // Arrange
      const mockUsers = [
        { id: 1, email: 'test1@example.com', name: 'Test User 1', createdAt: new Date(), updatedAt: new Date(), _count: { posts: 2 } },
        { id: 2, email: 'test2@example.com', name: 'Test User 2', createdAt: new Date(), updatedAt: new Date(), _count: { posts: 1 } },
      ];
      
      vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsers);
      
      // Act
      const res = await app.request('/users');
      const data = await res.json();
      
      // Assert
      expect(res.status).toBe(200);
      expect(data).toEqualWithDates(mockUsers);
      expect(prisma.user.findMany).toHaveBeenCalledOnce();
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        include: { _count: { select: { posts: true } } },
      });
    });
    
    it('should handle errors when fetching users', async () => {
      // Arrange
      vi.mocked(prisma.user.findMany).mockRejectedValue(new Error('Database error'));
      
      // Act
      const res = await app.request('/users');
      const data = await res.json();
      
      // Assert
      expect(res.status).toBe(500);
      expect(data).toEqual({ message: 'ユーザー情報の取得に失敗しました' });
    });
  });

  describe('GET /users/:id', () => {
    it('should return a user by ID', async () => {
      // Arrange
      const mockUser = { 
        id: 1, 
        email: 'test@example.com', 
        name: 'Test User', 
        createdAt: new Date(), 
        updatedAt: new Date(),
        _count: { posts: 2 }
      };
      
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      
      // Act
      const res = await app.request('/users/1');
      const data = await res.json();
      
      // Assert
      expect(res.status).toBe(200);
      expect(data).toEqualWithDates(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledOnce();
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { _count: { select: { posts: true } } },
      });
    });
    
    it('should return 404 if user not found', async () => {
      // Arrange
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      
      // Act
      const res = await app.request('/users/999');
      const data = await res.json();
      
      // Assert
      expect(res.status).toBe(404);
      expect(data).toEqual({ message: 'ユーザーが見つかりません' });
    });
  });

  describe('POST /users', () => {
    it('should create a new user', async () => {
      // Arrange
      const newUser = { email: 'new@example.com', name: 'New User' };
      const createdUser = { 
        id: 3, 
        ...newUser, 
        createdAt: new Date(), 
        updatedAt: new Date() 
      };
      
      vi.mocked(prisma.user.create).mockResolvedValue(createdUser);
      
      // Act
      const res = await app.request('/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      const data = await res.json();
      
      // Assert
      expect(res.status).toBe(201);
      expect(data).toEqualWithDates(createdUser);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: newUser,
      });
    });
    
    it('should handle unique constraint violations', async () => {
      // Arrange
      const newUser = { email: 'existing@example.com', name: 'Existing User' };
      const error = new Error('Unique constraint failed');
      // @ts-expect-error - Adding Prisma-specific error code
      error.code = 'P2002';
      
      vi.mocked(prisma.user.create).mockRejectedValue(error);
      
      // Act
      const res = await app.request('/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      const data = await res.json();
      
      // Assert
      expect(res.status).toBe(400);
      expect(data).toEqual({ message: 'このメールアドレスは既に使用されています' });
    });
  });

  describe('PATCH /users/:id', () => {
    it('should update an existing user', async () => {
      // Arrange
      const userId = 1;
      const updateData = { name: 'Updated Name' };
      const updatedUser = { 
        id: userId, 
        email: 'test@example.com', 
        name: 'Updated Name', 
        createdAt: new Date(), 
        updatedAt: new Date() 
      };
      
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: userId, email: 'test@example.com', name: 'Old Name', createdAt: new Date(), updatedAt: new Date() });
      vi.mocked(prisma.user.update).mockResolvedValue(updatedUser);
      
      // Act
      const res = await app.request(`/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      const data = await res.json();
      
      // Assert
      expect(res.status).toBe(200);
      expect(data).toEqualWithDates(updatedUser);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateData,
      });
    });
    
    it('should return 404 if user to update not found', async () => {
      // Arrange
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      
      // Act
      const res = await app.request('/users/999', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Will Not Update' }),
      });
      const data = await res.json();
      
      // Assert
      expect(res.status).toBe(404);
      expect(data).toEqual({ message: 'ユーザーが見つかりません' });
      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete a user', async () => {
      // Arrange
      const userId = 1;
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: userId, email: 'test@example.com', name: 'Test User', createdAt: new Date(), updatedAt: new Date() });
      vi.mocked(prisma.user.delete).mockResolvedValue({ id: userId, email: 'test@example.com', name: 'Test User', createdAt: new Date(), updatedAt: new Date() });
      
      // Act
      const res = await app.request(`/users/${userId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      
      // Assert
      expect(res.status).toBe(200);
      expect(data).toEqual({ message: 'ユーザーが正常に削除されました' });
      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });
    
    it('should return 404 if user to delete not found', async () => {
      // Arrange
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      
      // Act
      const res = await app.request('/users/999', {
        method: 'DELETE',
      });
      const data = await res.json();
      
      // Assert
      expect(res.status).toBe(404);
      expect(data).toEqual({ message: 'ユーザーが見つかりません' });
      expect(prisma.user.delete).not.toHaveBeenCalled();
    });
  });
});
