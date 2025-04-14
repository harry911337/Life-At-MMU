var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import session3 from "express-session";

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
var scryptAsync = promisify(scrypt);
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}
function setupAuth(app2) {
  const sessionSettings = {
    secret: process.env.SESSION_SECRET || "mmu-campus-life-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1e3
      // 30 days
    }
  };
  app2.set("trust proxy", 1);
  app2.use(session(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !await comparePasswords(password, user.password)) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    })
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  app2.post("/api/register", async (req, res, next) => {
    try {
      const { username, password, name, studentId } = req.body;
      if (!username || !password || !name || !studentId) {
        return res.status(400).send("All fields are required");
      }
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).send("Username already exists");
      }
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        name,
        studentId
      });
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      next(error);
    }
  });
  app2.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.status(401).send("Invalid username or password");
      req.login(user, (err2) => {
        if (err2) return next(err2);
        res.status(200).json(user);
      });
    })(req, res, next);
  });
  app2.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}

// server/database-storage.ts
import connectPg from "connect-pg-simple";
import session2 from "express-session";

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  achievements: () => achievements,
  campusCats: () => campusCats,
  canteenOutlets: () => canteenOutlets,
  catPosts: () => catPosts,
  comments: () => comments,
  forumPosts: () => forumPosts,
  groupMembers: () => groupMembers,
  groupTasks: () => groupTasks,
  insertAchievementSchema: () => insertAchievementSchema,
  insertCampusCatSchema: () => insertCampusCatSchema,
  insertCanteenOutletSchema: () => insertCanteenOutletSchema,
  insertCatPostSchema: () => insertCatPostSchema,
  insertCommentSchema: () => insertCommentSchema,
  insertForumPostSchema: () => insertForumPostSchema,
  insertGroupMemberSchema: () => insertGroupMemberSchema,
  insertGroupTaskSchema: () => insertGroupTaskSchema,
  insertLearningMaterialSchema: () => insertLearningMaterialSchema,
  insertOutletRatingSchema: () => insertOutletRatingSchema,
  insertUserAchievementSchema: () => insertUserAchievementSchema,
  insertUserSchema: () => insertUserSchema,
  insertWorkshopGroupSchema: () => insertWorkshopGroupSchema,
  learningMaterials: () => learningMaterials,
  outletRatings: () => outletRatings,
  userAchievements: () => userAchievements,
  users: () => users,
  workshopGroups: () => workshopGroups
});
import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  studentId: text("studentId").notNull(),
  isAdmin: boolean("isAdmin").default(false).notNull(),
  joinDate: timestamp("joinDate").defaultNow().notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  studentId: true
});
var learningMaterials = pgTable("learningMaterials", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  contentUrl: text("contentUrl"),
  materialType: text("materialType").notNull(),
  // Notes, Past Papers, Tutorials
  userId: integer("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  downloads: integer("downloads").default(0).notNull()
});
var insertLearningMaterialSchema = createInsertSchema(learningMaterials).pick({
  title: true,
  description: true,
  contentUrl: true,
  materialType: true,
  userId: true
});
var forumPosts = pgTable("forumPosts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  userId: integer("userId").notNull(),
  category: text("category").notNull(),
  // CafeTalk, Workshop
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  views: integer("views").default(0).notNull(),
  likes: integer("likes").default(0).notNull()
});
var insertForumPostSchema = createInsertSchema(forumPosts).pick({
  title: true,
  content: true,
  userId: true,
  category: true
});
var comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  userId: integer("userId").notNull(),
  postId: integer("postId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var insertCommentSchema = createInsertSchema(comments).pick({
  content: true,
  userId: true,
  postId: true
});
var workshopGroups = pgTable("workshopGroups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var insertWorkshopGroupSchema = createInsertSchema(workshopGroups).pick({
  name: true,
  description: true,
  createdBy: true
});
var groupMembers = pgTable("groupMembers", {
  id: serial("id").primaryKey(),
  groupId: integer("groupId").notNull(),
  userId: integer("userId").notNull(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull()
});
var insertGroupMemberSchema = createInsertSchema(groupMembers).pick({
  groupId: true,
  userId: true
});
var groupTasks = pgTable("groupTasks", {
  id: serial("id").primaryKey(),
  groupId: integer("groupId").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  assignedTo: integer("assignedTo"),
  completed: boolean("completed").default(false).notNull(),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var insertGroupTaskSchema = createInsertSchema(groupTasks).pick({
  groupId: true,
  title: true,
  description: true,
  assignedTo: true,
  createdBy: true
});
var campusCats = pgTable("campusCats", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  // Library, Canteen, Hostels, etc.
  imageUrl: text("imageUrl"),
  addedBy: integer("addedBy").notNull(),
  addedAt: timestamp("addedAt").defaultNow().notNull(),
  lastSeen: timestamp("lastSeen").defaultNow().notNull(),
  traits: text("traits").array().notNull()
});
var insertCampusCatSchema = createInsertSchema(campusCats).pick({
  name: true,
  description: true,
  location: true,
  imageUrl: true,
  addedBy: true,
  traits: true
});
var catPosts = pgTable("catPosts", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  imageUrl: text("imageUrl"),
  userId: integer("userId").notNull(),
  catId: integer("catId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  likes: integer("likes").default(0).notNull()
});
var insertCatPostSchema = createInsertSchema(catPosts).pick({
  content: true,
  imageUrl: true,
  userId: true,
  catId: true
});
var canteenOutlets = pgTable("canteenOutlets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  categories: text("categories").array().notNull(),
  // Array of categories like Asian, Western, etc.
  priceRange: text("priceRange").notNull(),
  openingHours: text("openingHours").notNull(),
  addedBy: integer("addedBy").notNull(),
  addedAt: timestamp("addedAt").defaultNow().notNull(),
  isOpen: boolean("isOpen").default(true).notNull()
});
var insertCanteenOutletSchema = createInsertSchema(canteenOutlets).pick({
  name: true,
  description: true,
  location: true,
  categories: true,
  priceRange: true,
  openingHours: true,
  addedBy: true,
  isOpen: true
});
var outletRatings = pgTable("outletRatings", {
  id: serial("id").primaryKey(),
  outletId: integer("outletId").notNull(),
  userId: integer("userId").notNull(),
  rating: integer("rating").notNull(),
  // 1-5 stars
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var insertOutletRatingSchema = createInsertSchema(outletRatings).pick({
  outletId: true,
  userId: true,
  rating: true,
  comment: true
});
var achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  // FontAwesome icon name
  category: text("category").notNull()
  // Forum, Cat, Food, etc.
});
var insertAchievementSchema = createInsertSchema(achievements).pick({
  name: true,
  description: true,
  icon: true,
  category: true
});
var userAchievements = pgTable("userAchievements", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  achievementId: integer("achievementId").notNull(),
  progress: integer("progress").default(0).notNull(),
  completed: boolean("completed").default(false).notNull(),
  completedAt: timestamp("completedAt")
});
var insertUserAchievementSchema = createInsertSchema(userAchievements).pick({
  userId: true,
  achievementId: true,
  progress: true,
  completed: true
});

