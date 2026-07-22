import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;

    // 1. Get current product context
    const currentProduct = await prisma.product.findUnique({
      where: { slug, status: "ACTIVE" },
      include: {
        category: true,
        subcategory: true,
        tags: { include: { tag: true } }
      }
    });

    if (!currentProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // 2. AI Recommendation Algorithm (Smart Content-Based Heuristic)
    
    // Fetch potential candidates (same category, active, not the same product)
    const candidates = await prisma.product.findMany({
      where: {
        categoryId: currentProduct.categoryId,
        status: "ACTIVE",
        id: { not: currentProduct.id }
      },
      include: {
        seller: { select: { storeName: true } },
        tags: { include: { tag: true } },
      },
      take: 50 // get up to 50 to score
    });

    // Scoring Process
    const currentTagIds = currentProduct.tags.map(t => t.tagId);
    
    const scoredCandidates = candidates.map(product => {
      let score = 0;
      
      // Subcategory match (+5)
      if (currentProduct.subcategoryId && product.subcategoryId === currentProduct.subcategoryId) {
        score += 5;
      }
      
      // Tag match (+3 per matching tag)
      const productTagIds = product.tags.map(t => t.tagId);
      const commonTags = currentTagIds.filter(id => productTagIds.includes(id));
      score += commonTags.length * 3;

      // Same Seller (+3) -> Cross-selling
      if (product.sellerId === currentProduct.sellerId) {
        score += 3;
      }
      
      // Views/Popularity (+0.01 per view to break ties)
      score += (product.viewCount || 0) * 0.01;

      return { ...product, _score: score };
    });

    // Sort by score desc, take top 8 recommendations
    const recommendations = scoredCandidates
      .sort((a, b) => b._score - a._score)
      .slice(0, 8)
      .map(p => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        price: Number(p.price),
        discount: Number(p.discount),
        photos: p.photos,
        categoryName: currentProduct.category.name,
        sellerName: p.seller.storeName,
        rating: 4.8, // Mocked until rating aggregation is implemented
        reviewsCount: Math.floor(Math.random() * 50) + 5,
        score: p._score
      }));

    return NextResponse.json({ data: recommendations });

  } catch (error) {
    console.error("AI Recommendation Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
