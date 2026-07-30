import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import ThermalShippingLabelView from "./ThermalShippingLabelView";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Label Pengiriman Resi #${id.slice(-8).toUpperCase()} | ArtAndCraft.id`,
  };
}

export default async function ShippingLabelPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/seller/orders/${id}/shipping-label`);
  }

  const orderData = await prisma.order.findUnique({
    where: { id },
    select: {
      id: true,
      createdAt: true,
      shippingCourier: true,
      trackingNumber: true,
      shippingAddress: true,
      items: {
        select: {
          id: true,
          quantity: true,
          price: true,
          product: {
            select: {
              title: true,
              sellerId: true,
              seller: {
                select: {
                  storeName: true,
                  user: { select: { name: true, email: true } },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!orderData) notFound();

  // Verify Seller Ownership
  const sellerProfiles = await prisma.sellerProfile.findMany({
    where: { userId: session.user.id },
    select: { id: true },
  });
  const userSellerIds = sellerProfiles.map((s) => s.id);
  const isSeller = orderData.items.some((item) => userSellerIds.includes(item.product.sellerId));
  const isAdmin = session.user.role === "ADMIN";

  if (!isSeller && !isAdmin) {
    notFound();
  }

  return (
    <ThermalShippingLabelView
      order={{
        ...orderData,
        items: orderData.items.map((item) => ({
          ...item,
          price: Number(item.price),
        })),
      }}
    />
  );
}
