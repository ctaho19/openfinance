import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/ui/sidebar";
import { BottomNav } from "@/components/ui/bottom-nav";
import { SessionProvider } from "next-auth/react";
import { SessionMonitor } from "@/components/session-monitor";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <SessionProvider session={session}>
      <SessionMonitor />
      <div className="flex h-screen bg-theme-secondary overflow-hidden">
        {/* Desktop sidebar */}
        <Sidebar />
        
        {/* Main content area */}
        <div className="flex-1 flex flex-col relative">
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-3xl lg:max-w-7xl mx-auto px-4 pt-4 pb-24 lg:px-8 lg:pt-8 lg:pb-8">
              {children}
            </div>
          </main>
          
          {/* Mobile bottom navigation */}
          <BottomNav />
        </div>
      </div>
    </SessionProvider>
  );
}
