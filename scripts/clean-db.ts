import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set inside the environment.");
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function cleanDatabase() {
  console.log("🧹 Starting database cleanup (purging all test/dummy data)...");

  try {
    const client = await pool.connect();
    client.release();
  } catch (err) {
    console.error("❌ Database connection failed:", err);
    await pool.end();
    process.exit(1);
  }

  try {
    console.log("Deleting notifications...");
    await prisma.notification.deleteMany({});

    console.log("Deleting coupons...");
    await prisma.coupon.deleteMany({});

    console.log("Deleting messages & conversations...");
    await prisma.message.deleteMany({});
    await prisma.conversation.deleteMany({});

    console.log("Deleting custom requests...");
    await prisma.customRequest.deleteMany({});

    console.log("Deleting wallet transactions & withdrawals...");
    await prisma.walletTransaction.deleteMany({});
    await prisma.withdrawal.deleteMany({});

    console.log("Deleting store followers...");
    await prisma.storeFollower.deleteMany({});

    console.log("Deleting addresses...");
    await prisma.address.deleteMany({});

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

    console.log("Deleting verification tokens...");
    await prisma.verificationToken.deleteMany({});

    console.log("Deleting auth sessions & accounts...");
    await prisma.account.deleteMany({});
    await prisma.session.deleteMany({});

    console.log("Deleting non-admin test users...");
    await prisma.user.deleteMany({
      where: {
        role: {
          not: "ADMIN",
        },
      },
    });

    // Ensure at least one Admin account exists with known password
    const adminEmail = process.env.ADMIN_INITIAL_EMAIL || "admin@artandcraft.id";
    const adminPasswordRaw = process.env.ADMIN_INITIAL_PASSWORD || "Admin@123";
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    const hashedPassword = await bcrypt.hash(adminPasswordRaw, 10);

    if (!existingAdmin) {
      console.log(`Creating Admin user (${adminEmail})...`);
      await prisma.user.create({
        data: {
          name: "Super Admin",
          username: "admin",
          email: adminEmail,
          password: hashedPassword,
          role: "ADMIN",
          emailVerified: new Date(),
        },
      });
    } else {
      console.log(`Updating Admin user (${adminEmail}) password and status...`);
      await prisma.user.update({
        where: { email: adminEmail },
        data: {
          password: hashedPassword,
          emailVerified: new Date(),
          role: "ADMIN",
        },
      });
    }

    console.log("✅ Database cleanup completed successfully!");
  } catch (error) {
    console.error("❌ Error during database cleanup:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

cleanDatabase();