// server/db.ts
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/database-storage.ts
import { eq, desc, asc } from "drizzle-orm";
function ensureNullForUndefined(obj) {
  if (typeof obj !== "object" || obj === null) return obj;
  const result = { ...obj };
  for (const [key, value] of Object.entries(result)) {
    if (value === void 0) {
      result[key] = null;
    }
  }
  return result;
}
var DatabaseStorage = class {
  sessionStore;
  constructor() {
    const PostgresStore = connectPg(session2);
    this.sessionStore = new PostgresStore({
      pool,
      createTableIfMissing: true
    });
    this.seedAchievements();
  }
  // =============== USERS ===============
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username.toLowerCase()));
    return user;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values({
      ...insertUser,
      joinDate: /* @__PURE__ */ new Date(),
      isAdmin: false
    }).returning();
    const achievements2 = await this.getAchievements();
    for (const achievement of achievements2) {
      await this.createUserAchievement({
        userId: user.id,
        achievementId: achievement.id,
        progress: 0,
        completed: false
      });
    }
    return user;
  }
  async seedAdminUser() {
    const existingAdmin = await this.getUserByUsername("abc123");
    if (!existingAdmin) {
      const hashedPassword = await hashPassword("def567");
      const [admin] = await db.insert(users).values({
        username: "abc123",
        password: hashedPassword,
        name: "Admin User",
        studentId: "ADMIN",
        joinDate: /* @__PURE__ */ new Date(),
        isAdmin: true
      }).returning();
      const achievements2 = await this.getAchievements();
      for (const achievement of achievements2) {
        await this.createUserAchievement({
          userId: admin.id,
          achievementId: achievement.id,
          progress: 0,
          completed: false
        });
      }
    }
  }
  // =============== LEARNING MATERIALS ===============
  async getLearningMaterials() {
    return await db.select().from(learningMaterials);
  }
  async createLearningMaterial(material) {
    const [newMaterial] = await db.insert(learningMaterials).values({
      ...ensureNullForUndefined(material),
      createdAt: /* @__PURE__ */ new Date(),
      downloads: 0
    }).returning();
    return newMaterial;
  }
  // =============== FORUM POSTS ===============
  async getForumPosts(category) {
    if (category) {
      return await db.select().from(forumPosts).where(eq(forumPosts.category, category)).orderBy(desc(forumPosts.createdAt));
    }
    return await db.select().from(forumPosts).orderBy(desc(forumPosts.createdAt));
  }
  async createForumPost(post) {
    const [newPost] = await db.insert(forumPosts).values({
      ...post,
      createdAt: /* @__PURE__ */ new Date(),
      views: 0,
      likes: 0
    }).returning();
    return newPost;
  }
  // =============== COMMENTS ===============
  async getCommentsByPostId(postId) {
    return await db.select().from(comments).where(eq(comments.postId, postId)).orderBy(asc(comments.createdAt));
  }
  async createComment(comment) {
    const [newComment] = await db.insert(comments).values({
      ...comment,
      createdAt: /* @__PURE__ */ new Date()
    }).returning();
    return newComment;
  }
  // =============== WORKSHOP GROUPS ===============
  async getWorkshopGroupsByUserId(userId) {
    const memberRecords = await db.select().from(groupMembers).where(eq(groupMembers.userId, userId));
    const groupIds = memberRecords.map((member) => member.groupId);
    if (groupIds.length === 0) {
      return [];
    }
    const allGroups = await db.select().from(workshopGroups);
    return allGroups.filter((group) => groupIds.includes(group.id));
  }
  async createWorkshopGroup(group) {
    const [newGroup] = await db.insert(workshopGroups).values({
      ...group,
      createdAt: /* @__PURE__ */ new Date()
    }).returning();
    return newGroup;
  }
  // =============== GROUP MEMBERS ===============
  async getGroupMembersByGroupId(groupId) {
    return await db.select().from(groupMembers).where(eq(groupMembers.groupId, groupId));
  }
  async addGroupMember(member) {
    const [newMember] = await db.insert(groupMembers).values({
      ...member,
      joinedAt: /* @__PURE__ */ new Date()
    }).returning();
    return newMember;
  }
  // =============== GROUP TASKS ===============
  async getGroupTasksByGroupId(groupId) {
    return await db.select().from(groupTasks).where(eq(groupTasks.groupId, groupId));
  }
  async createGroupTask(task) {
    const [newTask] = await db.insert(groupTasks).values({
      ...ensureNullForUndefined(task),
      completed: false,
      createdAt: /* @__PURE__ */ new Date()
    }).returning();
    return newTask;
  }
  // =============== CAMPUS CATS ===============
  async getCampusCats(location) {
    if (location) {
      return await db.select().from(campusCats).where(eq(campusCats.location, location));
    }
    return await db.select().from(campusCats);
  }
  async createCampusCat(cat) {
    const [newCat] = await db.insert(campusCats).values({
      ...ensureNullForUndefined(cat),
      addedAt: /* @__PURE__ */ new Date(),
      lastSeen: /* @__PURE__ */ new Date()
    }).returning();
    return newCat;
  }
  // =============== CAT POSTS ===============
  async getCatPosts() {
    return await db.select().from(catPosts).orderBy(desc(catPosts.createdAt));
  }
  async createCatPost(post) {
    const [newPost] = await db.insert(catPosts).values({
      ...ensureNullForUndefined(post),
      createdAt: /* @__PURE__ */ new Date(),
      likes: 0
    }).returning();
    return newPost;
  }
  // =============== CANTEEN OUTLETS ===============
  async getCanteenOutlets(category) {
    const outlets = await db.select().from(canteenOutlets);
    if (category) {
      return outlets.filter(
        (outlet) => outlet.categories.includes(category)
      );
    }
    return outlets;
  }
  async createCanteenOutlet(outlet) {
    const [newOutlet] = await db.insert(canteenOutlets).values({
      ...ensureNullForUndefined(outlet),
      addedAt: /* @__PURE__ */ new Date(),
      isOpen: outlet.isOpen ?? true
      // Default to true if not specified
    }).returning();
    return newOutlet;
  }
  // =============== OUTLET RATINGS ===============
  async getOutletRatingsByOutletId(outletId) {
    return await db.select().from(outletRatings).where(eq(outletRatings.outletId, outletId));
  }
  async createOutletRating(rating) {
    const [newRating] = await db.insert(outletRatings).values({
      ...ensureNullForUndefined(rating),
      createdAt: /* @__PURE__ */ new Date()
    }).returning();
    return newRating;
  }
  // =============== ACHIEVEMENTS ===============
  async getAchievements() {
    return await db.select().from(achievements);
  }
  async createAchievement(achievement) {
    const [newAchievement] = await db.insert(achievements).values(achievement).returning();
    return newAchievement;
  }
  async seedAchievements() {
    const existingAchievements = await this.getAchievements();
    if (existingAchievements.length === 0) {
      const achievementData = [
        {
          name: "First Post",
          description: "Created your first post",
          icon: "feather-alt",
          category: "Forum"
        },
        {
          name: "Cat Lover",
          description: "Added 5 cats to favorites",
          icon: "cat",
          category: "Cats"
        },
        {
          name: "Food Critic",
          description: "Rated 10 food outlets",
          icon: "utensils",
          category: "Food"
        },
        {
          name: "Knowledge Sharer",
          description: "Share 5 study materials",
          icon: "graduation-cap",
          category: "Learning"
        },
        {
          name: "Active Participant",
          description: "Comment on 20 discussions",
          icon: "comments",
          category: "Forum"
        },
        {
          name: "Cat Photographer",
          description: "Share 10 photos in Daily Feed",
          icon: "camera",
          category: "Cats"
        }
      ];
      for (const achievement of achievementData) {
        await this.createAchievement(achievement);
      }
    }
  }
  // =============== USER ACHIEVEMENTS ===============
  async getUserAchievementsByUserId(userId) {
    const userAchievementRecords = await db.select().from(userAchievements).where(eq(userAchievements.userId, userId));
    const result = [];
    for (const ua of userAchievementRecords) {
      const [achievement] = await db.select().from(achievements).where(eq(achievements.id, ua.achievementId));
      if (achievement) {
        result.push({
          ...ua,
          achievement
        });
      }
    }
    return result;
  }
  async createUserAchievement(userAchievement) {
    const [newUserAchievement] = await db.insert(userAchievements).values({
      ...ensureNullForUndefined(userAchievement),
      completed: userAchievement.completed ?? false,
      progress: userAchievement.progress ?? 0,
      completedAt: userAchievement.completed ? /* @__PURE__ */ new Date() : null
    }).returning();
    return newUserAchievement;
  }
};

