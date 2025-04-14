import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Award, Star } from "lucide-react";
import { format } from "date-fns";

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: string;
}

interface UserAchievement {
  id: number;
  userId: number;
  achievementId: number;
  progress: number;
  completed: boolean;
  completedAt?: string;
  achievement: Achievement;
}

export default function AchievementsPage() {
  const { user } = useAuth();
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setMobileSidebarOpen(!isMobileSidebarOpen);
  };

  // Fetch user achievements
  const { data: userAchievements, isLoading } = useQuery<UserAchievement[]>({
    queryKey: ["/api/user-achievements"],
    enabled: !!user,
  });

  // Get icon component based on icon string
  const getIconComponent = (iconName: string, className: string) => {
    switch (iconName) {
      case "feather-alt":
        return <Trophy className={className} />;
      case "cat":
        return <Trophy className={className} />;
      case "utensils":
        return <Trophy className={className} />;
      case "graduation-cap":
        return <Trophy className={className} />;
      case "comments":
        return <Trophy className={className} />;
      case "camera":
        return <Trophy className={className} />;
      default:
        return <Trophy className={className} />;
    }
  };

  // Get color based on category
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Forum":
        return "bg-primary text-white";
      case "Cats":
        return "bg-orange-500 text-white";
      case "Food":
        return "bg-green-600 text-white";
      case "Learning":
        return "bg-purple-600 text-white";
      default:
        return "bg-neutral-600 text-white";
    }
  };

  // Separate completed and in-progress achievements
  const completedAchievements = userAchievements?.filter(ua => ua.completed) || [];
  const inProgressAchievements = userAchievements?.filter(ua => !ua.completed) || [];

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
            <h1 className="text-2xl font-bold text-neutral-800">My Achievements</h1>
            
            {isLoading ? (
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 mx-auto text-neutral-300 mb-4" />
                <p className="text-neutral-500">Loading achievements...</p>
              </div>
            ) : (
              <>
                {/* Unlocked Achievements */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center">
                      <Award className="mr-2 h-5 w-5 text-primary" />
                      Unlocked Achievements
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    {completedAchievements.length === 0 ? (
                      <div className="text-center py-6">
                        <Trophy className="h-10 w-10 mx-auto text-neutral-300 mb-3" />
                        <p className="text-neutral-600">No achievements unlocked yet</p>
                        <p className="text-sm text-neutral-500 mt-1">Keep participating to earn achievements!</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {completedAchievements.map((userAchievement) => (
                          <div key={userAchievement.id} className="border border-neutral-200 rounded-lg p-4 bg-neutral-50">
                            <div className="flex items-center mb-3">
                              <div className={`h-12 w-12 rounded-full ${getCategoryColor(userAchievement.achievement.category)} flex items-center justify-center text-xl`}>
                                {getIconComponent(userAchievement.achievement.icon, "h-6 w-6")}
                              </div>
                              <div className="ml-3">
                                <h3 className="font-medium">{userAchievement.achievement.name}</h3>
                                <p className="text-sm text-neutral-600">{userAchievement.achievement.description}</p>
                              </div>
                            </div>
                            <div className="mt-2 text-right">
                              <span className="text-xs text-neutral-500">
                                {userAchievement.completedAt 
                                  ? `Unlocked on ${format(new Date(userAchievement.completedAt), 'MMM dd, yyyy')}` 
                                  : 'Unlocked'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Achievements in Progress */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center">
                      <Star className="mr-2 h-5 w-5 text-primary" />
                      Achievements in Progress
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {inProgressAchievements.map((userAchievement) => {
                        const achievement = userAchievement.achievement;
                        const progressPercent = Math.round((userAchievement.progress / 100) * 100);
                        
                        // Extract numbers from description for progress
                        const descriptionMatch = achievement.description.match(/(\d+)/);
                        const totalNeeded = descriptionMatch ? parseInt(descriptionMatch[0]) : 10;
                        const currentProgress = Math.round((progressPercent / 100) * totalNeeded);
                        
                        return (
                          <div key={userAchievement.id} className="border border-neutral-200 rounded-lg p-4">
                            <div className="flex items-center mb-3">
                              <div className="h-12 w-12 rounded-full bg-neutral-300 text-white flex items-center justify-center text-xl">
                                {getIconComponent(achievement.icon, "h-6 w-6")}
                              </div>
                              <div className="ml-3">
                                <h3 className="font-medium">{achievement.name}</h3>
                                <p className="text-sm text-neutral-600">{achievement.description}</p>
                              </div>
                            </div>
                            <div className="w-full bg-neutral-200 rounded-full h-2.5 mt-2">
                              <div 
                                className="bg-primary h-2.5 rounded-full" 
                                style={{ width: `${progressPercent}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between mt-1 text-xs text-neutral-500">
                              <span>{currentProgress}/{totalNeeded} completed</span>
                              <span>{progressPercent}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
