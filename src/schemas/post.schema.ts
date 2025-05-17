import { z } from 'zod';
import { createRoute } from '@hono/zod-openapi';

// Base post schema
const postSchema = z.object({
  id: z.number().int().positive(),
  title: z.string(),
  content: z.string().nullable(),
  published: z.boolean(),
  authorId: z.number().int().positive(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Schema for creating a post
export const createPostSchema = z.object({
  title: z.string(),
  content: z.string().optional(),
  published: z.boolean().optional().default(false),
  authorId: z.number().int().positive(),
});

// Schema for updating a post
export const updatePostSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  published: z.boolean().optional(),
});

// OpenAPI route definitions
export const getPostsRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Posts'],
  summary: 'Get all posts',
  description: 'Retrieve a list of all posts',
  request: {
    query: z.object({
      published: z.enum(['true', 'false']).optional(),
      authorId: z.string().optional().transform(val => val ? parseInt(val, 10) : undefined),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.array(postSchema),
        },
      },
      description: 'List of posts retrieved successfully',
    },
  },
});

export const getPostRoute = createRoute({
  method: 'get',
  path: '/{id}',
  tags: ['Posts'],
  summary: 'Get a post by ID',
  description: 'Retrieve a single post by its ID',
  request: {
    params: z.object({
      id: z.string().transform((val) => parseInt(val, 10)),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: postSchema,
        },
      },
      description: 'Post retrieved successfully',
    },
    404: {
      content: {
        'application/json': {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
      description: 'Post not found',
    },
  },
});

export const createPostRoute = createRoute({
  method: 'post',
  path: '/',
  tags: ['Posts'],
  summary: 'Create a new post',
  description: 'Create a new post with the provided data',
  request: {
    body: {
      content: {
        'application/json': {
          schema: createPostSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        'application/json': {
          schema: postSchema,
        },
      },
      description: 'Post created successfully',
    },
    400: {
      content: {
        'application/json': {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
      description: 'Invalid request data',
    },
  },
});

export const updatePostRoute = createRoute({
  method: 'patch',
  path: '/{id}',
  tags: ['Posts'],
  summary: 'Update a post',
  description: 'Update a post with the provided data',
  request: {
    params: z.object({
      id: z.string().transform((val) => parseInt(val, 10)),
    }),
    body: {
      content: {
        'application/json': {
          schema: updatePostSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: postSchema,
        },
      },
      description: 'Post updated successfully',
    },
    404: {
      content: {
        'application/json': {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
      description: 'Post not found',
    },
    400: {
      content: {
        'application/json': {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
      description: 'Invalid request data',
    },
  },
});

export const deletePostRoute = createRoute({
  method: 'delete',
  path: '/{id}',
  tags: ['Posts'],
  summary: 'Delete a post',
  description: 'Delete a post by its ID',
  request: {
    params: z.object({
      id: z.string().transform((val) => parseInt(val, 10)),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
      description: 'Post deleted successfully',
    },
    404: {
      content: {
        'application/json': {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
      description: 'Post not found',
    },
  },
});
