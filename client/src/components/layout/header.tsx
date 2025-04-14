import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogoutDialog } from "@/components/ui/logout-dialog";
import { Menu, User, Trophy, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  toggleSidebar: () => void;
}

export function Header({ toggleSidebar }: HeaderProps) {
  const { user } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm"
            className="mr-4 text-neutral-600 lg:hidden"
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center">
            <svg 
              width="32" 
              height="32" 
              viewBox="0 0 100 100" 
              className="mr-3" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M15 15 L15 85 L25 85 L25 15 Z" fill="#1E3A8A"/>
              <path d="M35 15 L35 85 L45 85 L45 15 Z" fill="#1E3A8A"/>
              <path d="M55 15 L55 50 A20 20 0 0 0 95 50 L95 15 L85 15 L85 50 A10 10 0 0 1 65 50 L65 15 Z" fill="#1E3A8A"/>
              <circle cx="60" cy="50" r="10" fill="#EF4444"/>
            </svg>
            <h1 className="text-xl font-bold text-primary hidden sm:block">Life at MMU</h1>
          </div>
        </div>

        <div className="flex items-center">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                    <span>{getInitials(user.name)}</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                    {getInitials(user.name)}
                  </div>
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.username}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <Link href="/profile">
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>My Profile</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/achievements">
                  <DropdownMenuItem className="cursor-pointer">
                    <Trophy className="mr-2 h-4 w-4" />
                    <span>Achievements</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-red-600"
                  onClick={() => setShowLogoutDialog(true)}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex space-x-2">
              <Link href="/auth">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                  Log In
                </Button>
              </Link>
              <Link href="/auth?tab=register">
                <Button className="bg-primary text-white hover:bg-primary/90">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Logout Dialog */}
      <LogoutDialog 
        open={showLogoutDialog} 
        onOpenChange={setShowLogoutDialog} 
      />
    </header>
  );
}
