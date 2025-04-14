import createMemoryStore from "memorystore";
import session from "express-session";
import { hashPassword } from "./auth";
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
  UserAchievement, InsertUserAchievement
} from "@shared/schema";

export interface IStorage {
  // Session
  sessionStore: session.Store;
  
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  seedAdminUser(): Promise<void>;
  
  // Learning Materials
  getLearningMaterials(): Promise<LearningMaterial[]>;
  createLearningMaterial(material: InsertLearningMaterial): Promise<LearningMaterial>;
  
  // Forum Posts
  getForumPosts(category?: string): Promise<ForumPost[]>;
  createForumPost(post: InsertForumPost): Promise<ForumPost>;
  
  // Comments
  getCommentsByPostId(postId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  
  // Workshop Groups
  getWorkshopGroupsByUserId(userId: number): Promise<WorkshopGroup[]>;
  createWorkshopGroup(group: InsertWorkshopGroup): Promise<WorkshopGroup>;
  
  // Group Members
  getGroupMembersByGroupId(groupId: number): Promise<GroupMember[]>;
  addGroupMember(member: InsertGroupMember): Promise<GroupMember>;
  
  // Group Tasks
  getGroupTasksByGroupId(groupId: number): Promise<GroupTask[]>;
  createGroupTask(task: InsertGroupTask): Promise<GroupTask>;
  
  // Campus Cats
  getCampusCats(location?: string): Promise<CampusCat[]>;
  createCampusCat(cat: InsertCampusCat): Promise<CampusCat>;
  
  // Cat Posts
  getCatPosts(): Promise<CatPost[]>;
  createCatPost(post: InsertCatPost): Promise<CatPost>;
  
  // Canteen Outlets
  getCanteenOutlets(category?: string): Promise<CanteenOutlet[]>;
  createCanteenOutlet(outlet: InsertCanteenOutlet): Promise<CanteenOutlet>;
  
  // Outlet Ratings
  getOutletRatingsByOutletId(outletId: number): Promise<OutletRating[]>;
  createOutletRating(rating: InsertOutletRating): Promise<OutletRating>;
  
  // Achievements
  getAchievements(): Promise<Achievement[]>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  
  // User Achievements
  getUserAchievementsByUserId(userId: number): Promise<(UserAchievement & { achievement: Achievement })[]>;
  createUserAchievement(userAchievement: InsertUserAchievement): Promise<UserAchievement>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private learningMaterials: Map<number, LearningMaterial>;
  private forumPosts: Map<number, ForumPost>;
  private comments: Map<number, Comment>;
  private workshopGroups: Map<number, WorkshopGroup>;
  private groupMembers: Map<number, GroupMember>;
  private groupTasks: Map<number, GroupTask>;
  private campusCats: Map<number, CampusCat>;
  private catPosts: Map<number, CatPost>;
  private canteenOutlets: Map<number, CanteenOutlet>;
  private outletRatings: Map<number, OutletRating>;
  private achievements: Map<number, Achievement>;
  private userAchievements: Map<number, UserAchievement>;
  
  sessionStore: session.Store;
  
  // ID counters
  private userIdCounter: number;
  private materialIdCounter: number;
  private postIdCounter: number;
  private commentIdCounter: number;
  private groupIdCounter: number;
  private memberIdCounter: number;
  private taskIdCounter: number;
  private catIdCounter: number;
  private catPostIdCounter: number;
  private outletIdCounter: number;
  private ratingIdCounter: number;
  private achievementIdCounter: number;
  private userAchievementIdCounter: number;

  constructor() {
    // Initialize Maps for data storage
    this.users = new Map();
    this.learningMaterials = new Map();
    this.forumPosts = new Map();
    this.comments = new Map();
    this.workshopGroups = new Map();
    this.groupMembers = new Map();
    this.groupTasks = new Map();
    this.campusCats = new Map();
    this.catPosts = new Map();
    this.canteenOutlets = new Map();
    this.outletRatings = new Map();
    this.achievements = new Map();
    this.userAchievements = new Map();
    
    // Initialize ID counters
    this.userIdCounter = 1;
    this.materialIdCounter = 1;
    this.postIdCounter = 1;
    this.commentIdCounter = 1;
    this.groupIdCounter = 1;
    this.memberIdCounter = 1;
    this.taskIdCounter = 1;
    this.catIdCounter = 1;
    this.catPostIdCounter = 1;
    this.outletIdCounter = 1;
    this.ratingIdCounter = 1;
    this.achievementIdCounter = 1;
    this.userAchievementIdCounter = 1;
    
    // Initialize session store
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Seed initial achievements
    this.seedAchievements();
  }
  
  // =============== USERS ===============
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const joinDate = new Date();
    const isAdmin = false;
    
    const user: User = { 
      ...insertUser, 
      id, 
      joinDate, 
      isAdmin 
    };
    
    this.users.set(id, user);
    
    // Create default achievements for new user
    const achievements = await this.getAchievements();
    for (const achievement of achievements) {
      await this.createUserAchievement({
        userId: id,
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
      const admin: InsertUser = {
        username: "abc123",
        password: hashedPassword,
        name: "Admin User",
        studentId: "ADMIN",
      };
      
      const id = this.userIdCounter++;
      const user: User = {
        ...admin,
        id,
        joinDate: new Date(),
        isAdmin: true
      };
      
      this.users.set(id, user);
      
      // Add achievements for admin
      const achievements = await this.getAchievements();
      for (const achievement of achievements) {
        await this.createUserAchievement({
          userId: id,
          achievementId: achievement.id,
          progress: 0,
          completed: false
        });
      }
    }
  }
  
  // =============== LEARNING MATERIALS ===============
  async getLearningMaterials(): Promise<LearningMaterial[]> {
    return Array.from(this.learningMaterials.values());
  }
  
  async createLearningMaterial(material: InsertLearningMaterial): Promise<LearningMaterial> {
    const id = this.materialIdCounter++;
    const newMaterial: LearningMaterial = {
      ...material,
      id,
      createdAt: new Date(),
      downloads: 0
    };
    
    this.learningMaterials.set(id, newMaterial);
    return newMaterial;
  }
  
  // =============== FORUM POSTS ===============
  async getForumPosts(category?: string): Promise<ForumPost[]> {
    let posts = Array.from(this.forumPosts.values());
    
    if (category) {
      posts = posts.filter(post => post.category === category);
    }
    
    return posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async createForumPost(post: InsertForumPost): Promise<ForumPost> {
    const id = this.postIdCounter++;
    const newPost: ForumPost = {
      ...post,
      id,
      createdAt: new Date(),
      views: 0,
      likes: 0
    };
    
    this.forumPosts.set(id, newPost);
    return newPost;
  }
  
  // =============== COMMENTS ===============
  async getCommentsByPostId(postId: number): Promise<Comment[]> {
    const comments = Array.from(this.comments.values())
      .filter(comment => comment.postId === postId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    
    return comments;
  }
  
  async createComment(comment: InsertComment): Promise<Comment> {
    const id = this.commentIdCounter++;
    const newComment: Comment = {
      ...comment,
      id,
      createdAt: new Date()
    };
    
    this.comments.set(id, newComment);
    return newComment;
  }
  
  // =============== WORKSHOP GROUPS ===============
  async getWorkshopGroupsByUserId(userId: number): Promise<WorkshopGroup[]> {
    // Get all group IDs the user is a member of
    const memberGroups = Array.from(this.groupMembers.values())
      .filter(member => member.userId === userId)
      .map(member => member.groupId);
    
    // Get the group details for these IDs
    const groups = Array.from(this.workshopGroups.values())
      .filter(group => memberGroups.includes(group.id));
    
    return groups;
  }
  
  async createWorkshopGroup(group: InsertWorkshopGroup): Promise<WorkshopGroup> {
    const id = this.groupIdCounter++;
    const newGroup: WorkshopGroup = {
      ...group,
      id,
      createdAt: new Date()
    };
    
    this.workshopGroups.set(id, newGroup);
    return newGroup;
  }
  
  // =============== GROUP MEMBERS ===============
  async getGroupMembersByGroupId(groupId: number): Promise<GroupMember[]> {
    return Array.from(this.groupMembers.values())
      .filter(member => member.groupId === groupId);
  }
  
  async addGroupMember(member: InsertGroupMember): Promise<GroupMember> {
    const id = this.memberIdCounter++;
    const newMember: GroupMember = {
      ...member,
      id,
      joinedAt: new Date()
    };
    
    this.groupMembers.set(id, newMember);
    return newMember;
  }
  
  // =============== GROUP TASKS ===============
  async getGroupTasksByGroupId(groupId: number): Promise<GroupTask[]> {
    return Array.from(this.groupTasks.values())
      .filter(task => task.groupId === groupId);
  }
  
  async createGroupTask(task: InsertGroupTask): Promise<GroupTask> {
    const id = this.taskIdCounter++;
    const newTask: GroupTask = {
      ...task,
      id,
      completed: false,
      createdAt: new Date()
    };
    
    this.groupTasks.set(id, newTask);
    return newTask;
  }
  
  // =============== CAMPUS CATS ===============
  async getCampusCats(location?: string): Promise<CampusCat[]> {
    let cats = Array.from(this.campusCats.values());
    
    if (location) {
      cats = cats.filter(cat => cat.location === location);
    }
    
    return cats;
  }
  
  async createCampusCat(cat: InsertCampusCat): Promise<CampusCat> {
    const id = this.catIdCounter++;
    const newCat: CampusCat = {
      ...cat,
      id,
      addedAt: new Date(),
      lastSeen: new Date()
    };
    
    this.campusCats.set(id, newCat);
    return newCat;
  }
  
  // =============== CAT POSTS ===============
  async getCatPosts(): Promise<CatPost[]> {
    return Array.from(this.catPosts.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async createCatPost(post: InsertCatPost): Promise<CatPost> {
    const id = this.catPostIdCounter++;
    const newPost: CatPost = {
      ...post,
      id,
      createdAt: new Date(),
      likes: 0
    };
    
    this.catPosts.set(id, newPost);
    return newPost;
  }
  
  // =============== CANTEEN OUTLETS ===============
  async getCanteenOutlets(category?: string): Promise<CanteenOutlet[]> {
    let outlets = Array.from(this.canteenOutlets.values());
    
    if (category) {
      outlets = outlets.filter(outlet => 
        outlet.categories.includes(category)
      );
    }
    
    return outlets;
  }
  
  async createCanteenOutlet(outlet: InsertCanteenOutlet): Promise<CanteenOutlet> {
    const id = this.outletIdCounter++;
    const newOutlet: CanteenOutlet = {
      ...outlet,
      id,
      addedAt: new Date()
    };
    
    this.canteenOutlets.set(id, newOutlet);
    return newOutlet;
  }
  
  // =============== OUTLET RATINGS ===============
  async getOutletRatingsByOutletId(outletId: number): Promise<OutletRating[]> {
    return Array.from(this.outletRatings.values())
      .filter(rating => rating.outletId === outletId);
  }
  
  async createOutletRating(rating: InsertOutletRating): Promise<OutletRating> {
    const id = this.ratingIdCounter++;
    const newRating: OutletRating = {
      ...rating,
      id,
      createdAt: new Date()
    };
    
    this.outletRatings.set(id, newRating);
    return newRating;
  }
  
  // =============== ACHIEVEMENTS ===============
  async getAchievements(): Promise<Achievement[]> {
    return Array.from(this.achievements.values());
  }
  
  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const id = this.achievementIdCounter++;
    const newAchievement: Achievement = {
      ...achievement,
      id
    };
    
    this.achievements.set(id, newAchievement);
    return newAchievement;
  }
  
  private async seedAchievements(): Promise<void> {
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
  
  // =============== USER ACHIEVEMENTS ===============
  async getUserAchievementsByUserId(userId: number): Promise<(UserAchievement & { achievement: Achievement })[]> {
    const userAchievements = Array.from(this.userAchievements.values())
      .filter(ua => ua.userId === userId);
    
    // Add the achievement details to each user achievement
    return userAchievements.map(ua => {
      const achievement = this.achievements.get(ua.achievementId);
      return {
        ...ua,
        achievement: achievement!
      };
    });
  }
  
  async createUserAchievement(userAchievement: InsertUserAchievement): Promise<UserAchievement> {
    const id = this.userAchievementIdCounter++;
    const newUserAchievement: UserAchievement = {
      ...userAchievement,
      id,
      completedAt: userAchievement.completed ? new Date() : null
    };
    
    this.userAchievements.set(id, newUserAchievement);
    return newUserAchievement;
  }
}

export const storage = new MemStorage();
