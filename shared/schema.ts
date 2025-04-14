import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  studentId: text("studentId").notNull(),
  isAdmin: boolean("isAdmin").default(false).notNull(),
  joinDate: timestamp("joinDate").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  studentId: true,
});

// Learning Materials
export const learningMaterials = pgTable("learningMaterials", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  contentUrl: text("contentUrl"),
  materialType: text("materialType").notNull(), // Notes, Past Papers, Tutorials
  userId: integer("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  downloads: integer("downloads").default(0).notNull(),
});

export const insertLearningMaterialSchema = createInsertSchema(learningMaterials).pick({
  title: true,
  description: true,
  contentUrl: true,
  materialType: true,
  userId: true,
});

// Forum Posts
export const forumPosts = pgTable("forumPosts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  userId: integer("userId").notNull(),
  category: text("category").notNull(), // CafeTalk, Workshop
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  views: integer("views").default(0).notNull(),
  likes: integer("likes").default(0).notNull(),
});

export const insertForumPostSchema = createInsertSchema(forumPosts).pick({
  title: true,
  content: true,
  userId: true,
  category: true,
});

// Comments
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  userId: integer("userId").notNull(),
  postId: integer("postId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const insertCommentSchema = createInsertSchema(comments).pick({
  content: true,
  userId: true,
  postId: true,
});

// Workshop Groups
export const workshopGroups = pgTable("workshopGroups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const insertWorkshopGroupSchema = createInsertSchema(workshopGroups).pick({
  name: true,
  description: true,
  createdBy: true,
});

// Group Members
export const groupMembers = pgTable("groupMembers", {
  id: serial("id").primaryKey(),
  groupId: integer("groupId").notNull(),
  userId: integer("userId").notNull(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
});

export const insertGroupMemberSchema = createInsertSchema(groupMembers).pick({
  groupId: true,
  userId: true,
});

// Group Tasks
export const groupTasks = pgTable("groupTasks", {
  id: serial("id").primaryKey(),
  groupId: integer("groupId").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  assignedTo: integer("assignedTo"),
  completed: boolean("completed").default(false).notNull(),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const insertGroupTaskSchema = createInsertSchema(groupTasks).pick({
  groupId: true,
  title: true,
  description: true,
  assignedTo: true,
  createdBy: true,
});

// Campus Cats
export const campusCats = pgTable("campusCats", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(), // Library, Canteen, Hostels, etc.
  imageUrl: text("imageUrl"),
  addedBy: integer("addedBy").notNull(),
  addedAt: timestamp("addedAt").defaultNow().notNull(),
  lastSeen: timestamp("lastSeen").defaultNow().notNull(),
  traits: text("traits").array().notNull(),
});

export const insertCampusCatSchema = createInsertSchema(campusCats).pick({
  name: true,
  description: true,
  location: true,
  imageUrl: true,
  addedBy: true,
  traits: true,
});

// Cat Photos
export const catPosts = pgTable("catPosts", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  imageUrl: text("imageUrl"),
  userId: integer("userId").notNull(),
  catId: integer("catId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  likes: integer("likes").default(0).notNull(),
});

export const insertCatPostSchema = createInsertSchema(catPosts).pick({
  content: true,
  imageUrl: true,
  userId: true,
  catId: true,
});

// Canteen Outlets
export const canteenOutlets = pgTable("canteenOutlets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  categories: text("categories").array().notNull(), // Array of categories like Asian, Western, etc.
  priceRange: text("priceRange").notNull(),
  openingHours: text("openingHours").notNull(),
  addedBy: integer("addedBy").notNull(),
  addedAt: timestamp("addedAt").defaultNow().notNull(),
  isOpen: boolean("isOpen").default(true).notNull(),
});

export const insertCanteenOutletSchema = createInsertSchema(canteenOutlets).pick({
  name: true,
  description: true,
  location: true,
  categories: true,
  priceRange: true,
  openingHours: true,
  addedBy: true,
  isOpen: true,
});

// Outlet Ratings
export const outletRatings = pgTable("outletRatings", {
  id: serial("id").primaryKey(),
  outletId: integer("outletId").notNull(),
  userId: integer("userId").notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const insertOutletRatingSchema = createInsertSchema(outletRatings).pick({
  outletId: true,
  userId: true,
  rating: true,
  comment: true,
});

// Achievements
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(), // FontAwesome icon name
  category: text("category").notNull(), // Forum, Cat, Food, etc.
});

export const insertAchievementSchema = createInsertSchema(achievements).pick({
  name: true,
  description: true,
  icon: true,
  category: true,
});

// User Achievements
export const userAchievements = pgTable("userAchievements", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  achievementId: integer("achievementId").notNull(),
  progress: integer("progress").default(0).notNull(),
  completed: boolean("completed").default(false).notNull(),
  completedAt: timestamp("completedAt"),
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).pick({
  userId: true,
  achievementId: true,
  progress: true,
  completed: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type LearningMaterial = typeof learningMaterials.$inferSelect;
export type InsertLearningMaterial = z.infer<typeof insertLearningMaterialSchema>;

export type ForumPost = typeof forumPosts.$inferSelect;
export type InsertForumPost = z.infer<typeof insertForumPostSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type WorkshopGroup = typeof workshopGroups.$inferSelect;
export type InsertWorkshopGroup = z.infer<typeof insertWorkshopGroupSchema>;

export type GroupMember = typeof groupMembers.$inferSelect;
export type InsertGroupMember = z.infer<typeof insertGroupMemberSchema>;

export type GroupTask = typeof groupTasks.$inferSelect;
export type InsertGroupTask = z.infer<typeof insertGroupTaskSchema>;

export type CampusCat = typeof campusCats.$inferSelect;
export type InsertCampusCat = z.infer<typeof insertCampusCatSchema>;

export type CatPost = typeof catPosts.$inferSelect;
export type InsertCatPost = z.infer<typeof insertCatPostSchema>;

export type CanteenOutlet = typeof canteenOutlets.$inferSelect;
export type InsertCanteenOutlet = z.infer<typeof insertCanteenOutletSchema>;

export type OutletRating = typeof outletRatings.$inferSelect;
export type InsertOutletRating = z.infer<typeof insertOutletRatingSchema>;

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
