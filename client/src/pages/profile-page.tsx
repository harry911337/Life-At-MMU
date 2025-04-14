import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { ShieldAlert } from "lucide-react";

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password confirmation is required"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function ProfilePage() {
  const { user } = useAuth();
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const toggleSidebar = () => {
    setMobileSidebarOpen(!isMobileSidebarOpen);
  };

  // Profile edit form
  const profileForm = useForm({
    defaultValues: {
      name: user?.name || "",
      studentId: user?.studentId || "",
    },
  });

  // Password change form
  const passwordForm = useForm<z.infer<typeof passwordChangeSchema>>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Mock password change mutation (not implemented on backend)
  const changePasswordMutation = useMutation({
    mutationFn: async (data: z.infer<typeof passwordChangeSchema>) => {
      // This would be a real API call in a full implementation
      return { success: true };
    },
    onSuccess: () => {
      setIsChangePasswordOpen(false);
      passwordForm.reset();
    },
  });

  const onPasswordSubmit = (data: z.infer<typeof passwordChangeSchema>) => {
    changePasswordMutation.mutate(data);
  };

  // Format join date
  const formattedJoinDate = user?.joinDate 
    ? format(new Date(user.joinDate), 'MMMM d, yyyy')
    : "Unknown";

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase();
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
              <h1 className="text-2xl font-bold text-neutral-800">My Profile</h1>
              <Button 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary hover:text-white"
                onClick={() => setIsEditProfileOpen(true)}
              >
                Edit Profile
              </Button>
            </div>
            
            {/* Profile Card */}
            <Card className="overflow-hidden">
              <div className="bg-primary p-8 text-center relative">
                <div className="h-24 w-24 rounded-full bg-white text-primary mx-auto flex items-center justify-center text-4xl font-bold mb-3">
                  <span>{user ? getInitials(user.name) : "?"}</span>
                </div>
                <h2 className="text-xl font-bold text-white">{user?.name}</h2>
                <p className="text-blue-100">{user?.studentId}</p>
              </div>
              
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Account Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-neutral-200 rounded-md p-3">
                      <p className="text-sm text-neutral-500">Username</p>
                      <p className="font-medium">{user?.username}</p>
                    </div>
                    <div className="border border-neutral-200 rounded-md p-3">
                      <p className="text-sm text-neutral-500">Member Since</p>
                      <p className="font-medium">{formattedJoinDate}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3">Security</h3>
                  <div className="border border-neutral-200 rounded-md p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Password</p>
                        <p className="text-sm text-neutral-500">Last changed: Unknown</p>
                      </div>
                      <Button 
                        variant="outline"
                        className="border-primary text-primary hover:bg-primary hover:text-white"
                        onClick={() => setIsChangePasswordOpen(true)}
                      >
                        Change Password
                      </Button>
                    </div>
                  </div>
                </div>
                
                {user?.isAdmin && (
                  <div>
                    <h3 className="text-lg font-medium mb-3">Admin Settings</h3>
                    <div className="border border-red-200 rounded-md p-4 bg-red-50">
                      <div className="flex items-center">
                        <ShieldAlert className="text-red-500 mr-3 h-6 w-6" />
                        <div>
                          <p className="font-medium text-red-500">Administrator Account</p>
                          <p className="text-sm text-neutral-700">You have full access to moderate content and manage users</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Edit Profile Dialog */}
            <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                  <DialogDescription>
                    Update your personal information
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...profileForm}>
                  <form className="space-y-4">
                    <FormField
                      control={profileForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="studentId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Student ID</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter className="pt-4">
                      <Button type="submit" className="w-full">
                        Save Changes
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            
            {/* Change Password Dialog */}
            <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                  <DialogDescription>
                    Update your account password
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormDescription>
                            Password must be at least 6 characters
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter className="pt-4">
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={changePasswordMutation.isPending}
                      >
                        {changePasswordMutation.isPending ? "Updating..." : "Update Password"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </div>
  );
}
