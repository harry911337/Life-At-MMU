import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertCatPostSchema, CatPost, CampusCat } from "@shared/schema";
import { Heart, MessageSquare, Camera, Image } from "lucide-react";
import { format } from "date-fns";

const postSchema = insertCatPostSchema.extend({
  content: z.string().min(2, "Content must be at least 2 characters"),
  imageUrl: z.string().url("Please enter a valid URL").optional(),
  catId: z.number().optional(),
});

export default function DailyFeedPage() {
  const { user } = useAuth();
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Latest");
  const [isAddPostOpen, setIsAddPostOpen] = useState(false);

  const toggleSidebar = () => {
    setMobileSidebarOpen(!isMobileSidebarOpen);
  };

  // Fetch cat posts
  const { data: posts, isLoading: postsLoading } = useQuery<CatPost[]>({
    queryKey: ["/api/cat-posts"],
  });

  // Fetch campus cats for the dropdown
  const { data: cats } = useQuery<CampusCat[]>({
    queryKey: ["/api/campus-cats"],
  });

  // Form for adding new post
  const form = useForm<z.infer<typeof postSchema>>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      content: "",
      imageUrl: "",
      catId: undefined,
    },
  });

  // Add post mutation
  const addPostMutation = useMutation({
    mutationFn: async (data: z.infer<typeof postSchema>) => {
      const res = await apiRequest("POST", "/api/cat-posts", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cat-posts"] });
      setIsAddPostOpen(false);
      form.reset();
    },
  });

  const onSubmit = (data: z.infer<typeof postSchema>) => {
    // If catId is an empty string, set it to undefined
    if (data.catId === 0) {
      data.catId = undefined;
    }
    
    addPostMutation.mutate(data);
  };

  // Filter and sort posts based on active tab
  const filteredPosts = posts
    ? posts.sort((a, b) => {
        if (activeTab === "Latest") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } else if (activeTab === "Popular") {
          return b.likes - a.likes;
        } else if (activeTab === "MyPosts" && user) {
          return a.userId === user.id ? -1 : 1;
        }
        return 0;
      })
    : [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header toggleSidebar={toggleSidebar} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          isMobileSidebarOpen={isMobileSidebarOpen} 
          setMobileSidebarOpen={setMobileSidebarOpen} 
        />
        
        <main className="flex-1 overflow-auto bg-neutral-50 p-4">
          <div className="space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-neutral-800">Daily Feed</h1>
                <p className="text-neutral-600">Share your moments with campus cats</p>
              </div>
              
              {user && (
                <Dialog open={isAddPostOpen} onOpenChange={setIsAddPostOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-orange-500 text-white hover:bg-orange-600">
                      <Camera className="mr-2 h-4 w-4" />
                      New Post
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                      <DialogTitle>Share Cat Moment</DialogTitle>
                      <DialogDescription>
                        Share your photo or experience with a campus cat.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="content"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Caption</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Share your cat encounter..." 
                                  className="min-h-[100px]"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="imageUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Image URL</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="https://example.com/cat-image.jpg" 
                                  {...field} 
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="catId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Which Cat? (optional)</FormLabel>
                              <Select 
                                onValueChange={(value) => field.onChange(parseInt(value))} 
                                value={field.value?.toString() || ""}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a cat (optional)" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="">None / Other</SelectItem>
                                  {cats?.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id.toString()}>
                                      {cat.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <DialogFooter className="pt-4">
                          <Button 
                            type="submit" 
                            className="w-full bg-orange-500 hover:bg-orange-600"
                            disabled={addPostMutation.isPending}
                          >
                            {addPostMutation.isPending ? "Posting..." : "Share Post"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            
            {/* Tabs */}
            <Tabs defaultValue="Latest" value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="Latest">Latest</TabsTrigger>
                <TabsTrigger value="Popular">Popular</TabsTrigger>
                {user && <TabsTrigger value="MyPosts">My Posts</TabsTrigger>}
              </TabsList>
            </Tabs>
            
            {/* Posts */}
            <div className="space-y-8">
              {postsLoading ? (
                <div className="text-center py-8">
                  <Camera className="h-12 w-12 mx-auto text-neutral-300 mb-4" />
                  <p className="text-neutral-500">Loading posts...</p>
                </div>
              ) : !filteredPosts || filteredPosts.length === 0 ? (
                <div className="text-center py-8">
                  <Camera className="h-12 w-12 mx-auto text-neutral-300 mb-4" />
                  <p className="text-neutral-500">No posts found</p>
                  {activeTab === "MyPosts" && (
                    <Button 
                      className="mt-4 bg-orange-500 hover:bg-orange-600"
                      onClick={() => setIsAddPostOpen(true)}
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      Create Your First Post
                    </Button>
                  )}
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <div key={post.id} className="border border-neutral-200 rounded-lg overflow-hidden bg-white">
                    <div className="p-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-neutral-300 flex items-center justify-center text-neutral-500">
                          <Camera className="h-5 w-5" />
                        </div>
                        <div className="ml-3">
                          <h3 className="font-medium">User ID: {post.userId}</h3>
                          <p className="text-neutral-500 text-sm">
                            Posted {format(new Date(post.createdAt), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                      <p className="mt-3">{post.content}</p>
                    </div>
                    
                    {post.imageUrl && (
                      <div className="bg-neutral-200 h-64 flex items-center justify-center">
                        <img 
                          src={post.imageUrl} 
                          alt="Cat" 
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    )}
                    
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-4">
                          <button className="flex items-center text-neutral-600 hover:text-orange-500">
                            <Heart className="mr-1 h-4 w-4" />
                            <span>{post.likes} Likes</span>
                          </button>
                          <button className="flex items-center text-neutral-600 hover:text-primary">
                            <MessageSquare className="mr-1 h-4 w-4" />
                            <span>Comments</span>
                          </button>
                        </div>
                        
                        {post.catId && cats && (
                          <div>
                            <span className="text-xs bg-blue-100 text-primary px-2 py-1 rounded-full">
                              {cats.find(cat => cat.id === post.catId)?.name || `Cat #${post.catId}`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
