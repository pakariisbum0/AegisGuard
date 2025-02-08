"use client";

interface Department {
  name: string;
  budget: number;
  spent: number;
  efficiency: number;
  projects: number;
}

interface DashboardContentProps {
  departments: Department[];
}

export function DashboardContent({ departments }: DashboardContentProps) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid gap-4">
        {departments.map((dept, index) => (
          <div key={index} className="p-4 border rounded-lg">
            <h2 className="font-semibold">{dept.name}</h2>
            <div className="grid grid-cols-4 gap-4 mt-2">
              <div>Budget: {dept.budget}</div>
              <div>Spent: {dept.spent}</div>
              <div>Efficiency: {dept.efficiency}%</div>
              <div>Projects: {dept.projects}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
