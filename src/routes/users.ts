import { OpenAPIHono } from '@hono/zod-openapi';
import {
  getUsersRoute,
  getUserRoute,
  createUserRoute,
  updateUserRoute,
  deleteUserRoute,
} from '../schemas/user.schema';
import prisma from '../lib/prisma';

// Create the users router
export const userRoutes = new OpenAPIHono();

// GET /users - Get all users
userRoutes.openapi(getUsersRoute, async (c) => {
  try {
    const users = await prisma.user.findMany({
      include: { _count: { select: { posts: true } } },
    });
    
    return c.json(users);
  } catch (error: unknown) {
    console.error('Error fetching users:', error);
    return c.json({ message: 'Failed to fetch users' }, 500);
  }
});

// GET /users/:id - Get a user by ID
userRoutes.openapi(getUserRoute, async (c) => {
  const { id } = c.req.valid('param');

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { _count: { select: { posts: true } } },
    });

    if (!user) {
      return c.json({ message: 'User not found' }, 404);
    }
    
    return c.json(user);
  } catch (error: unknown) {
    console.error(`Error fetching user ${id}:`, error);
    return c.json({ message: 'Failed to fetch user' }, 500);
  }
});

// POST /users - Create a new user
userRoutes.openapi(createUserRoute, async (c) => {
  const data = c.req.valid('json');

  try {
    const newUser = await prisma.user.create({
      data,
    });

    return c.json(newUser, 201);
  } catch (error: unknown) {
    console.error('Error creating user:', error);
    // Check if this is a unique constraint violation
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      return c.json({ message: 'A user with this email already exists' }, 400);
    }
    return c.json({ message: 'Failed to create user' }, 500);
  }
});

// PATCH /users/:id - Update a user
userRoutes.openapi(updateUserRoute, async (c) => {
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');

  try {
    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { id },
    });

    if (!userExists) {
      return c.json({ message: 'User not found' }, 404);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data,
    });

    return c.json(updatedUser);
  } catch (error: unknown) {
    console.error(`Error updating user ${id}:`, error);
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      return c.json({ message: 'Email address already in use' }, 400);
    }
    return c.json({ message: 'Failed to update user' }, 500);
  }
});

// DELETE /users/:id - Delete a user
userRoutes.openapi(deleteUserRoute, async (c) => {
  const { id } = c.req.valid('param');

  try {
    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { id },
    });

    if (!userExists) {
      return c.json({ message: 'User not found' }, 404);
    }

    // Delete the user
    await prisma.user.delete({
      where: { id },
    });

    return c.json({ message: 'User deleted successfully' });
  } catch (error: unknown) {
    console.error(`Error deleting user ${id}:`, error);
    return c.json({ message: 'Failed to delete user' }, 500);
  }
});
