import { prisma } from "@/lib/db";
import { DashboardContent } from "./DashboardContent";

export default async function AdminDashboard() {
  // Fetch data from the database
  const departments = await prisma.department.findMany({
    include: {
      proposals: true,
    },
  });

  // Use the fetched data instead of mock data
  const departmentData = departments.map((dept) => ({
    name: dept.name,
    budget: dept.budget,
    spent: dept.spent,
    efficiency: dept.efficiency,
    projects: dept.projects,
  }));

  return <DashboardContent departments={departmentData} />;
}
