import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  InsertLearningMaterial, 
  InsertForumPost, 
  InsertComment, 
  InsertWorkshopGroup,
  InsertGroupMember,
  InsertGroupTask,
  InsertCampusCat,
  InsertCatPost,
  InsertCanteenOutlet,
  InsertOutletRating,
  insertLearningMaterialSchema,
  insertForumPostSchema,
  insertCommentSchema,
  insertWorkshopGroupSchema,
  insertGroupMemberSchema,
  insertGroupTaskSchema,
  insertCampusCatSchema,
  insertCatPostSchema,
  insertCanteenOutletSchema,
  insertOutletRatingSchema
} from "@shared/schema";
import { ZodError } from "zod";

// Authentication middleware
function isAuthenticated(req: Request, res: Response, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).send("Authentication required");
}

// Admin middleware
function isAdmin(req: Request, res: Response, next: () => void) {
  if (req.isAuthenticated() && req.user && req.user.isAdmin) {
    return next();
  }
  res.status(403).send("Admin access required");
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup auth routes (/api/register, /api/login, /api/logout, /api/user)
  setupAuth(app);

  // Initialize database with admin user
  await storage.seedAdminUser();

  // Error handler for Zod validation errors
  function handleZodError(error: unknown, res: Response) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }
    throw error;
  }

  /*
   * Learning Port Routes
   */
  app.get("/api/learning-materials", async (req, res) => {
    try {
      const materials = await storage.getLearningMaterials();
      res.json(materials);
    } catch (error) {
      res.status(500).send("Error fetching learning materials");
    }
  });

  app.post("/api/learning-materials", isAuthenticated, async (req, res) => {
    try {
      const data = insertLearningMaterialSchema.parse({
        ...req.body,
        userId: req.user!.id,
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

  /*
   * Forum Routes (Cafe Talk)
   */
  app.get("/api/forum-posts", async (req, res) => {
    try {
      const category = req.query.category as string;
      const posts = await storage.getForumPosts(category);
      res.json(posts);
    } catch (error) {
      res.status(500).send("Error fetching forum posts");
    }
  });

  app.post("/api/forum-posts", isAuthenticated, async (req, res) => {
    try {
      const data = insertForumPostSchema.parse({
        ...req.body,
        userId: req.user!.id,
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

  app.post("/api/comments", isAuthenticated, async (req, res) => {
    try {
      const data = insertCommentSchema.parse({
        ...req.body,
        userId: req.user!.id,
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

  app.get("/api/comments/:postId", async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const comments = await storage.getCommentsByPostId(postId);
      res.json(comments);
    } catch (error) {
      res.status(500).send("Error fetching comments");
    }
  });

  /*
   * Workshop Routes
   */
  app.get("/api/workshop-groups", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const groups = await storage.getWorkshopGroupsByUserId(userId);
      res.json(groups);
    } catch (error) {
      res.status(500).send("Error fetching workshop groups");
    }
  });

  app.post("/api/workshop-groups", isAuthenticated, async (req, res) => {
    try {
      const data = insertWorkshopGroupSchema.parse({
        ...req.body,
        createdBy: req.user!.id,
      });
      const group = await storage.createWorkshopGroup(data);
      
      // Add the creator as a member
      await storage.addGroupMember({
        groupId: group.id,
        userId: req.user!.id,
      });
      
      res.status(201).json(group);
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).send("Error creating workshop group");
    }
  });

  app.post("/api/group-members", isAuthenticated, async (req, res) => {
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

  app.get("/api/group-tasks/:groupId", isAuthenticated, async (req, res) => {
    try {
      const groupId = parseInt(req.params.groupId);
      const tasks = await storage.getGroupTasksByGroupId(groupId);
      res.json(tasks);
    } catch (error) {
      res.status(500).send("Error fetching group tasks");
    }
  });

  app.post("/api/group-tasks", isAuthenticated, async (req, res) => {
    try {
      const data = insertGroupTaskSchema.parse({
        ...req.body,
        createdBy: req.user!.id,
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

  /*
   * Campus Cats Routes
   */
  app.get("/api/campus-cats", async (req, res) => {
    try {
      const location = req.query.location as string;
      const cats = await storage.getCampusCats(location);
      res.json(cats);
    } catch (error) {
      res.status(500).send("Error fetching campus cats");
    }
  });

  app.post("/api/campus-cats", isAuthenticated, async (req, res) => {
    try {
      const data = insertCampusCatSchema.parse({
        ...req.body,
        addedBy: req.user!.id,
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

  app.get("/api/cat-posts", async (req, res) => {
    try {
      const posts = await storage.getCatPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).send("Error fetching cat posts");
    }
  });

  app.post("/api/cat-posts", isAuthenticated, async (req, res) => {
    try {
      const data = insertCatPostSchema.parse({
        ...req.body,
        userId: req.user!.id,
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

  /*
   * Canteen Routes
   */
  app.get("/api/canteen-outlets", async (req, res) => {
    try {
      const category = req.query.category as string;
      const outlets = await storage.getCanteenOutlets(category);
      res.json(outlets);
    } catch (error) {
      res.status(500).send("Error fetching canteen outlets");
    }
  });

  app.post("/api/canteen-outlets", isAdmin, async (req, res) => {
    try {
      const data = insertCanteenOutletSchema.parse({
        ...req.body,
        addedBy: req.user!.id,
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

  app.get("/api/outlet-ratings/:outletId", async (req, res) => {
    try {
      const outletId = parseInt(req.params.outletId);
      const ratings = await storage.getOutletRatingsByOutletId(outletId);
      res.json(ratings);
    } catch (error) {
      res.status(500).send("Error fetching outlet ratings");
    }
  });

  app.post("/api/outlet-ratings", isAuthenticated, async (req, res) => {
    try {
      const data = insertOutletRatingSchema.parse({
        ...req.body,
        userId: req.user!.id,
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

  /*
   * User Achievement Routes
   */
  app.get("/api/achievements", async (req, res) => {
    try {
      const achievements = await storage.getAchievements();
      res.json(achievements);
    } catch (error) {
      res.status(500).send("Error fetching achievements");
    }
  });

  app.get("/api/user-achievements", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const userAchievements = await storage.getUserAchievementsByUserId(userId);
      res.json(userAchievements);
    } catch (error) {
      res.status(500).send("Error fetching user achievements");
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
