import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/use-auth";
import { LogOut } from "lucide-react";

interface LogoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LogoutDialog({ open, onOpenChange }: LogoutDialogProps) {
  const { logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex justify-center mb-2">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <LogOut className="h-6 w-6" />
            </div>
          </div>
          <AlertDialogTitle className="text-center">Sign Out?</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Are you sure you want to sign out from your account?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-row justify-between">
          <AlertDialogCancel className="flex-1 border border-neutral-300 text-neutral-700">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            className="flex-1 bg-primary text-white hover:bg-primary/90"
            onClick={handleLogout}
          >
            Sign Out
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
