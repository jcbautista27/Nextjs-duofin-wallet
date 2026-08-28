import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

import { CategoryManager } from "@/components/categories/category-manager";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user?.spaceId) redirect("/space");

  const space = await prisma.space.findUnique({
    where: { id: user.spaceId },
  });
  if (!space || space.status !== "ACTIVE") redirect("/space");

  const categories = await prisma.category.findMany({
    where: { spaceId: space.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold">Categorías</h1>
      <CategoryManager
        categories={categories}
        userId={user.id}
      />
    </div>
  );
}
