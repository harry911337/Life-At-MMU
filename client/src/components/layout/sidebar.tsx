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
    <Link href={href}>
      <a
        className={cn(
          "flex items-center space-x-3 w-full px-3 py-2 text-left rounded-md text-neutral-700 hover:bg-neutral-100 hover:text-primary",
          isActive && "bg-primary/10 text-primary font-medium"
        )}
        onClick={closeSidebarOnMobile}
      >
        <Icon className="w-5 h-5" />
        <span>{label}</span>
      </a>
    </Link>
  );

  const SectionHeader = ({ label }: { label: string }) => (
    <h3 className="px-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider mt-6 mb-2">
      {label}
    </h3>
  );

  return (
    <aside
      className={cn(
        "w-64 bg-white shadow-md z-30 fixed inset-y-0 left-0 transform transition duration-200 ease-in-out pt-16 lg:pt-0 lg:static lg:inset-auto",
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
