import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { revalidatePath } from "next/cache";
import { Button } from "@/components/ui/button";
import { AppearanceSettings } from "@/components/ui/appearance-settings";
import { BankAccountsSection } from "./bank-accounts-section";

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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-theme-primary">Settings</h1>
        <p className="text-theme-secondary mt-1">Configure your account and paycheck</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-theme-secondary">Name</label>
              <p className="text-theme-primary font-medium">{user?.name || "Not set"}</p>
            </div>
            <div>
              <label className="text-sm text-theme-secondary">Email</label>
              <p className="text-theme-primary font-medium">{user?.email || "Not set"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent>
            <AppearanceSettings />
          </CardContent>
        </Card>

        <BankAccountsSection />

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Paycheck Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updatePaycheck} className="space-y-4 max-w-md">
              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-theme-secondary mb-1"
                >
                  Paycheck Amount (Net)
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  step="0.01"
                  defaultValue={user?.paycheckAmount?.toString() || ""}
                  placeholder="e.g., 2500.00"
                  className="w-full px-3 py-2 bg-theme-tertiary border border-theme rounded-lg text-theme-primary placeholder-theme-muted focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
              </div>

              <div>
                <label
                  htmlFor="day"
                  className="block text-sm font-medium text-theme-secondary mb-1"
                >
                  Pay Day
                </label>
                <select
                  id="day"
                  name="day"
                  defaultValue={user?.paycheckDay || 3}
                  className="w-full px-3 py-2 bg-theme-tertiary border border-theme rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent-500"
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
                  className="block text-sm font-medium text-theme-secondary mb-1"
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
                  className="w-full px-3 py-2 bg-theme-tertiary border border-theme rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
              </div>

              <Button type="submit" className="w-full">
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>About OpenFinance</CardTitle>
        </CardHeader>
        <CardContent className="text-theme-secondary space-y-2">
          <p>
            OpenFinance is a minimal personal finance tracker built for bi-weekly
            budgeting, following the Money Guy Financial Order of Operations (FOO).
          </p>
          <p className="text-sm">
            Version 0.1.0 • Open Source •{" "}
            <a
              href="https://github.com/yourusername/openfinance"
              className="text-accent-400 hover:underline"
            >
              GitHub
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
