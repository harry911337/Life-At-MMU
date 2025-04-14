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
import { insertLearningMaterialSchema, LearningMaterial } from "@shared/schema";
import { Download, FileText, GraduationCap, FileArchive, BookOpen, User, Clock, Download as DownloadIcon, Shield } from "lucide-react";
import { format } from "date-fns";

const materialSchema = insertLearningMaterialSchema.extend({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  materialType: z.enum(["Notes", "Past Papers", "Tutorials"]),
  contentUrl: z.string().url("Please enter a valid URL").optional(),
});

export default function LearningPortPage() {
  const { user } = useAuth();
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("All");
  const [isAddMaterialOpen, setIsAddMaterialOpen] = useState(false);

  const toggleSidebar = () => {
    setMobileSidebarOpen(!isMobileSidebarOpen);
  };

  // Fetch learning materials
  const { data: materials, isLoading } = useQuery<LearningMaterial[]>({
    queryKey: ["/api/learning-materials"],
  });

  // Form for adding new material
  const form = useForm<z.infer<typeof materialSchema>>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      title: "",
      description: "",
      materialType: "Notes",
      contentUrl: "",
    },
  });

  // Add material mutation
  const addMaterialMutation = useMutation({
    mutationFn: async (data: z.infer<typeof materialSchema>) => {
      const res = await apiRequest("POST", "/api/learning-materials", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/learning-materials"] });
      setIsAddMaterialOpen(false);
      form.reset();
    },
  });

  const onSubmit = (data: z.infer<typeof materialSchema>) => {
    addMaterialMutation.mutate(data);
  };

  // Filter materials based on active tab
  const filteredMaterials = materials
    ? activeTab === "All"
      ? materials
      : materials.filter((material) => material.materialType === activeTab)
    : [];

  // Get the badge style based on material type
  const getBadgeStyle = (type: string) => {
    switch (type) {
      case "Notes":
        return "bg-blue-100 text-primary";
      case "Past Papers":
        return "bg-green-100 text-green-700";
      case "Tutorials":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-neutral-100 text-neutral-700";
    }
  };

  // Get the icon based on material type
  const getMaterialIcon = (type: string) => {
    switch (type) {
      case "Notes":
        return <FileText className="mr-1 h-4 w-4" />;
      case "Past Papers":
        return <FileArchive className="mr-1 h-4 w-4" />;
      case "Tutorials":
        return <BookOpen className="mr-1 h-4 w-4" />;
      default:
        return <FileText className="mr-1 h-4 w-4" />;
    }
  };

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
                <h1 className="text-2xl font-bold text-neutral-800">Learning Port</h1>
                <p className="text-neutral-600">Share and access study materials, notes, and resources</p>
              </div>
              
              {user && (
                <Dialog open={isAddMaterialOpen} onOpenChange={setIsAddMaterialOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary text-white">
                      <FileText className="mr-2 h-4 w-4" />
                      New Post
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                      <DialogTitle>Share Learning Material</DialogTitle>
                      <DialogDescription>
                        Share your notes, past papers, and tutorials with other students.
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
                                <Input placeholder="E.g. Programming Fundamentals Notes" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Describe your material..." 
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
                          name="materialType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Material Type</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select material type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Notes">Notes</SelectItem>
                                  <SelectItem value="Past Papers">Past Papers</SelectItem>
                                  <SelectItem value="Tutorials">Tutorials</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="contentUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Content URL (optional)</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="https://drive.google.com/file/..." 
                                  {...field} 
                                  value={field.value || ""}
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
                            disabled={addMaterialMutation.isPending}
                          >
                            {addMaterialMutation.isPending ? "Posting..." : "Post Material"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            
            {/* Filter Tabs */}
            <Tabs defaultValue="All" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="flex bg-white border border-neutral-200 rounded-lg p-1 mb-4 w-full max-w-xl">
                <TabsTrigger value="All" className="flex-1">All Materials</TabsTrigger>
                <TabsTrigger value="Notes" className="flex-1">Notes</TabsTrigger>
                <TabsTrigger value="Past Papers" className="flex-1">Past Papers</TabsTrigger>
                <TabsTrigger value="Tutorials" className="flex-1">Tutorials</TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className="mt-0">
                {isLoading ? (
                  <div className="text-center py-8">
                    <GraduationCap className="h-12 w-12 mx-auto text-neutral-300 mb-4" />
                    <p className="text-neutral-500">Loading materials...</p>
                  </div>
                ) : filteredMaterials.length === 0 ? (
                  <div className="text-center py-8">
                    <GraduationCap className="h-12 w-12 mx-auto text-neutral-300 mb-4" />
                    <p className="text-neutral-500">No materials found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredMaterials.map((material) => (
                      <div key={material.id} className="border border-neutral-200 rounded-md p-4 bg-white">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-lg">{material.title}</h3>
                            <p className="text-neutral-600 text-sm mt-1">{material.description}</p>
                          </div>
                          <span className={`${getBadgeStyle(material.materialType)} text-xs px-2 py-1 rounded-full`}>
                            {material.materialType}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-sm text-neutral-500 mt-3">
                          <span className="flex items-center mr-4">
                            <User className="mr-1 h-4 w-4" />
                            <span>User ID: {material.userId}</span>
                          </span>
                          <span className="flex items-center mr-4">
                            <Clock className="mr-1 h-4 w-4" />
                            <span>Posted {format(new Date(material.createdAt), 'MMM dd, yyyy')}</span>
                          </span>
                          <span className="flex items-center">
                            <Download className="mr-1 h-4 w-4" />
                            <span>{material.downloads} downloads</span>
                          </span>
                        </div>
                        
                        {material.contentUrl && (
                          <div className="mt-3 flex">
                            <a 
                              href={material.contentUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline text-sm flex items-center"
                            >
                              <DownloadIcon className="mr-1 h-4 w-4" />
                              Download
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
