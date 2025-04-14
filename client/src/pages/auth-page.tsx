import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { insertUserSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { GraduationCap, Coffee, Users, PawPrint, Camera, Utensils, Eye } from "lucide-react";

// Login schema only needs username and password
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

// Full registration schema from shared schema with password confirmation
const registerSchema = insertUserSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, navigate] = useLocation();
  const [_, params] = useRoute("/auth");
  const urlParams = new URLSearchParams(window.location.search);
  const tabFromUrl = urlParams.get('tab');
  const [activeTab, setActiveTab] = useState<string>(tabFromUrl === 'register' ? 'register' : 'login');
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      studentId: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  // If the user is already logged in, redirect to home
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Handle login form submission
  function onLoginSubmit(data: z.infer<typeof loginSchema>) {
    loginMutation.mutate({
      username: data.username,
      password: data.password,
    });
  }

  // Handle register form submission
  function onRegisterSubmit(data: z.infer<typeof registerSchema>) {
    registerMutation.mutate({
      name: data.name,
      studentId: data.studentId,
      username: data.username,
      password: data.password,
    });
  }

  // Continue as guest
  function continueAsGuest() {
    navigate("/");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left column - Auth forms */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8 bg-white">
          <div className="w-full max-w-md">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <img 
                  src="/src/assets/mmu-logo.png" 
                  alt="MMU Logo" 
                  className="h-16"
                />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-700 bg-clip-text text-transparent">Life at MMU</h1>
              <p className="text-neutral-500 mt-1">Your campus community portal</p>
            </div>

            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Card>
                  <CardHeader>
                    <CardTitle>Login to Your Account</CardTitle>
                    <CardDescription>
                      Access the MMU community portal
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your username" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <div className="relative">
                                <FormControl>
                                  <Input 
                                    type={showLoginPassword ? "text" : "password"} 
                                    placeholder="Enter your password" 
                                    {...field} 
                                  />
                                </FormControl>
                                <button
                                  type="button"
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    setShowLoginPassword(true);
                                  }}
                                  onMouseUp={() => setShowLoginPassword(false)}
                                  onMouseLeave={() => setShowLoginPassword(false)}
                                  tabIndex={-1}
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={loginForm.control}
                          name="rememberMe"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">Remember me</FormLabel>
                            </FormItem>
                          )}
                        />
                        <Button 
                          type="submit" 
                          className="w-full btn-primary"
                          disabled={loginMutation.isPending}
                        >
                          {loginMutation.isPending ? "Logging in..." : "Log In"}
                        </Button>
                      </form>
                    </Form>
                    <div className="mt-4 text-center">
                      <span className="text-sm text-neutral-600">Don't have an account?</span>
                      <Button
                        variant="link"
                        className="text-sm text-primary p-0 ml-1"
                        onClick={() => setActiveTab("register")}
                      >
                        Register
                      </Button>
                    </div>
                    <div className="mt-2 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-sm text-neutral-600 hover:text-primary"
                        onClick={continueAsGuest}
                      >
                        Continue as Guest
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="register">
                <Card>
                  <CardHeader>
                    <CardTitle>Create New Account</CardTitle>
                    <CardDescription>
                      Join the MMU community
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                        <FormField
                          control={registerForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your full name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="studentId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Student ID</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. 242FT242G4" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input placeholder="Choose a username" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <div className="relative">
                                <FormControl>
                                  <Input 
                                    type={showRegisterPassword ? "text" : "password"} 
                                    placeholder="Create a password" 
                                    {...field} 
                                  />
                                </FormControl>
                                <button
                                  type="button"
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    setShowRegisterPassword(true);
                                  }}
                                  onMouseUp={() => setShowRegisterPassword(false)}
                                  onMouseLeave={() => setShowRegisterPassword(false)}
                                  tabIndex={-1}
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm Password</FormLabel>
                              <div className="relative">
                                <FormControl>
                                  <Input 
                                    type={showConfirmPassword ? "text" : "password"} 
                                    placeholder="Confirm your password" 
                                    {...field} 
                                  />
                                </FormControl>
                                <button
                                  type="button"
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    setShowConfirmPassword(true);
                                  }}
                                  onMouseUp={() => setShowConfirmPassword(false)}
                                  onMouseLeave={() => setShowConfirmPassword(false)}
                                  tabIndex={-1}
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button 
                          type="submit" 
                          className="w-full btn-primary"
                          disabled={registerMutation.isPending}
                        >
                          {registerMutation.isPending ? "Registering..." : "Register"}
                        </Button>
                      </form>
                    </Form>
                    <div className="mt-4 text-center">
                      <span className="text-sm text-neutral-600">Already have an account?</span>
                      <Button
                        variant="link"
                        className="text-sm text-primary p-0 ml-1"
                        onClick={() => setActiveTab("login")}
                      >
                        Log In
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Right column - Hero section */}
        <div className="w-full md:w-1/2 bg-primary flex items-center justify-center p-8 hidden md:flex">
          <div className="max-w-lg text-white">
            <h1 className="text-4xl font-bold mb-4">
              Welcome to Life at MMU
            </h1>
            <p className="text-blue-100 mb-8">
              Your all-in-one platform for campus life. Connect with peers, share resources, and explore everything MMU has to offer.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                <GraduationCap className="h-8 w-8 mb-2 text-white/90" />
                <h3 className="font-semibold text-lg">Learning Port</h3>
                <p className="text-blue-100 text-sm">Share study materials and academic resources</p>
              </div>
              
              <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                <Coffee className="h-8 w-8 mb-2 text-white/90" />
                <h3 className="font-semibold text-lg">Cafe Talk</h3>
                <p className="text-blue-100 text-sm">Engage in casual discussions about anything</p>
              </div>
              
              <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                <PawPrint className="h-8 w-8 mb-2 text-white/90" />
                <h3 className="font-semibold text-lg">Campus Cats</h3>
                <p className="text-blue-100 text-sm">Connect with our feline campus residents</p>
              </div>
              
              <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                <Utensils className="h-8 w-8 mb-2 text-white/90" />
                <h3 className="font-semibold text-lg">Canteen Updates</h3>
                <p className="text-blue-100 text-sm">Explore and rate campus food options</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
