import { PrismaClient, PromptVisibility } from "../lib/generated/prisma";

const prisma = new PrismaClient();

const categories = [
  { name: "Copywriting" },
  { name: "Marketing" },
  { name: "Software Development" },
  { name: "Education" },
  { name: "Creative Writing" },
];

async function main() {
  console.log("Seeding started...");

  // Clean up existing data
  await prisma.vote.deleteMany();
  await prisma.prompt.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany({
    where: {
      email: {
        in: [
          "alice@example.com",
          "bob@example.com",
          "charlie@example.com",
          "dave@example.com",
          "eve@example.com",
        ],
      },
    },
  });

  console.log("Existing data cleaned up.");

  // Create categories
  const createdCategories = await Promise.all(
    categories.map((category) =>
      prisma.category.create({ data: { name: category.name } })
    )
  );
  console.log(`${createdCategories.length} categories created.`);

  // Create users
  const user1 = await prisma.user.create({
    data: {
      id: "user_1",
      name: "Alice",
      email: "alice@example.com",
      username: "alice",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      id: "user_2",
      name: "Bob",
      email: "bob@example.com",
      username: "bob",
    },
  });

  const user3 = await prisma.user.create({
    data: {
      id: "user_3",
      name: "Charlie",
      email: "charlie@example.com",
      username: "charlie",
    },
  });

  const user4 = await prisma.user.create({
    data: {
      id: "user_4",
      name: "Dave",
      email: "dave@example.com",
      username: "dave",
    },
  });

  const user5 = await prisma.user.create({
    data: {
      id: "user_5",
      name: "Eve",
      email: "eve@example.com",
      username: "eve",
    },
  });

  const users = [user1, user2, user3, user4, user5];
  console.log(`${users.length} users created.`);

  const getCategory = (name: string) => {
    const category = createdCategories.find((c) => c.name === name);
    if (!category) {
      throw new Error(`Category ${name} not found`);
    }
    return category;
  };

  // Create prompts
  const promptsData = [
    {
      title: "Generate a catchy slogan for a new coffee shop",
      content:
        "Generate 5 catchy slogans for a new coffee shop that specializes in artisanal, single-origin coffee. The target audience is young professionals who appreciate quality.",
      category: getCategory("Marketing"),
      author: user1,
    },
    {
      title: "Write a short blog post about the benefits of remote work",
      content:
        "Write a 300-word blog post about the top 3 benefits of remote work for employees. Use a friendly and engaging tone.",
      category: getCategory("Copywriting"),
      author: user1,
    },
    {
      title: "Explain recursion in simple terms",
      content:
        "Explain the concept of recursion in programming as if you were talking to a 10-year-old. Provide a simple example in Python.",
      category: getCategory("Software Development"),
      author: user2,
    },
    {
      title: "Create a 5-day lesson plan for learning basic Spanish",
      content:
        "Create a 5-day lesson plan for an absolute beginner learning Spanish. Each day should focus on a different topic (e.g., greetings, numbers, common phrases).",
      category: getCategory("Education"),
      author: user1,
    },
    {
      title: "Write a short story opening",
      content:
        "Write the opening paragraph of a mystery novel set in a foggy, coastal town. The story should start with the discovery of a strange object on the beach.",
      category: getCategory("Creative Writing"),
      author: user2,
    },
    {
      title: "Brainstorm ideas for a productivity app",
      content:
        "List 5 unique features for a new productivity app that helps users manage their time more effectively. For each feature, provide a brief description of how it works.",
      category: getCategory("Creative Writing"),
      author: user3,
    },
    {
      title: "Generate a SQL query to find top customers",
      content:
        "Write a SQL query to find the top 5 customers who have spent the most money. Assume you have two tables: 'customers' (with 'id' and 'name') and 'orders' (with 'customer_id' and 'amount').",
      category: getCategory("Software Development"),
      author: user4,
    },
    {
      title: "Draft an email to a potential client",
      content:
        "Draft a professional email to a potential client introducing your freelance web development services. Highlight your key skills and include a call to action.",
      category: getCategory("Marketing"),
      author: user5,
    },
    {
      title: "Write a function to reverse a string",
      content:
        "Write a JavaScript function that takes a string as input and returns the string reversed.",
      category: getCategory("Software Development"),
      author: user2,
    },
    {
      title: "Summarize the plot of 'To Kill a Mockingbird'",
      content:
        "Provide a concise summary of the plot of the novel 'To Kill a Mockingbird' by Harper Lee. The summary should be no more than 150 words.",
      category: getCategory("Education"),
      author: user1,
    },
    {
      title: "Create a compelling headline for a landing page",
      content:
        "Create 3 compelling headlines for a landing page that sells a subscription box for dog toys. The headlines should be short, punchy, and highlight the unique value proposition.",
      category: getCategory("Marketing"),
      author: user3,
    },
    {
      title: "Generate a list of interview questions for a React developer",
      content:
        "Generate a list of 10 technical interview questions for a mid-level React developer. The questions should cover topics like state management, hooks, performance optimization, and testing.",
      category: getCategory("Software Development"),
      author: user4,
    },
    {
      title: "Write a haiku about nature",
      content: "Write a haiku (5-7-5 syllables) about the beauty of a forest.",
      category: getCategory("Creative Writing"),
      author: user5,
    },
    {
      title:
        "Explain the difference between supervised and unsupervised learning",
      content:
        "Explain the key differences between supervised and unsupervised machine learning in simple terms. Provide an example of a real-world application for each.",
      category: getCategory("Education"),
      author: user2,
    },
    {
      title: "Generate a Python script to scrape a website",
      content:
        "Write a Python script that uses the BeautifulSoup library to scrape the headlines from the front page of a news website (e.g., BBC News).",
      category: getCategory("Software Development"),
      author: user1,
    },
  ];

  const today = new Date();
  const createdPrompts = await Promise.all(
    promptsData.map((p, i) => {
      const createdAt = new Date(today);
      createdAt.setDate(today.getDate() - (i + 1));

      return prisma.prompt.create({
        data: {
          title: p.title,
          content: p.content,
          categoryId: p.category.id,
          authorId: p.author.id,
          visibility: PromptVisibility.PUBLIC,
          createdAt,
        },
      });
    })
  );

  console.log(`${createdPrompts.length} prompts created.`);

  // Create votes
  const votes = [];
  const votedPrompts = new Set(); // To ensure a prompt is not voted by the same user twice

  while (votes.length < 25) {
    const user = users[Math.floor(Math.random() * users.length)];
    const prompt =
      createdPrompts[Math.floor(Math.random() * createdPrompts.length)];
    const voteKey = `${user.id}-${prompt.id}`;

    if (!votedPrompts.has(voteKey)) {
      votes.push({
        userId: user.id,
        promptId: prompt.id,
      });
      votedPrompts.add(voteKey);
    }
  }

  await prisma.vote.createMany({
    data: votes,
  });

  console.log(`${votes.length} votes created.`);

  // Update vote counts
  const voteCounts = await prisma.vote.groupBy({
    by: ["promptId"],
    _count: {
      promptId: true,
    },
  });

  await Promise.all(
    voteCounts.map((vc) =>
      prisma.prompt.update({
        where: { id: vc.promptId },
        data: { voteCount: vc._count.promptId },
      })
    )
  );

  console.log("Vote counts updated.");
  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
