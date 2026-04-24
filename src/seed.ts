import { getPayload } from "payload";
import config from "@payload-config";
import type { Category, Tenant, User } from "./payload-types";
import { stripe } from "./lib/stripe";

const categories = [
  {
    name: "All",
    slug: "all",
  },
  {
    name: "Business & Money",
    color: "#FFB347",
    slug: "business-money",
    subcategories: [
      { name: "Accounting", slug: "accounting" },
      {
        name: "Entrepreneurship",
        slug: "entrepreneurship",
      },
      { name: "Gigs & Side Projects", slug: "gigs-side-projects" },
      { name: "Investing", slug: "investing" },
      { name: "Management & Leadership", slug: "management-leadership" },
      {
        name: "Marketing & Sales",
        slug: "marketing-sales",
      },
      { name: "Networking, Careers & Jobs", slug: "networking-careers-jobs" },
      { name: "Personal Finance", slug: "personal-finance" },
      { name: "Real Estate", slug: "real-estate" },
    ],
  },
  {
    name: "Software Development",
    color: "#7EC8E3",
    slug: "software-development",
    subcategories: [
      { name: "Web Development", slug: "web-development" },
      { name: "Mobile Development", slug: "mobile-development" },
      { name: "Game Development", slug: "game-development" },
      { name: "Programming Languages", slug: "programming-languages" },
      { name: "DevOps", slug: "devops" },
    ],
  },
  {
    name: "Writing & Publishing",
    color: "#D8B5FF",
    slug: "writing-publishing",
    subcategories: [
      { name: "Fiction", slug: "fiction" },
      { name: "Non-Fiction", slug: "non-fiction" },
      { name: "Blogging", slug: "blogging" },
      { name: "Copywriting", slug: "copywriting" },
      { name: "Self-Publishing", slug: "self-publishing" },
    ],
  },
  {
    name: "Other",
    slug: "other",
  },
  {
    name: "Education",
    color: "#FFE066",
    slug: "education",
    subcategories: [
      { name: "Online Courses", slug: "online-courses" },
      { name: "Tutoring", slug: "tutoring" },
      { name: "Test Preparation", slug: "test-preparation" },
      { name: "Language Learning", slug: "language-learning" },
    ],
  },
  {
    name: "Self Improvement",
    color: "#96E6B3",
    slug: "self-improvement",
    subcategories: [
      { name: "Productivity", slug: "productivity" },
      { name: "Personal Development", slug: "personal-development" },
      { name: "Mindfulness", slug: "mindfulness" },
      { name: "Career Growth", slug: "career-growth" },
    ],
  },
  {
    name: "Fitness & Health",
    color: "#FF9AA2",
    slug: "fitness-health",
    subcategories: [
      { name: "Workout Plans", slug: "workout-plans" },
      { name: "Nutrition", slug: "nutrition" },
      { name: "Mental Health", slug: "mental-health" },
      { name: "Yoga", slug: "yoga" },
    ],
  },
  {
    name: "Design",
    color: "#B5B9FF",
    slug: "design",
    subcategories: [
      { name: "UI/UX", slug: "ui-ux" },
      { name: "Graphic Design", slug: "graphic-design" },
      { name: "3D Modeling", slug: "3d-modeling" },
      { name: "Typography", slug: "typography" },
    ],
  },
  {
    name: "Drawing & Painting",
    color: "#FFCAB0",
    slug: "drawing-painting",
    subcategories: [
      { name: "Watercolor", slug: "watercolor" },
      { name: "Acrylic", slug: "acrylic" },
      { name: "Oil", slug: "oil" },
      { name: "Pastel", slug: "pastel" },
      { name: "Charcoal", slug: "charcoal" },
    ],
  },
  {
    name: "Music",
    color: "#FFD700",
    slug: "music",
    subcategories: [
      { name: "Songwriting", slug: "songwriting" },
      { name: "Music Production", slug: "music-production" },
      { name: "Music Theory", slug: "music-theory" },
      { name: "Music History", slug: "music-history" },
    ],
  },
  {
    name: "Photography",
    color: "#FF6B6B",
    slug: "photography",
    subcategories: [
      { name: "Portrait", slug: "portrait" },
      { name: "Landscape", slug: "landscape" },
      { name: "Street Photography", slug: "street-photography" },
      { name: "Nature", slug: "nature" },
      { name: "Macro", slug: "macro" },
    ],
  },
]

const RETRY_DELAY_MS = 250;
const RETRY_LIMIT = 5;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableLockTimeout = (error: unknown) => {
  if (!error || typeof error !== "object") {
    return false;
  }

  const maybeError = error as {
    code?: number;
    errorLabelSet?: Set<string>;
    message?: string;
  };

  return (
    maybeError.code === 24 ||
    maybeError.errorLabelSet?.has("TransientTransactionError") === true ||
    maybeError.message?.includes("LockTimeout") === true
  );
};

const withRetry = async <T>(label: string, operation: () => Promise<T>): Promise<T> => {
  for (let attempt = 1; attempt <= RETRY_LIMIT; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (!isRetryableLockTimeout(error) || attempt === RETRY_LIMIT) {
        throw error;
      }

      console.warn(
        `Retrying ${label} after transient MongoDB lock timeout (${attempt}/${RETRY_LIMIT})...`,
      );

      await sleep(RETRY_DELAY_MS * attempt);
    }
  }

  throw new Error(`Unable to complete ${label}`);
};

