import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set inside the environment.");
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function cleanDatabase() {
  console.log("🧹 Starting database cleanup (purging all dummy data)...");

  try {
    const client = await pool.connect();
    client.release();
  } catch (err) {
    console.error("❌ Database connection failed:", err);
    await pool.end();
    process.exit(1);
  }

  try {
    // Purge transactional and dummy listing records
    console.log("Deleting notifications...");
    await prisma.notification.deleteMany({});

    console.log("Deleting coupons...");
    await prisma.coupon.deleteMany({});

    console.log("Deleting shipping addresses...");
    await prisma.shippingAddress.deleteMany({});

    console.log("Deleting order items & orders...");
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});

    console.log("Deleting cart items & carts...");
    await prisma.cartItem.deleteMany({});
    await prisma.cart.deleteMany({});

    console.log("Deleting wishlist items & wishlists...");
    await prisma.wishlistItem.deleteMany({});
    await prisma.wishlist.deleteMany({});

    console.log("Deleting reviews...");
    await prisma.review.deleteMany({});

    console.log("Deleting product listings...");
    await prisma.product.deleteMany({});

    console.log("Deleting seller profiles...");
    await prisma.sellerProfile.deleteMany({});

    console.log("Deleting auth sessions & accounts...");
    await prisma.account.deleteMany({});
    await prisma.session.deleteMany({});

    // Keep ADMIN users, delete dummy BUYER / SELLER users
    console.log("Deleting non-admin test users...");
    await prisma.user.deleteMany({
      where: {
        role: {
          not: "ADMIN",
        },
      },
    });

    console.log("✅ Database successfully cleaned! Taxonomies and Admin accounts remain intact.");
  } catch (error) {
    console.error("❌ Error during database cleanup:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

cleanDatabase();
