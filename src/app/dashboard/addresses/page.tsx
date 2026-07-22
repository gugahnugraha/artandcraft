import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import AddressManager from "./AddressManager";
import { cookies } from "next/headers";
import { id } from "@/locales/id";
import { en } from "@/locales/en";

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const lang = cookieStore.get("NEXT_LOCALE")?.value || "id";
  const t = lang === "en" ? en : id;
  return {
    title: t.addresses.title,
  };
}

export const dynamic = "force-dynamic";

export default async function AddressesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/dashboard/addresses");

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return <AddressManager initialAddresses={addresses} />;
}
