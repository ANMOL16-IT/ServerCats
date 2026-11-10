import { DepartmentChart } from "@/components/ui/dashboard-4-utils/department-chart";
import { QuickActions } from "@/components/ui/dashboard-4-utils/quick-actions";
import { CleanupChart } from "@/components/ui/dashboard-4-utils/cleanup-chart";
import { ResourceChart } from "@/components/ui/dashboard-4-utils/resource-chart";
import { DashboardStats } from "@/components/ui/dashboard-4-utils/stats";

export function Dashboard() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <DashboardStats />
      <ResourceChart />
      <CleanupChart />
      <DepartmentChart />
      <QuickActions />
    </div>
  );
}

export default Dashboard;
