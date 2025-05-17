import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clean the database first
  await prisma.post.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Seeding database...');

  // Create users
  const user1 = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      name: 'Alice',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      name: 'Bob',
    },
  });

  console.log(`Created users: ${user1.name}, ${user2.name}`);

  // Create posts
  const post1 = await prisma.post.create({
    data: {
      title: 'Hello PostgreSQL',
      content: 'This is my first post with PostgreSQL and Prisma',
      published: true,
      authorId: user1.id,
    },
  });

  const post2 = await prisma.post.create({
    data: {
      title: 'Advanced PostgreSQL Features',
      content: 'Exploring JSON, indexing, and more...',
      published: true,
      authorId: user1.id,
    },
  });

  const post3 = await prisma.post.create({
    data: {
      title: 'Draft Post',
      content: 'This is an unpublished draft',
      published: false,
      authorId: user2.id,
    },
  });

  console.log(`Created ${3} posts`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
