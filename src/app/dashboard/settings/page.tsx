import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { revalidatePath } from "next/cache";
import { Button } from "@/components/ui/button";
import { AppearanceSettings } from "@/components/ui/appearance-settings";
import { BankAccountsSection } from "./bank-accounts-section";
import { User, Palette, CreditCard, Calendar, Info, ExternalLink } from "lucide-react";

async function getUserSettings(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      paycheckAmount: true,
      paycheckFrequency: true,
      paycheckDay: true,
      lastPaycheckDate: true,
    },
  });
  return user;
}

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await getUserSettings(session.user.id);

  async function updatePaycheck(formData: FormData) {
    "use server";

    const session = await auth();
    if (!session?.user?.id) return;

    const amount = formData.get("amount") as string;
    const day = formData.get("day") as string;
    const lastDate = formData.get("lastDate") as string;

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        paycheckAmount: amount ? parseFloat(amount) : null,
        paycheckDay: day ? parseInt(day) : 3,
        lastPaycheckDate: lastDate ? new Date(lastDate) : null,
      },
    });

    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard");
  }

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in">
      {/* Header */}
      <header>
        <h1 className="text-2xl lg:text-3xl font-bold text-theme-primary tracking-tight">Settings</h1>
        <p className="text-theme-secondary mt-1">
          Configure your account and preferences
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Account Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-theme-tertiary">
                <User className="h-5 w-5 text-theme-secondary" />
              </div>
              <div>
                <CardTitle>Account</CardTitle>
                <CardDescription>Your profile information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-theme-secondary">
                <label className="text-xs font-medium text-theme-muted uppercase tracking-wider">Name</label>
                <p className="text-theme-primary font-medium mt-1">{user?.name || "Not set"}</p>
              </div>
              <div className="p-4 rounded-xl bg-theme-secondary">
                <label className="text-xs font-medium text-theme-muted uppercase tracking-wider">Email</label>
                <p className="text-theme-primary font-medium mt-1">{user?.email || "Not set"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-theme-tertiary">
                <Palette className="h-5 w-5 text-theme-secondary" />
              </div>
              <div>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize how OpenFinance looks</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <AppearanceSettings />
          </CardContent>
        </Card>

        {/* Bank Accounts Section */}
        <div className="lg:col-span-2">
          <BankAccountsSection />
        </div>

        {/* Paycheck Configuration */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-theme-tertiary">
                <Calendar className="h-5 w-5 text-theme-secondary" />
              </div>
              <div>
                <CardTitle>Paycheck Configuration</CardTitle>
                <CardDescription>Set up your pay schedule for accurate budgeting</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form action={updatePaycheck} className="max-w-lg">
              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="amount"
                    className="block text-sm font-medium text-theme-secondary mb-2"
                  >
                    Paycheck Amount (Net)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-muted">$</span>
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      step="0.01"
                      defaultValue={user?.paycheckAmount?.toString() || ""}
                      placeholder="2,500.00"
                      className="w-full pl-8 pr-4 py-3 bg-theme-secondary border border-theme rounded-xl text-theme-primary placeholder-theme-muted focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="day"
                    className="block text-sm font-medium text-theme-secondary mb-2"
                  >
                    Pay Day
                  </label>
                  <select
                    id="day"
                    name="day"
                    defaultValue={user?.paycheckDay || 3}
                    className="w-full px-4 py-3 bg-theme-secondary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all appearance-none cursor-pointer"
                  >
                    {dayNames.map((name, index) => (
                      <option key={index} value={index}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="lastDate"
                    className="block text-sm font-medium text-theme-secondary mb-2"
                  >
                    Last Paycheck Date
                  </label>
                  <input
                    type="date"
                    id="lastDate"
                    name="lastDate"
                    defaultValue={
                      user?.lastPaycheckDate
                        ? new Date(user.lastPaycheckDate).toISOString().split("T")[0]
                        : "2025-11-26"
                    }
                    className="w-full px-4 py-3 bg-theme-secondary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all"
                  />
                </div>

                <Button type="submit" size="lg" className="mt-2">
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* About Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-accent-100 dark:bg-accent-600/20">
              <Info className="h-5 w-5 text-accent-600 dark:text-accent-400" />
            </div>
            <div>
              <CardTitle>About OpenFinance</CardTitle>
              <CardDescription>Version 0.1.0</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-theme-secondary leading-relaxed">
            OpenFinance is a minimal personal finance tracker built for bi-weekly
            budgeting, following the Money Guy Financial Order of Operations (FOO).
          </p>
          <div className="flex items-center gap-4 mt-4">
            <a
              href="https://github.com/ctaho19/openfinance"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-accent-600 dark:text-accent-400 hover:underline"
            >
              View on GitHub
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
