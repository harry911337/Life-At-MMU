import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertWorkshopGroupSchema, WorkshopGroup } from "@shared/schema";
import { Check, Clipboard, ListChecks, Users, VoteIcon, Shuffle, PinIcon, Calendar } from "lucide-react";
import { format } from "date-fns";

const groupSchema = insertWorkshopGroupSchema.extend({
  name: z.string().min(3, "Group name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

export default function WorkshopPage() {
  const { user } = useAuth();
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);

  const toggleSidebar = () => {
    setMobileSidebarOpen(!isMobileSidebarOpen);
  };

  // Fetch workshop groups
  const { data: groups, isLoading } = useQuery<WorkshopGroup[]>({
    queryKey: ["/api/workshop-groups"],
    enabled: !!user,
  });

  // Form for creating a new group
  const form = useForm<z.infer<typeof groupSchema>>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Create group mutation
  const createGroupMutation = useMutation({
    mutationFn: async (data: z.infer<typeof groupSchema>) => {
      const res = await apiRequest("POST", "/api/workshop-groups", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workshop-groups"] });
      setIsAddGroupOpen(false);
      form.reset();
    },
  });

  const onSubmit = (data: z.infer<typeof groupSchema>) => {
    createGroupMutation.mutate(data);
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
                <h1 className="text-2xl font-bold text-neutral-800">Workshop</h1>
                <p className="text-neutral-600">Create and manage group projects</p>
              </div>
              
              {user && (
                <Dialog open={isAddGroupOpen} onOpenChange={setIsAddGroupOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary text-white">
                      <Users className="mr-2 h-4 w-4" />
                      New Group
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                      <DialogTitle>Create a New Group</DialogTitle>
                      <DialogDescription>
                        Create a workspace for your team to collaborate on projects.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Group Name</FormLabel>
                              <FormControl>
                                <Input placeholder="E.g. Final Project Team" {...field} />
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
                                  placeholder="Describe your group purpose and goals..." 
                                  className="min-h-[100px]"
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
                            disabled={createGroupMutation.isPending}
                          >
                            {createGroupMutation.isPending ? "Creating..." : "Create Group"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            
            {/* Your Groups */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Your Groups</CardTitle>
              </CardHeader>
              
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-neutral-300 mb-4" />
                    <p className="text-neutral-500">Loading your groups...</p>
                  </div>
                ) : !groups || groups.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-neutral-300 mb-4" />
                    <h3 className="font-medium text-lg text-neutral-700">No groups yet</h3>
                    <p className="text-neutral-500 mt-1">Create a new group or join an existing one</p>
                    <Button 
                      className="mt-4 bg-primary text-white"
                      onClick={() => setIsAddGroupOpen(true)}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Create New Group
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {groups.map((group) => (
                      <div key={group.id} className="border border-neutral-200 rounded-lg overflow-hidden">
                        <div className="bg-primary/10 p-4">
                          <h3 className="font-medium">{group.name}</h3>
                          <p className="text-sm text-neutral-600">{group.description}</p>
                        </div>
                        <div className="p-4">
                          <div className="flex items-center text-sm text-neutral-500 mb-3">
                            <span className="flex items-center mr-4">
                              <Users className="mr-1 h-4 w-4" />
                              <span>Members</span>
                            </span>
                            <span className="flex items-center">
                              <Calendar className="mr-1 h-4 w-4" />
                              <span>Created {format(new Date(group.createdAt), 'MMM dd, yyyy')}</span>
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <Button className="bg-primary text-white">
                              Open Group
                            </Button>
                            <Button variant="outline">
                              Invite
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Group Workspace Preview */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Group Workspace Preview</CardTitle>
                <p className="text-sm text-neutral-500">Create a group to access these features</p>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border border-neutral-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <ListChecks className="text-primary mr-2 h-5 w-5" />
                      <h3 className="font-medium">To-Do List</h3>
                    </div>
                    <p className="text-sm text-neutral-600">Create and assign tasks for your team</p>
                  </div>
                  
                  <div className="border border-neutral-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <VoteIcon className="text-primary mr-2 h-5 w-5" />
                      <h3 className="font-medium">Group Polls</h3>
                    </div>
                    <p className="text-sm text-neutral-600">Make group decisions easily with voting</p>
                  </div>
                  
                  <div className="border border-neutral-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <Shuffle className="text-primary mr-2 h-5 w-5" />
                      <h3 className="font-medium">Random Wheel</h3>
                    </div>
                    <p className="text-sm text-neutral-600">Randomly select items or assign tasks</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
