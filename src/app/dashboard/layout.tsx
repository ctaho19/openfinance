import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/ui/sidebar";
import { SessionProvider } from "next-auth/react";

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
      <div className="flex h-screen bg-theme-primary overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          {/* Mobile top padding for fixed header */}
          <div className="pt-16 lg:pt-0">
            <div className="max-w-7xl mx-auto p-4 lg:p-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SessionProvider>
  );
}
