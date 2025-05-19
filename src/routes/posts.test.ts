// @ts-expect-error - Vitest最新バージョンでのインポート
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { postRoutes } from './posts';
import prisma from '../lib/prisma';
import { Hono } from 'hono';

// Import setup
import '../test/setup';

describe('Post Routes', () => {
  let app: Hono;
  
  beforeEach(() => {
    app = new Hono();
    app.route('/posts', postRoutes);
  });

  describe('GET /posts', () => {
    it('should return all posts without filters', async () => {
      // Arrange
      const mockPosts = [
        { 
          id: 1, 
          title: 'Test Post 1', 
          content: 'Content 1', 
          published: true, 
          authorId: 1, 
          createdAt: new Date(), 
          updatedAt: new Date(),
          author: { id: 1, name: 'Test User', email: 'test@example.com' }
        },
        { 
          id: 2, 
          title: 'Test Post 2', 
          content: 'Content 2', 
          published: false, 
          authorId: 1, 
          createdAt: new Date(), 
          updatedAt: new Date(),
          author: { id: 1, name: 'Test User', email: 'test@example.com' }
        },
      ];
      
      vi.mocked(prisma.post.findMany).mockResolvedValue(mockPosts);
      
      // Act
      const res = await app.request('/posts');
      const data = await res.json();
      
      // Assert
      expect(res.status).toBe(200);
      expect(data).toEqualWithDates(mockPosts);
      expect(prisma.post.findMany).toHaveBeenCalledOnce();
      expect(prisma.post.findMany).toHaveBeenCalledWith({
        where: {},
        include: { author: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      });
    });
    
    it('should filter posts by published status', async () => {
      // Arrange
      const mockPosts = [
        { 
          id: 1, 
          title: 'Test Post 1', 
          content: 'Content 1', 
          published: true, 
          authorId: 1, 
          createdAt: new Date(), 
          updatedAt: new Date(),
          author: { id: 1, name: 'Test User', email: 'test@example.com' }
        },
      ];
      
      vi.mocked(prisma.post.findMany).mockResolvedValue(mockPosts);
      
      // Act
      const res = await app.request('/posts?published=true');
      const data = await res.json();
      
      // Assert
      expect(res.status).toBe(200);
      expect(data).toEqualWithDates(mockPosts);
      expect(prisma.post.findMany).toHaveBeenCalledWith({
        where: { published: true },
        include: { author: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      });
    });
    
    it('should filter posts by authorId', async () => {
      // Arrange
      const mockPosts = [
        { 
          id: 2, 
          title: 'Test Post 2', 
          content: 'Content 2', 
          published: true, 
          authorId: 2, 
          createdAt: new Date(), 
          updatedAt: new Date(),
          author: { id: 2, name: 'Author 2', email: 'author2@example.com' }
        },
      ];
      
      vi.mocked(prisma.post.findMany).mockResolvedValue(mockPosts);
      
      // Act
      const res = await app.request('/posts?authorId=2');
      const data = await res.json();
      
      // Assert
      expect(res.status).toBe(200);
      expect(data).toEqualWithDates(mockPosts);
      expect(prisma.post.findMany).toHaveBeenCalledWith({
        where: { authorId: 2 },
        include: { author: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      });
    });
    
    it('should handle errors when fetching posts', async () => {
      // Arrange
      vi.mocked(prisma.post.findMany).mockRejectedValue(new Error('Database error'));
      
      // Act
      const res = await app.request('/posts');
      const data = await res.json();
      
      // Assert
      expect(res.status).toBe(500);
      expect(data).toEqual({ message: '投稿の取得に失敗しました' });
    });
  });

  describe('GET /posts/:id', () => {
    it('should return a post by ID', async () => {
      // Arrange
      const mockPost = { 
        id: 1, 
        title: 'Test Post', 
        content: 'Test Content', 
        published: true, 
        authorId: 1, 
        createdAt: new Date(), 
        updatedAt: new Date(),
        author: { id: 1, name: 'Test User', email: 'test@example.com' }
      };
      
      vi.mocked(prisma.post.findUnique).mockResolvedValue(mockPost);
      
      // Act
      const res = await app.request('/posts/1');
      const data = await res.json();
      
      // Assert
      expect(res.status).toBe(200);
      expect(data).toEqualWithDates(mockPost);
      expect(prisma.post.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { author: { select: { id: true, name: true, email: true } } },
      });
    });
    
    it('should return 404 if post not found', async () => {
      // Arrange
      vi.mocked(prisma.post.findUnique).mockResolvedValue(null);
      
      // Act
      const res = await app.request('/posts/999');
      const data = await res.json();
      
      // Assert
      expect(res.status).toBe(404);
      expect(data).toEqual({ message: '投稿が見つかりません' });
    });
  });

  describe('POST /posts', () => {
    it('should create a new post', async () => {
      // Arrange
      const newPost = { 
        title: 'New Post', 
        content: 'New Content', 
        published: true, 
        authorId: 1 
      };
      
      const createdPost = { 
        id: 3, 
        ...newPost, 
        createdAt: new Date(), 
        updatedAt: new Date(),
        author: { id: 1, name: 'Test User', email: 'test@example.com' }
      };
      
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 1, name: 'Test User', email: 'test@example.com', createdAt: new Date(), updatedAt: new Date() });
      vi.mocked(prisma.post.create).mockResolvedValue(createdPost);
      
      // Act
      const res = await app.request('/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost),
      });
      const data = await res.json();
      
      // Assert
      expect(res.status).toBe(201);
      expect(data).toEqualWithDates(createdPost);
      expect(prisma.post.create).toHaveBeenCalledWith({
        data: newPost,
        include: { author: { select: { id: true, name: true, email: true } } },
      });
    });
    
    it('should return 400 if author not found', async () => {
      // Arrange
      const newPost = { 
        title: 'New Post', 
        content: 'New Content', 
        published: true, 
        authorId: 999 
      };
      
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      
      // Act
      const res = await app.request('/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost),
      });
      const data = await res.json();
      
      // Assert
      expect(res.status).toBe(400);
      expect(data).toEqual({ message: '指定された著者が見つかりません' });
      expect(prisma.post.create).not.toHaveBeenCalled();
    });
  });

  describe('PATCH /posts/:id', () => {
    it('should update an existing post', async () => {
      // Arrange
      const postId = 1;
      const updateData = { title: 'Updated Title', published: true };
      const updatedPost = { 
        id: postId, 
        title: 'Updated Title', 
        content: 'Original Content', 
        published: true, 
        authorId: 1, 
        createdAt: new Date(), 
        updatedAt: new Date(),
        author: { id: 1, name: 'Test User', email: 'test@example.com' }
      };
      
      vi.mocked(prisma.post.findUnique).mockResolvedValue({ 
        id: postId, 
        title: 'Original Title', 
        content: 'Original Content', 
        published: false, 
        authorId: 1, 
        createdAt: new Date(), 
        updatedAt: new Date() 
      });
      vi.mocked(prisma.post.update).mockResolvedValue(updatedPost);
      
      // Act
      const res = await app.request(`/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      const data = await res.json();
      
      // Assert
      expect(res.status).toBe(200);
      expect(data).toEqualWithDates(updatedPost);
      expect(prisma.post.update).toHaveBeenCalledWith({
        where: { id: postId },
        data: updateData,
        include: { author: { select: { id: true, name: true, email: true } } },
      });
    });
    
    it('should return 404 if post to update not found', async () => {
      // Arrange
      vi.mocked(prisma.post.findUnique).mockResolvedValue(null);
      
      // Act
      const res = await app.request('/posts/999', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Will Not Update' }),
      });
      const data = await res.json();
      
      // Assert
      expect(res.status).toBe(404);
      expect(data).toEqual({ message: '投稿が見つかりません' });
      expect(prisma.post.update).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /posts/:id', () => {
    it('should delete a post', async () => {
      // Arrange
      const postId = 1;
      vi.mocked(prisma.post.findUnique).mockResolvedValue({ 
        id: postId, 
        title: 'Test Post', 
        content: 'Test Content', 
        published: true, 
        authorId: 1, 
        createdAt: new Date(), 
        updatedAt: new Date() 
      });
      vi.mocked(prisma.post.delete).mockResolvedValue({ 
        id: postId, 
        title: 'Test Post', 
        content: 'Test Content', 
        published: true, 
        authorId: 1, 
        createdAt: new Date(), 
        updatedAt: new Date() 
      });
      
      // Act
      const res = await app.request(`/posts/${postId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      
      // Assert
      expect(res.status).toBe(200);
      expect(data).toEqual({ message: '投稿が正常に削除されました' });
      expect(prisma.post.delete).toHaveBeenCalledWith({
        where: { id: postId },
      });
    });
    
    it('should return 404 if post to delete not found', async () => {
      // Arrange
      vi.mocked(prisma.post.findUnique).mockResolvedValue(null);
      
      // Act
      const res = await app.request('/posts/999', {
        method: 'DELETE',
      });
      const data = await res.json();
      
      // Assert
      expect(res.status).toBe(404);
      expect(data).toEqual({ message: '投稿が見つかりません' });
      expect(prisma.post.delete).not.toHaveBeenCalled();
    });
  });
});
