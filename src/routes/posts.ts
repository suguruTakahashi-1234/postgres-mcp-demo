import { OpenAPIHono } from '@hono/zod-openapi';
import {
  getPostsRoute,
  getPostRoute,
  createPostRoute,
  updatePostRoute,
  deletePostRoute,
} from '../schemas/post.schema';
import prisma from '../lib/prisma';

// Create the posts router
export const postRoutes = new OpenAPIHono();

// GET /posts - Get all posts with optional filtering
postRoutes.openapi(getPostsRoute, async (c: any) => {
  const { published, authorId } = c.req.valid('query');
  
  try {
    // Build filters with proper typing
    const where: Record<string, any> = {};
    
    if (published !== undefined) {
      where.published = published === 'true';
    }
    
    if (authorId !== undefined) {
      where.authorId = authorId;
    }
    
    const posts = await prisma.post.findMany({
      where,
      include: { author: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    
    return c.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return c.json({ message: 'Failed to fetch posts' }, 500);
  }
});

// GET /posts/:id - Get a post by ID
postRoutes.openapi(getPostRoute, async (c: any) => {
  const { id } = c.req.valid('param');

  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: { author: { select: { id: true, name: true, email: true } } },
    });

    if (!post) {
      return c.json({ message: 'Post not found' }, 404);
    }
    
    return c.json(post);
  } catch (error) {
    console.error(`Error fetching post ${id}:`, error);
    return c.json({ message: 'Failed to fetch post' }, 500);
  }
});

// POST /posts - Create a new post
postRoutes.openapi(createPostRoute, async (c: any) => {
  const data = c.req.valid('json');

  try {
    // Verify that the author exists
    const author = await prisma.user.findUnique({
      where: { id: data.authorId },
    });

    if (!author) {
      return c.json({ message: 'Author not found' }, 400);
    }

    const newPost = await prisma.post.create({
      data,
      include: { author: { select: { id: true, name: true, email: true } } },
    });

    return c.json(newPost, 201);
  } catch (error) {
    console.error('Error creating post:', error);
    return c.json({ message: 'Failed to create post' }, 500);
  }
});

// PATCH /posts/:id - Update a post
postRoutes.openapi(updatePostRoute, async (c: any) => {
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');

  try {
    // Check if post exists
    const postExists = await prisma.post.findUnique({
      where: { id },
    });

    if (!postExists) {
      return c.json({ message: 'Post not found' }, 404);
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data,
      include: { author: { select: { id: true, name: true, email: true } } },
    });

    return c.json(updatedPost);
  } catch (error) {
    console.error(`Error updating post ${id}:`, error);
    return c.json({ message: 'Failed to update post' }, 500);
  }
});

// DELETE /posts/:id - Delete a post
postRoutes.openapi(deletePostRoute, async (c: any) => {
  const { id } = c.req.valid('param');

  try {
    // Check if post exists
    const postExists = await prisma.post.findUnique({
      where: { id },
    });

    if (!postExists) {
      return c.json({ message: 'Post not found' }, 404);
    }

    // Delete the post
    await prisma.post.delete({
      where: { id },
    });

    return c.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error(`Error deleting post ${id}:`, error);
    return c.json({ message: 'Failed to delete post' }, 500);
  }
});
