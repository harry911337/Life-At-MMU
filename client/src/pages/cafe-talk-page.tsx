import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertForumPostSchema, ForumPost } from "@shared/schema";
import { ThumbsUp, MessageCircle, Eye, Search, Coffee, User, Clock } from "lucide-react";
import { format } from "date-fns";

const postSchema = insertForumPostSchema.extend({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  category: z.literal("CafeTalk"),
});

export default function CafeTalkPage() {
  const { user } = useAuth();
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Latest");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddPostOpen, setIsAddPostOpen] = useState(false);

  const toggleSidebar = () => {
    setMobileSidebarOpen(!isMobileSidebarOpen);
  };

  // Fetch forum posts
  const { data: posts, isLoading } = useQuery<ForumPost[]>({
    queryKey: ["/api/forum-posts", { category: "CafeTalk" }],
  });

  // Form for adding new post
  const form = useForm<z.infer<typeof postSchema>>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "CafeTalk",
    },
  });

  // Add post mutation
  const addPostMutation = useMutation({
    mutationFn: async (data: z.infer<typeof postSchema>) => {
      const res = await apiRequest("POST", "/api/forum-posts", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum-posts"] });
      setIsAddPostOpen(false);
      form.reset();
    },
  });

  const onSubmit = (data: z.infer<typeof postSchema>) => {
    addPostMutation.mutate(data);
  };

  // Filter and sort posts based on active tab and search query
  const filteredPosts = posts
    ? posts
        .filter(
          (post) =>
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.content.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
          if (activeTab === "Latest") {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          } else if (activeTab === "Trending") {
            return b.views - a.views;
          } else if (activeTab === "MyPosts" && user) {
            return post.userId === user.id ? -1 : 1;
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
                <h1 className="text-2xl font-bold text-neutral-800">Cafe Talk</h1>
                <p className="text-neutral-600">Open discussions on any topic</p>
              </div>
              
              {user && (
                <Dialog open={isAddPostOpen} onOpenChange={setIsAddPostOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary text-white">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      New Discussion
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                      <DialogTitle>Start a New Discussion</DialogTitle>
                      <DialogDescription>
                        Share your thoughts, ask questions, or start a conversation.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title</FormLabel>
                              <FormControl>
                                <Input placeholder="E.g. Best study spots on campus?" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="content"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Content</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Share your thoughts..." 
                                  className="min-h-[150px]"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <DialogFooter className="pt-4">
                          <Button 
                            type="submit" 
                            className="w-full"
                            disabled={addPostMutation.isPending}
                          >
                            {addPostMutation.isPending ? "Posting..." : "Post Discussion"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            
            {/* Filter and Search */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <Tabs defaultValue="Latest" value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="Latest">Latest</TabsTrigger>
                  <TabsTrigger value="Trending">Trending</TabsTrigger>
                  {user && <TabsTrigger value="MyPosts">My Posts</TabsTrigger>}
                </TabsList>
              </Tabs>
              
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
                <Input 
                  placeholder="Search discussions..." 
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            {/* Posts List */}
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <Coffee className="h-12 w-12 mx-auto text-neutral-300 mb-4" />
                  <p className="text-neutral-500">Loading discussions...</p>
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="text-center py-8">
                  <Coffee className="h-12 w-12 mx-auto text-neutral-300 mb-4" />
                  <p className="text-neutral-500">No discussions found</p>
                  {searchQuery && (
                    <p className="text-sm text-neutral-400 mt-2">
                      Try a different search term or clear the search
                    </p>
                  )}
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <div key={post.id} className="border border-neutral-200 rounded-md p-4 bg-white">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-lg">{post.title}</h3>
                      {post.views > 50 && (
                        <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full">
                          Hot Topic
                        </span>
                      )}
                    </div>
                    
                    <p className="text-neutral-600 mt-2">{post.content}</p>
                    
                    <div className="flex items-center text-sm text-neutral-500 mt-3 flex-wrap gap-y-2">
                      <span className="flex items-center mr-4">
                        <User className="mr-1 h-4 w-4" />
                        <span>User ID: {post.userId}</span>
                      </span>
                      <span className="flex items-center mr-4">
                        <Clock className="mr-1 h-4 w-4" />
                        <span>Posted {format(new Date(post.createdAt), 'MMM dd, yyyy')}</span>
                      </span>
                      <span className="flex items-center mr-4">
                        <MessageCircle className="mr-1 h-4 w-4" />
                        <span>0 replies</span>
                      </span>
                      <span className="flex items-center">
                        <Eye className="mr-1 h-4 w-4" />
                        <span>{post.views} views</span>
                      </span>
                    </div>
                    
                    <div className="mt-3 flex">
                      <button className="text-primary hover:underline text-sm mr-4 flex items-center">
                        <ThumbsUp className="mr-1 h-4 w-4" />
                        Like ({post.likes})
                      </button>
                      <button className="text-primary hover:underline text-sm flex items-center">
                        <MessageCircle className="mr-1 h-4 w-4" />
                        Reply
                      </button>
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