const ensureIndexes = async (payload: Awaited<ReturnType<typeof getPayload>>) => {
  const collectionsToPrepare = ["tenants", "users", "categories"] as const;

  await Promise.all(
    collectionsToPrepare.map(async (collection) => {
      const model = (payload.db.collections as Record<string, { ensureIndexes?: () => Promise<void> }>)[
        collection
      ];

      if (typeof model?.ensureIndexes === "function") {
        await model.ensureIndexes();
      }
    }),
  );
};

const findBySlug = async (
  payload: Awaited<ReturnType<typeof getPayload>>,
  collection: "tenants" | "categories",
  slug: string,
) => {
  const result = await payload.find({
    collection,
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
    pagination: false,
    overrideAccess: true,
  });

  return result.docs[0] ?? null;
};

const upsertTenant = async (
  payload: Awaited<ReturnType<typeof getPayload>>,
  tenantData: Pick<Tenant, "name" | "slug" | "stripeAccountId">,
  label: string,
): Promise<Tenant> => {
  const existingTenant = await findBySlug(payload, "tenants", tenantData.slug);

  if (existingTenant) {
    return withRetry(`${label} tenant update`, () =>
      payload.update({
        collection: "tenants",
        id: existingTenant.id,
        data: tenantData,
        disableTransaction: true,
      }) as Promise<Tenant>,
    );
  }

  return withRetry(`${label} tenant creation`, () =>
    payload.create({
      collection: "tenants",
      data: tenantData,
      disableTransaction: true,
    }) as Promise<Tenant>,
  );
};

const upsertAdminUser = async (
  payload: Awaited<ReturnType<typeof getPayload>>,
  adminTenantId: string,
) => {
  return upsertUser(payload, {
    email: "admin@demo.com",
    password: "demo",
    roles: ["super-admin"],
    username: "admin",
    tenants: [
      {
        tenant: adminTenantId,
      },
    ],
  }, "admin");
};

const createStripeAccount = async (label: string) => {
  const account = await stripe.accounts.create({});

  if (!account?.id) {
    throw new Error(`Failed to create Stripe account for ${label}`);
  }

  return account.id;
};

const upsertUser = async (
  payload: Awaited<ReturnType<typeof getPayload>>,
  userData: Pick<User, "email" | "password" | "roles" | "username" | "tenants">,
  label: string,
) => {
  const existingUser = await payload.find({
    collection: "users",
    where: {
      email: {
        equals: userData.email,
      },
    },
    limit: 1,
    pagination: false,
    overrideAccess: true,
    showHiddenFields: true,
  });

  const existingSeedUser = existingUser.docs[0];

  if (existingSeedUser) {
    return withRetry(`${label} user update`, () =>
      payload.update({
        collection: "users",
        id: existingSeedUser.id,
        data: userData,
        overrideAccess: true,
        showHiddenFields: true,
        disableTransaction: true,
      }),
    );
  }

  return withRetry(`${label} user creation`, () =>
    payload.create({
      collection: "users",
      data: userData,
      overrideAccess: true,
      showHiddenFields: true,
      disableTransaction: true,
    }),
  );
};

const upsertCategory = async (
  payload: Awaited<ReturnType<typeof getPayload>>,
  category: {
    name: string;
    slug: string;
    color?: string;
  },
  parent: string | null,
): Promise<Category> => {
  const existingCategory = await findBySlug(payload, "categories", category.slug);
  const data = {
    name: category.name,
    slug: category.slug,
    color: category.color,
    parent,
  };

  if (existingCategory) {
    return withRetry(`category update for ${category.slug}`, () =>
      payload.update({
        collection: "categories",
        id: existingCategory.id,
        data,
        disableTransaction: true,
      }) as Promise<Category>,
    );
  }

  return withRetry(`category creation for ${category.slug}`, () =>
    payload.create({
      collection: "categories",
      data,
      disableTransaction: true,
    }) as Promise<Category>,
  );
};

const seed = async () => {
  const payload = await getPayload({ config });
  await ensureIndexes(payload);

  const adminStripeAccountId = await createStripeAccount("admin");
  const adminTenant = await upsertTenant(
    payload,
    {
      name: "admin",
      slug: "admin",
      stripeAccountId: adminStripeAccountId,
    },
    "admin",
  );

  const demoStripeAccountId = await createStripeAccount("demo");
  const demoTenant = await upsertTenant(
    payload,
    {
      name: "demo",
      slug: "demo",
      stripeAccountId: demoStripeAccountId,
    },
    "demo",
  );

  await upsertAdminUser(payload, adminTenant.id);
  await upsertUser(
    payload,
    {
      email: "demo@gmail.com",
      password: "demo",
      roles: ["user"],
      username: "demo",
      tenants: [
        {
          tenant: demoTenant.id,
        },
      ],
    },
    "demo",
  );

  for (const category of categories) {
    const parentCategory = await upsertCategory(payload, category, null);

    for (const subCategory of category.subcategories || []) {
      await upsertCategory(payload, subCategory, parentCategory.id);
    }
  }
}

try {
  await seed();
  console.log('Seeding completed successfully');
  process.exit(0);
} catch (error) {
  console.error('Error during seeding:', error);
  process.exit(1); // Exit with error code
}