// server/storage.ts
var storage = new DatabaseStorage();

// server/routes.ts
import { ZodError } from "zod";
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).send("Authentication required");
}
function isAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user && req.user.isAdmin) {
    return next();
  }
  res.status(403).send("Admin access required");
}
async function registerRoutes(app2) {
  setupAuth(app2);
  await storage.seedAdminUser();
  function handleZodError(error, res) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors
      });
    }
    throw error;
  }
  app2.get("/api/learning-materials", async (req, res) => {
    try {
      const materials = await storage.getLearningMaterials();
      res.json(materials);
    } catch (error) {
      res.status(500).send("Error fetching learning materials");
    }
  });
  app2.post("/api/learning-materials", isAuthenticated, async (req, res) => {
    try {
      const data = insertLearningMaterialSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      const material = await storage.createLearningMaterial(data);
      res.status(201).json(material);
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).send("Error creating learning material");
    }
  });
  app2.get("/api/forum-posts", async (req, res) => {
    try {
      const category = req.query.category;
      const posts = await storage.getForumPosts(category);
      res.json(posts);
    } catch (error) {
      res.status(500).send("Error fetching forum posts");
    }
  });
  app2.post("/api/forum-posts", isAuthenticated, async (req, res) => {
    try {
      const data = insertForumPostSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      const post = await storage.createForumPost(data);
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).send("Error creating forum post");
    }
  });
  app2.post("/api/comments", isAuthenticated, async (req, res) => {
    try {
      const data = insertCommentSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      const comment = await storage.createComment(data);
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).send("Error creating comment");
    }
  });
  app2.get("/api/comments/:postId", async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const comments2 = await storage.getCommentsByPostId(postId);
      res.json(comments2);
    } catch (error) {
      res.status(500).send("Error fetching comments");
    }
  });
  app2.get("/api/workshop-groups", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const groups = await storage.getWorkshopGroupsByUserId(userId);
      res.json(groups);
    } catch (error) {
      res.status(500).send("Error fetching workshop groups");
    }
  });
  app2.post("/api/workshop-groups", isAuthenticated, async (req, res) => {
    try {
      const data = insertWorkshopGroupSchema.parse({
        ...req.body,
        createdBy: req.user.id
      });
      const group = await storage.createWorkshopGroup(data);
      await storage.addGroupMember({
        groupId: group.id,
        userId: req.user.id
      });
      res.status(201).json(group);
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).send("Error creating workshop group");
    }
  });
  app2.post("/api/group-members", isAuthenticated, async (req, res) => {
    try {
      const data = insertGroupMemberSchema.parse(req.body);
      const member = await storage.addGroupMember(data);
      res.status(201).json(member);
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).send("Error adding group member");
    }
  });
  app2.get("/api/group-tasks/:groupId", isAuthenticated, async (req, res) => {
    try {
      const groupId = parseInt(req.params.groupId);
      const tasks = await storage.getGroupTasksByGroupId(groupId);
      res.json(tasks);
    } catch (error) {
      res.status(500).send("Error fetching group tasks");
    }
  });
  app2.post("/api/group-tasks", isAuthenticated, async (req, res) => {
    try {
      const data = insertGroupTaskSchema.parse({
        ...req.body,
        createdBy: req.user.id
      });
      const task = await storage.createGroupTask(data);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).send("Error creating group task");
    }
  });
  app2.get("/api/campus-cats", async (req, res) => {
    try {
      const location = req.query.location;
      const cats = await storage.getCampusCats(location);
      res.json(cats);
    } catch (error) {
      res.status(500).send("Error fetching campus cats");
    }
  });
  app2.post("/api/campus-cats", isAuthenticated, async (req, res) => {
    try {
      const data = insertCampusCatSchema.parse({
        ...req.body,
        addedBy: req.user.id
      });
      const cat = await storage.createCampusCat(data);
      res.status(201).json(cat);
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).send("Error creating campus cat");
    }
  });
  app2.get("/api/cat-posts", async (req, res) => {
    try {
      const posts = await storage.getCatPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).send("Error fetching cat posts");
    }
  });
  app2.post("/api/cat-posts", isAuthenticated, async (req, res) => {
    try {
      const data = insertCatPostSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      const post = await storage.createCatPost(data);
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).send("Error creating cat post");
    }
  });
  app2.get("/api/canteen-outlets", async (req, res) => {
    try {
      const category = req.query.category;
      const outlets = await storage.getCanteenOutlets(category);
      res.json(outlets);
    } catch (error) {
      res.status(500).send("Error fetching canteen outlets");
    }
  });
  app2.post("/api/canteen-outlets", isAdmin, async (req, res) => {
    try {
      const data = insertCanteenOutletSchema.parse({
        ...req.body,
        addedBy: req.user.id
      });
      const outlet = await storage.createCanteenOutlet(data);
      res.status(201).json(outlet);
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).send("Error creating canteen outlet");
    }
  });
  app2.get("/api/outlet-ratings/:outletId", async (req, res) => {
    try {
      const outletId = parseInt(req.params.outletId);
      const ratings = await storage.getOutletRatingsByOutletId(outletId);
      res.json(ratings);
    } catch (error) {
      res.status(500).send("Error fetching outlet ratings");
    }
  });
  app2.post("/api/outlet-ratings", isAuthenticated, async (req, res) => {
    try {
      const data = insertOutletRatingSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      const rating = await storage.createOutletRating(data);
      res.status(201).json(rating);
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).send("Error creating outlet rating");
    }
  });
  app2.get("/api/achievements", async (req, res) => {
    try {
      const achievements2 = await storage.getAchievements();
      res.json(achievements2);
    } catch (error) {
      res.status(500).send("Error fetching achievements");
    }
  });
  app2.get("/api/user-achievements", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const userAchievements2 = await storage.getUserAchievementsByUserId(userId);
      res.json(userAchievements2);
    } catch (error) {
      res.status(500).send("Error fetching user achievements");
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
