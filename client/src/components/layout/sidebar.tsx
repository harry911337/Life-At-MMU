import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Home, GraduationCap, Coffee, Users, PawPrint, Camera, Utensils, Gauge } from "lucide-react";
import { Link, useLocation } from "wouter";

interface SidebarProps {
  isMobileSidebarOpen: boolean;
  setMobileSidebarOpen: (isOpen: boolean) => void;
}

export function Sidebar({ isMobileSidebarOpen, setMobileSidebarOpen }: SidebarProps) {
  const { user } = useAuth();
  const [location] = useLocation();

  const isAdmin = user?.isAdmin;

  const closeSidebarOnMobile = () => {
    if (window.innerWidth < 1024) {
      setMobileSidebarOpen(false);
    }
  };

  const NavItem = ({ 
    href, 
    icon: Icon, 
    label, 
    isActive 
  }: { 
    href: string; 
    icon: React.ElementType; 
    label: string; 
    isActive: boolean;
  }) => (
    <div
      className={cn(
        "nav-item cursor-pointer",
        isActive && "nav-item-active"
      )}
      onClick={() => {
        closeSidebarOnMobile();
        window.location.href = href;
      }}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </div>
  );

  const SectionHeader = ({ label }: { label: string }) => (
    <h3 className="px-3 text-xs font-semibold bg-gradient-to-r from-primary/80 to-blue-700/80 bg-clip-text text-transparent uppercase tracking-wider mt-6 mb-2">
      {label}
    </h3>
  );

  return (
    <aside
      className={cn(
        "w-64 bg-white shadow-md z-30 fixed inset-y-0 left-0 transform transition duration-200 ease-in-out pt-16 lg:pt-0 lg:static lg:inset-auto border-r border-neutral-100",
        isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      <nav className="p-4 space-y-1 h-full overflow-y-auto">
        <div>
          <NavItem
            href="/"
            icon={Home}
            label="Home"
            isActive={location === "/"}
          />
        </div>

        <SectionHeader label="Community Forum" />
        <NavItem
          href="/learning-port"
          icon={GraduationCap}
          label="Learning Port"
          isActive={location === "/learning-port"}
        />
        <NavItem
          href="/cafe-talk"
          icon={Coffee}
          label="Cafe Talk"
          isActive={location === "/cafe-talk"}
        />
        <NavItem
          href="/workshop"
          icon={Users}
          label="Workshop"
          isActive={location === "/workshop"}
        />

        <SectionHeader label="Campus Cats Hub" />
        <NavItem
          href="/paw-index"
          icon={PawPrint}
          label="PawPrint Index"
          isActive={location === "/paw-index"}
        />
        <NavItem
          href="/daily-feed"
          icon={Camera}
          label="Daily Feed"
          isActive={location === "/daily-feed"}
        />

        <SectionHeader label="Food & Dining" />
        <NavItem
          href="/canteen-updates"
          icon={Utensils}
          label="Canteen Updates"
          isActive={location === "/canteen-updates"}
        />

        {isAdmin && (
          <>
            <SectionHeader label="Admin Panel" />
            <NavItem
              href="/admin"
              icon={Gauge}
              label="Dashboard"
              isActive={location === "/admin"}
            />
          </>
        )}
      </nav>
    </aside>
  );
}
