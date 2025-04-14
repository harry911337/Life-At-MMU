import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import LearningPortPage from "@/pages/learning-port-page";
import CafeTalkPage from "@/pages/cafe-talk-page";
import WorkshopPage from "@/pages/workshop-page";
import PawIndexPage from "@/pages/paw-index-page";
import DailyFeedPage from "@/pages/daily-feed-page";
import CanteenUpdatesPage from "@/pages/canteen-updates-page";
import ProfilePage from "@/pages/profile-page";
import AchievementsPage from "@/pages/achievements-page";
import AdminDashboard from "@/pages/admin-dashboard";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/learning-port" component={LearningPortPage} />
      <ProtectedRoute path="/cafe-talk" component={CafeTalkPage} />
      <ProtectedRoute path="/workshop" component={WorkshopPage} />
      <ProtectedRoute path="/paw-index" component={PawIndexPage} />
      <ProtectedRoute path="/daily-feed" component={DailyFeedPage} />
      <ProtectedRoute path="/canteen-updates" component={CanteenUpdatesPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/achievements" component={AchievementsPage} />
      <ProtectedRoute path="/admin" component={AdminDashboard} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
