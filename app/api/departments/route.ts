import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const departments = Array.from(db.departments.values());
    return NextResponse.json(departments);
  } catch (error) {
    console.error("Failed to fetch departments:", error);
    return NextResponse.json(
      { error: "Failed to fetch departments" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = Math.random().toString(36).substr(2, 9);
    const department = { ...body, id };
    db.departments.set(id, department);
    return NextResponse.json(department);
  } catch (error) {
    console.error("Failed to create department:", error);
    return NextResponse.json(
      { error: "Failed to create department" },
      { status: 500 }
    );
  }
}
