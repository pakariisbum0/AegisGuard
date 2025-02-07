"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

interface DepartmentCardProps {
  name: string;
  budget: string;
  projects: string;
  utilization: string;
  logo: string;
}

export function DepartmentCard({
  name,
  budget,
  projects,
  utilization,
  logo,
}: DepartmentCardProps) {
  const router = useRouter();

  return (
    <div
      className="group bg-white rounded-xl p-6 hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-gray-200 cursor-pointer"
      onClick={() =>
        router.push(`/departments/${name.toLowerCase().replace(/ /g, "-")}`)
      }
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 group-hover:border-gray-200 transition-colors">
          <Image
            src={logo}
            alt={name}
            width={40}
            height={40}
            className="rounded-lg"
          />
        </div>
        <h3 className="text-lg font-medium text-gray-900">{name}</h3>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[
          ["Budget", budget],
          ["Projects", projects],
          ["Utilization", utilization],
        ].map(([label, value]) => (
          <div
            key={label}
            className="group-hover:bg-gray-50 p-3 rounded-lg transition-colors border border-transparent group-hover:border-gray-100"
          >
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-lg font-medium text-gray-900">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
