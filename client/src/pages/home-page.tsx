import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Coffee, Users, PawPrint, Camera, Utensils } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setMobileSidebarOpen(!isMobileSidebarOpen);
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
            {/* Hero Section */}
            <div className="bg-primary rounded-lg p-6 text-white">
              <h1 className="text-3xl font-bold mb-2">Welcome to Life at MMU</h1>
              <p className="text-blue-100">Your go-to platform for everything about campus life and community at Multimedia University.</p>
            </div>
            
            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Community Forum Card */}
              <Card>
                <CardHeader className="bg-primary/10 pb-2">
                  <CardTitle className="text-primary">Community Forum</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  <Link href="/learning-port">
                    <a className="block p-3 rounded-md hover:bg-neutral-50 border border-neutral-200">
                      <div className="flex items-center">
                        <GraduationCap className="text-primary mr-3 h-5 w-5" />
                        <div>
                          <h3 className="font-medium">Learning Port</h3>
                          <p className="text-sm text-neutral-600">Share study materials and academic resources</p>
                        </div>
                      </div>
                    </a>
                  </Link>
                  
                  <Link href="/cafe-talk">
                    <a className="block p-3 rounded-md hover:bg-neutral-50 border border-neutral-200">
                      <div className="flex items-center">
                        <Coffee className="text-orange-500 mr-3 h-5 w-5" />
                        <div>
                          <h3 className="font-medium">Cafe Talk</h3>
                          <p className="text-sm text-neutral-600">Casual conversations about anything</p>
                        </div>
                      </div>
                    </a>
                  </Link>
                  
                  <Link href="/workshop">
                    <a className="block p-3 rounded-md hover:bg-neutral-50 border border-neutral-200">
                      <div className="flex items-center">
                        <Users className="text-primary mr-3 h-5 w-5" />
                        <div>
                          <h3 className="font-medium">Workshop</h3>
                          <p className="text-sm text-neutral-600">Collaborate with your group mates</p>
                        </div>
                      </div>
                    </a>
                  </Link>
                </CardContent>
              </Card>
              
              {/* Campus Cats Hub Card */}
              <Card>
                <CardHeader className="bg-orange-500/10 pb-2">
                  <CardTitle className="text-orange-500">Campus Cats Hub</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  <Link href="/paw-index">
                    <a className="block p-3 rounded-md hover:bg-neutral-50 border border-neutral-200">
                      <div className="flex items-center">
                        <PawPrint className="text-orange-500 mr-3 h-5 w-5" />
                        <div>
                          <h3 className="font-medium">PawPrint Index</h3>
                          <p className="text-sm text-neutral-600">Catalog of all campus cats</p>
                        </div>
                      </div>
                    </a>
                  </Link>
                  
                  <Link href="/daily-feed">
                    <a className="block p-3 rounded-md hover:bg-neutral-50 border border-neutral-200">
                      <div className="flex items-center">
                        <Camera className="text-orange-500 mr-3 h-5 w-5" />
                        <div>
                          <h3 className="font-medium">Daily Feed</h3>
                          <p className="text-sm text-neutral-600">Share your cat encounters</p>
                        </div>
                      </div>
                    </a>
                  </Link>
                </CardContent>
              </Card>
              
              {/* Canteen Updates Card */}
              <Card>
                <CardHeader className="bg-red-500/10 pb-2">
                  <CardTitle className="text-red-500">Canteen Updates</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <Link href="/canteen-updates">
                    <a className="block p-3 rounded-md hover:bg-neutral-50 border border-neutral-200">
                      <div className="flex items-center">
                        <Utensils className="text-red-500 mr-3 h-5 w-5" />
                        <div>
                          <h3 className="font-medium">Food Outlets</h3>
                          <p className="text-sm text-neutral-600">Explore and rate campus food options</p>
                        </div>
                      </div>
                    </a>
                  </Link>
                </CardContent>
              </Card>
            </div>
            
            {/* Latest Updates Section */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-neutral-800 mb-4">Latest Updates</h2>
                <div className="space-y-4">
                  <div className="border-l-4 border-primary pl-4 py-1">
                    <h3 className="font-medium">Final Exams Schedule Posted</h3>
                    <p className="text-sm text-neutral-600">Check the Learning Port for the latest exam schedules and resources.</p>
                    <p className="text-xs text-neutral-500 mt-1">2 hours ago</p>
                  </div>
                  <div className="border-l-4 border-orange-500 pl-4 py-1">
                    <h3 className="font-medium">New Cat Spotted on Campus!</h3>
                    <p className="text-sm text-neutral-600">A new calico cat has been seen near the library. Check the PawPrint Index for details.</p>
                    <p className="text-xs text-neutral-500 mt-1">Yesterday</p>
                  </div>
                  <div className="border-l-4 border-red-500 pl-4 py-1">
                    <h3 className="font-medium">New Food Stall Opening</h3>
                    <p className="text-sm text-neutral-600">A new bubble tea stall is opening next week in the main canteen.</p>
                    <p className="text-xs text-neutral-500 mt-1">3 days ago</p>
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
