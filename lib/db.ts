// Simple in-memory database for now
export const db = {
  departments: new Map(),
  proposals: new Map(),
};

export const prisma = {
  department: {
    findMany: async () => {
      return Array.from(db.departments.values());
    },
    create: async (data: any) => {
      const id = Math.random().toString(36).substr(2, 9);
      const department = { ...data.data, id };
      db.departments.set(id, department);
      return department;
    },
  },
};
