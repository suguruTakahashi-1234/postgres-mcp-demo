import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { swaggerUI } from '@hono/swagger-ui';
import { OpenAPIHono, Context } from '@hono/zod-openapi';
import { userRoutes } from './routes/users';
import { postRoutes } from './routes/posts';

// Create the main app
const app = new Hono();

// Global middleware
app.use('*', logger());
app.use('*', cors());

// API routes with OpenAPI documentation
const api = new OpenAPIHono();
api.route('/users', userRoutes);
api.route('/posts', postRoutes);

// Serve Swagger UI
app.get('/docs/*', swaggerUI({ url: '/docs/openapi.json' }));

// Generate OpenAPI documentation
app.get('/docs/openapi.json', (c: Context) => {
  return c.json(api.getOpenAPIDocument({
    openapi: '3.0.0',
    info: {
      title: 'PostgreSQL RESTful API',
      version: '0.1.0',
      description: 'A RESTful API demonstrating PostgreSQL capabilities',
    },
    servers: [{ url: '/' }],
  }));
});

// Mount the API routes
app.route('/api', api);

// Health check endpoint
app.get('/', (c: Context) => c.json({ status: 'ok', message: 'PostgreSQL RESTful API is running' }));

// Start the server
const port = parseInt(process.env.PORT || '3000');
console.log(`Server running on http://localhost:${port}`);

export default serve({
  fetch: app.fetch,
  port,
});
