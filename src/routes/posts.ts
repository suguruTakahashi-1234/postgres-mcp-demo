import { OpenAPIHono, Context } from '@hono/zod-openapi';
import {
  getPostsRoute,
  getPostRoute,
  createPostRoute,
  updatePostRoute,
  deletePostRoute,
} from '../schemas/post.schema';
import prisma from '../lib/prisma';
import { handleError } from '../utils/error-handler';

// Create the posts router
export const postRoutes = new OpenAPIHono();

// GET /posts - Get all posts with optional filtering
postRoutes.openapi(getPostsRoute, async (c: Context) => {
  const { published, authorId } = c.req.valid('query');
  
  try {
    // Build filters with proper typing
    const where: Record<string, unknown> = {};
    
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
  } catch (error: unknown) {
    return handleError(c, error, '投稿の取得に失敗しました');
  }
});

// GET /posts/:id - Get a post by ID
postRoutes.openapi(getPostRoute, async (c: Context) => {
  const { id } = c.req.valid('param');

  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: { author: { select: { id: true, name: true, email: true } } },
    });

    if (!post) {
      return c.json({ message: '投稿が見つかりません' }, 404);
    }
    
    return c.json(post);
  } catch (error: unknown) {
    return handleError(c, error, `投稿 ${id} の取得に失敗しました`);
  }
});

// POST /posts - Create a new post
postRoutes.openapi(createPostRoute, async (c: Context) => {
  const data = c.req.valid('json');

  try {
    // Verify that the author exists
    const author = await prisma.user.findUnique({
      where: { id: data.authorId },
    });

    if (!author) {
      return c.json({ message: '指定された著者が見つかりません' }, 400);
    }

    const newPost = await prisma.post.create({
      data,
      include: { author: { select: { id: true, name: true, email: true } } },
    });

    return c.json(newPost, 201);
  } catch (error: unknown) {
    return handleError(c, error, '投稿の作成に失敗しました');
  }
});

// PATCH /posts/:id - Update a post
postRoutes.openapi(updatePostRoute, async (c: Context) => {
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');

  try {
    // Check if post exists
    const postExists = await prisma.post.findUnique({
      where: { id },
    });

    if (!postExists) {
      return c.json({ message: '投稿が見つかりません' }, 404);
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data,
      include: { author: { select: { id: true, name: true, email: true } } },
    });

    return c.json(updatedPost);
  } catch (error: unknown) {
    return handleError(c, error, `投稿 ${id} の更新に失敗しました`);
  }
});

// DELETE /posts/:id - Delete a post
postRoutes.openapi(deletePostRoute, async (c: Context) => {
  const { id } = c.req.valid('param');

  try {
    // Check if post exists
    const postExists = await prisma.post.findUnique({
      where: { id },
    });

    if (!postExists) {
      return c.json({ message: '投稿が見つかりません' }, 404);
    }

    // Delete the post
    await prisma.post.delete({
      where: { id },
    });

    return c.json({ message: '投稿が正常に削除されました' });
  } catch (error: unknown) {
    return handleError(c, error, `投稿 ${id} の削除に失敗しました`);
  }
});
