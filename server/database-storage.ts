import connectPg from "connect-pg-simple";
import session from "express-session";
import { hashPassword } from "./auth";
import { db, pool } from "./db";
import { eq, desc, asc, and, isNull } from "drizzle-orm";
import { IStorage } from "./storage";
import { 
  User, InsertUser,
  LearningMaterial, InsertLearningMaterial,
  ForumPost, InsertForumPost,
  Comment, InsertComment,
  WorkshopGroup, InsertWorkshopGroup,
  GroupMember, InsertGroupMember,
  GroupTask, InsertGroupTask,
  CampusCat, InsertCampusCat,
  CatPost, InsertCatPost,
  CanteenOutlet, InsertCanteenOutlet,
  OutletRating, InsertOutletRating,
  Achievement, InsertAchievement,
  UserAchievement, InsertUserAchievement,
  users, learningMaterials, forumPosts, comments, workshopGroups,
  groupMembers, groupTasks, campusCats, catPosts, canteenOutlets,
  outletRatings, achievements, userAchievements
} from "@shared/schema";

// Helper function to ensure optional fields have null value instead of undefined
function ensureNullForUndefined<T>(obj: T): T {
  if (typeof obj !== 'object' || obj === null) return obj;
  
  const result = { ...obj };
  for (const [key, value] of Object.entries(result)) {
    if (value === undefined) {
      (result as any)[key] = null;
    }
  }
  
  return result;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    const PostgresStore = connectPg(session);
    this.sessionStore = new PostgresStore({
      pool,
      createTableIfMissing: true
    });
    
    // Seed initial achievements
    this.seedAchievements();
  }
  
  // =============== USERS ===============
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username.toLowerCase()));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        joinDate: new Date(),
        isAdmin: false
      })
      .returning();
    
    // Create default achievements for new user
    const achievements = await this.getAchievements();
    for (const achievement of achievements) {
      await this.createUserAchievement({
        userId: user.id,
        achievementId: achievement.id,
        progress: 0,
        completed: false
      });
    }
    
    return user;
  }
  
  async seedAdminUser(): Promise<void> {
    const existingAdmin = await this.getUserByUsername("abc123");
    if (!existingAdmin) {
      const hashedPassword = await hashPassword("def567");
      const [admin] = await db
        .insert(users)
        .values({
          username: "abc123",
          password: hashedPassword,
          name: "Admin User",
          studentId: "ADMIN",
          joinDate: new Date(),
          isAdmin: true
        })
        .returning();
      
      // Add achievements for admin
      const achievements = await this.getAchievements();
      for (const achievement of achievements) {
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
  async getLearningMaterials(): Promise<LearningMaterial[]> {
    return await db.select().from(learningMaterials);
  }
  
  async createLearningMaterial(material: InsertLearningMaterial): Promise<LearningMaterial> {
    const [newMaterial] = await db
      .insert(learningMaterials)
      .values({
        ...ensureNullForUndefined(material),
        createdAt: new Date(),
        downloads: 0
      })
      .returning();
    
    return newMaterial;
  }
  
  // =============== FORUM POSTS ===============
  async getForumPosts(category?: string): Promise<ForumPost[]> {
    if (category) {
      return await db
        .select()
        .from(forumPosts)
        .where(eq(forumPosts.category, category))
        .orderBy(desc(forumPosts.createdAt));
    }
    
    return await db
      .select()
      .from(forumPosts)
      .orderBy(desc(forumPosts.createdAt));
  }
  
  async createForumPost(post: InsertForumPost): Promise<ForumPost> {
    const [newPost] = await db
      .insert(forumPosts)
      .values({
        ...post,
        createdAt: new Date(),
        views: 0,
        likes: 0
      })
      .returning();
    
    return newPost;
  }
  
  // =============== COMMENTS ===============
  async getCommentsByPostId(postId: number): Promise<Comment[]> {
    return await db
      .select()
      .from(comments)
      .where(eq(comments.postId, postId))
      .orderBy(asc(comments.createdAt));
  }
  
  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db
      .insert(comments)
      .values({
        ...comment,
        createdAt: new Date()
      })
      .returning();
    
    return newComment;
  }
  
  // =============== WORKSHOP GROUPS ===============
  async getWorkshopGroupsByUserId(userId: number): Promise<WorkshopGroup[]> {
    // Get all group IDs the user is a member of
    const memberRecords = await db
      .select()
      .from(groupMembers)
      .where(eq(groupMembers.userId, userId));
    
    const groupIds = memberRecords.map(member => member.groupId);
    
    if (groupIds.length === 0) {
      return [];
    }
    
    // Get the group details for these IDs
    
    // Manual filter for IDs since .in operator has type issues
    const allGroups = await db.select().from(workshopGroups);
    return allGroups.filter(group => groupIds.includes(group.id));
  }
  
  async createWorkshopGroup(group: InsertWorkshopGroup): Promise<WorkshopGroup> {
    const [newGroup] = await db
      .insert(workshopGroups)
      .values({
        ...group,
        createdAt: new Date()
      })
      .returning();
    
    return newGroup;
  }
  
  // =============== GROUP MEMBERS ===============
  async getGroupMembersByGroupId(groupId: number): Promise<GroupMember[]> {
    return await db
      .select()
      .from(groupMembers)
      .where(eq(groupMembers.groupId, groupId));
  }
  
  async addGroupMember(member: InsertGroupMember): Promise<GroupMember> {
    const [newMember] = await db
      .insert(groupMembers)
      .values({
        ...member,
        joinedAt: new Date()
      })
      .returning();
    
    return newMember;
  }
  
  // =============== GROUP TASKS ===============
  async getGroupTasksByGroupId(groupId: number): Promise<GroupTask[]> {
    return await db
      .select()
      .from(groupTasks)
      .where(eq(groupTasks.groupId, groupId));
  }
  
  async createGroupTask(task: InsertGroupTask): Promise<GroupTask> {
    const [newTask] = await db
      .insert(groupTasks)
      .values({
        ...ensureNullForUndefined(task),
        completed: false,
        createdAt: new Date()
      })
      .returning();
    
    return newTask;
  }
  
  // =============== CAMPUS CATS ===============
  async getCampusCats(location?: string): Promise<CampusCat[]> {
    if (location) {
      return await db
        .select()
        .from(campusCats)
        .where(eq(campusCats.location, location));
    }
    
    return await db.select().from(campusCats);
  }
  
  async createCampusCat(cat: InsertCampusCat): Promise<CampusCat> {
    const [newCat] = await db
      .insert(campusCats)
      .values({
        ...ensureNullForUndefined(cat),
        addedAt: new Date(),
        lastSeen: new Date()
      })
      .returning();
    
    return newCat;
  }
  
  // =============== CAT POSTS ===============
  async getCatPosts(): Promise<CatPost[]> {
    return await db
      .select()
      .from(catPosts)
      .orderBy(desc(catPosts.createdAt));
  }
  
  async createCatPost(post: InsertCatPost): Promise<CatPost> {
    const [newPost] = await db
      .insert(catPosts)
      .values({
        ...ensureNullForUndefined(post),
        createdAt: new Date(),
        likes: 0
      })
      .returning();
    
    return newPost;
  }
  
  // =============== CANTEEN OUTLETS ===============
  async getCanteenOutlets(category?: string): Promise<CanteenOutlet[]> {
    const outlets = await db.select().from(canteenOutlets);
    
    if (category) {
      return outlets.filter(outlet => 
        outlet.categories.includes(category)
      );
    }
    
    return outlets;
  }
  
  async createCanteenOutlet(outlet: InsertCanteenOutlet): Promise<CanteenOutlet> {
    const [newOutlet] = await db
      .insert(canteenOutlets)
      .values({
        ...ensureNullForUndefined(outlet),
        addedAt: new Date(),
        isOpen: outlet.isOpen ?? true // Default to true if not specified
      })
      .returning();
    
    return newOutlet;
  }
  
  // =============== OUTLET RATINGS ===============
  async getOutletRatingsByOutletId(outletId: number): Promise<OutletRating[]> {
    return await db
      .select()
      .from(outletRatings)
      .where(eq(outletRatings.outletId, outletId));
  }
  
  async createOutletRating(rating: InsertOutletRating): Promise<OutletRating> {
    const [newRating] = await db
      .insert(outletRatings)
      .values({
        ...ensureNullForUndefined(rating),
        createdAt: new Date()
      })
      .returning();
    
    return newRating;
  }
  
  // =============== ACHIEVEMENTS ===============
  async getAchievements(): Promise<Achievement[]> {
    return await db.select().from(achievements);
  }
  
  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const [newAchievement] = await db
      .insert(achievements)
      .values(achievement)
      .returning();
    
    return newAchievement;
  }
  
  private async seedAchievements(): Promise<void> {
    const existingAchievements = await this.getAchievements();
    
    if (existingAchievements.length === 0) {
      const achievementData: InsertAchievement[] = [
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
  async getUserAchievementsByUserId(userId: number): Promise<(UserAchievement & { achievement: Achievement })[]> {
    const userAchievementRecords = await db
      .select()
      .from(userAchievements)
      .where(eq(userAchievements.userId, userId));
    
    // Get achievement details for each user achievement
    const result: (UserAchievement & { achievement: Achievement })[] = [];
    
    for (const ua of userAchievementRecords) {
      const [achievement] = await db
        .select()
        .from(achievements)
        .where(eq(achievements.id, ua.achievementId));
      
      if (achievement) {
        result.push({
          ...ua,
          achievement
        });
      }
    }
    
    return result;
  }
  
  async createUserAchievement(userAchievement: InsertUserAchievement): Promise<UserAchievement> {
    const [newUserAchievement] = await db
      .insert(userAchievements)
      .values({
        ...ensureNullForUndefined(userAchievement),
        completed: userAchievement.completed ?? false,
        progress: userAchievement.progress ?? 0,
        completedAt: userAchievement.completed ? new Date() : null
      })
      .returning();
    
    return newUserAchievement;
  }
}