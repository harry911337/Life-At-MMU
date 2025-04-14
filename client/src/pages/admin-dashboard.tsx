import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Redirect } from "wouter";
import { 
  Users, 
  Flag, 
  Award, 
  ShieldAlert, 
  TrendingUp, 
  AlertTriangle, 
  UserPlus, 
  MoreHorizontal 
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setMobileSidebarOpen(!isMobileSidebarOpen);
  };

  // Check if user is admin, if not redirect
  if (!user?.isAdmin) {
    return <Redirect to="/" />;
  }

  // Mock data for recent activity
  const recentActivity = [
    {
      id: 1,
      action: "New Post",
      user: "Sarah Lee",
      content: "Programming Fundamentals Final Exam Notes",
      date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      id: 2,
      action: "Reported",
      user: "Ahmad Zaki",
      content: "Comment on \"Best study spots on campus?\"",
      date: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    },
    {
      id: 3,
      action: "New User",
      user: "Michelle Tan",
      content: "Account registration",
      date: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    },
  ];

  // Get badge color based on action
  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case "New Post":
        return "bg-yellow-100 text-yellow-800";
      case "Reported":
        return "bg-red-100 text-red-800";
      case "New User":
        return "bg-green-100 text-green-800";
      default:
        return "bg-neutral-100 text-neutral-700";
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
            <div>
              <h1 className="text-2xl font-bold text-neutral-800">Admin Dashboard</h1>
              <p className="text-neutral-600">Manage the MMU Campus Life platform</p>
            </div>
            
            {/* Admin Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl">
                      <Users className="h-6 w-6" />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-medium">User Management</h3>
                      <p className="text-sm text-neutral-600">Manage user accounts</p>
                    </div>
                  </div>
                  <Button className="w-full mt-2 bg-primary text-white">
                    View Users
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center text-xl">
                      <Flag className="h-6 w-6" />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-medium">Content Moderation</h3>
                      <p className="text-sm text-neutral-600">Review reported content</p>
                    </div>
                  </div>
                  <Button className="w-full mt-2 bg-orange-500 text-white hover:bg-orange-600">
                    View Reports
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xl">
                      <Award className="h-6 w-6" />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-medium">Achievement Management</h3>
                      <p className="text-sm text-neutral-600">Configure achievements</p>
                    </div>
                  </div>
                  <Button className="w-full mt-2 bg-green-600 text-white hover:bg-green-700">
                    Manage Achievements
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 flex items-center">
                  <div className="h-10 w-10 rounded bg-blue-100 text-primary flex items-center justify-center mr-3">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Total Users</p>
                    <h3 className="text-xl font-bold">128</h3>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 flex items-center">
                  <div className="h-10 w-10 rounded bg-green-100 text-green-600 flex items-center justify-center mr-3">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Posts Today</p>
                    <h3 className="text-xl font-bold">24</h3>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 flex items-center">
                  <div className="h-10 w-10 rounded bg-orange-100 text-orange-500 flex items-center justify-center mr-3">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Reports</p>
                    <h3 className="text-xl font-bold">5</h3>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 flex items-center">
                  <div className="h-10 w-10 rounded bg-purple-100 text-purple-600 flex items-center justify-center mr-3">
                    <UserPlus className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">New Users</p>
                    <h3 className="text-xl font-bold">12</h3>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Recent Activity */}
            <Card className="overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentActivity.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell>
                          <Badge className={`${getActionBadgeColor(activity.action)} font-normal`}>
                            {activity.action}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{activity.user}</TableCell>
                        <TableCell className="max-w-xs truncate">{activity.content}</TableCell>
                        <TableCell className="text-neutral-500">
                          {format(activity.date, 'MMM dd, hh:mm a')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
