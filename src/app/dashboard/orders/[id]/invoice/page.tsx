import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import PrintableInvoiceView from "./PrintableInvoiceView";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Faktur Resmi #${id.slice(-8).toUpperCase()} | ArtAndCraft.id`,
  };
}

export default async function InvoicePage({ params }: Props) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/dashboard/orders/${id}/invoice`);
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      shippingAddress: true,
      items: {
        include: {
          product: {
            select: {
              title: true,
              sellerId: true,
              seller: { select: { storeName: true, bankName: true, bankAccountNumber: true } },
            },
          },
        },
      },
    },
  });

  if (!order) notFound();

  // Allow Buyer, Seller of the order items, or Admin to view/print invoice
  const isBuyer = order.userId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  const sellerProfiles = await prisma.sellerProfile.findMany({
    where: { userId: session.user.id },
    select: { id: true },
  });
  const userSellerIds = sellerProfiles.map((s) => s.id);

  const isSeller = order.items.some((item) => userSellerIds.includes(item.product.sellerId));

  if (!isBuyer && !isSeller && !isAdmin) {
    notFound();
  }

  return (
    <PrintableInvoiceView
      order={{
        ...order,
        totalAmount: Number(order.totalAmount),
        shippingCost: Number(order.shippingCost),
        discountAmount: Number(order.discountAmount),
        grandTotal: Number(order.grandTotal),
        items: order.items.map((item) => ({
          ...item,
          price: Number(item.price),
        })),
      }}
    />
  );
}
