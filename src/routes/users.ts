import { OpenAPIHono, Context } from '@hono/zod-openapi';
import {
  getUsersRoute,
  getUserRoute,
  createUserRoute,
  updateUserRoute,
  deleteUserRoute,
} from '../schemas/user.schema';
import prisma from '../lib/prisma';
import { handleError } from '../utils/error-handler';

// Create the users router
export const userRoutes = new OpenAPIHono();

// GET /users - Get all users
userRoutes.openapi(getUsersRoute, async (c: Context) => {
  try {
    const users = await prisma.user.findMany({
      include: { _count: { select: { posts: true } } },
    });
    
    return c.json(users);
  } catch (error: unknown) {
    return handleError(c, error, 'ユーザー情報の取得に失敗しました');
  }
});

// GET /users/:id - Get a user by ID
userRoutes.openapi(getUserRoute, async (c: Context) => {
  const { id } = c.req.valid('param');

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { _count: { select: { posts: true } } },
    });

    if (!user) {
      return c.json({ message: 'ユーザーが見つかりません' }, 404);
    }
    
    return c.json(user);
  } catch (error: unknown) {
    return handleError(c, error, `ユーザー ${id} の取得に失敗しました`);
  }
});

// POST /users - Create a new user
userRoutes.openapi(createUserRoute, async (c: Context) => {
  const data = c.req.valid('json');

  try {
    const newUser = await prisma.user.create({
      data,
    });

    return c.json(newUser, 201);
  } catch (error: unknown) {
    if (isPrismaError(error) && error.code === 'P2002') {
      return c.json({ message: 'このメールアドレスは既に使用されています' }, 400);
    }
    return handleError(c, error, 'ユーザーの作成に失敗しました');
  }
});

const isPrismaError = (error: unknown): error is { code: string } => {
  return typeof error === 'object' && error !== null && 'code' in error;
};

// PATCH /users/:id - Update a user
userRoutes.openapi(updateUserRoute, async (c: Context) => {
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');

  try {
    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { id },
    });

    if (!userExists) {
      return c.json({ message: 'ユーザーが見つかりません' }, 404);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data,
    });

    return c.json(updatedUser);
  } catch (error: unknown) {
    if (isPrismaError(error) && error.code === 'P2002') {
      return c.json({ message: 'このメールアドレスは既に使用されています' }, 400);
    }
    return handleError(c, error, `ユーザー ${id} の更新に失敗しました`);
  }
});

// DELETE /users/:id - Delete a user
userRoutes.openapi(deleteUserRoute, async (c: Context) => {
  const { id } = c.req.valid('param');

  try {
    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { id },
    });

    if (!userExists) {
      return c.json({ message: 'ユーザーが見つかりません' }, 404);
    }

    // Delete the user
    await prisma.user.delete({
      where: { id },
    });

    return c.json({ message: 'ユーザーが正常に削除されました' });
  } catch (error: unknown) {
    return handleError(c, error, `ユーザー ${id} の削除に失敗しました`);
  }
});
