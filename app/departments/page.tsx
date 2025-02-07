import { Space_Grotesk } from "next/font/google";
import { Header } from "@/app/components/Header";
import { DepartmentCard } from "@/app/components/DepartmentCard";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

const departments = [
  {
    name: "Department of Defense",
    budget: "$773.1B",
    projects: "21,345",
    utilization: "98.2%",
    logo: "/images/dod-logo.png",
  },
  {
    name: "NASA",
    budget: "$24.5B",
    projects: "12,458",
    utilization: "94.2%",
    logo: "/images/nasa.png",
  },
  // Add more departments...
];

export default function DepartmentsPage() {
  return (
    <>
      <Header />
      <main className="pt-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-between items-center mb-8">
            <h1
              className={`text-3xl font-bold text-gray-900 ${spaceGrotesk.className}`}
            >
              All Departments
            </h1>
            <div className="flex items-center gap-4">
              <input
                type="search"
                placeholder="Search departments..."
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>All Categories</option>
                <option>Defense</option>
                <option>Science</option>
                <option>Education</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {departments.map((dept, i) => (
              <DepartmentCard key={i} {...dept} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
