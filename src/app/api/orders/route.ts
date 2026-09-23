import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'SUPER_ADMIN', 'STAFF'].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    // Try including the buyer.
    let orders: any[] = [];
    try {
      orders = await db.order.findMany({ include: { buyer: true } });
    } catch (e) {
      console.warn("Error fetching orders", e);
    }

    return NextResponse.json(orders);
  } catch (error) {
    console.error("[ORDERS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'SUPER_ADMIN', 'STAFF'].includes((session.user as any).role)) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const body = await request.json();
    const { orderNumber, marketplace, sellerName, amount, status, buyerId, productImage, productLink, orderScreenshots, reviewScreenshots, orderSubmissionDate, reviewSubmissionDate } = body;

    if (!orderNumber || !buyerId) {
      return new NextResponse("Order Number and Buyer ID are required", { status: 400 });
    }

    const parsedAmount = parseFloat(amount) || 0;

    // Check if order number already exists
    const existingOrder = await db.order.findUnique({
      where: { orderNumber }
    });

    if (existingOrder) {
      return new NextResponse(`Order number ${orderNumber} already exists.`, { status: 400 });
    }

    // Create the order
    const order = await db.order.create({
      data: {
        orderNumber,
        marketplace: marketplace || "Amazon",
        sellerName,
        amount: parsedAmount,
        status: status || "Order Done",
        buyerId,
        productImage,
        productLink,
        orderScreenshots: Array.isArray(orderScreenshots) ? orderScreenshots : [],
        reviewScreenshots: Array.isArray(reviewScreenshots) ? reviewScreenshots : [],
        orderSubmissionDate: orderSubmissionDate ? new Date(orderSubmissionDate) : null,
        reviewSubmissionDate: reviewSubmissionDate ? new Date(reviewSubmissionDate) : null,
      }
    });

    // Automatically create a pending Cashback record for this order
    await db.cashback.create({
      data: {
        orderId: order.id,
        amount: parsedAmount, 
        status: "Pending"
      }
    });

    // Deduct from Buyer's available balance
    const buyer = await db.buyer.findUnique({ where: { id: buyerId } });
    if (buyer) {
      const newBalance = buyer.availableBalance - parsedAmount;
      await db.buyer.update({
        where: { id: buyerId },
        data: { availableBalance: newBalance }
      });

      await db.walletLog.create({
        data: {
          buyerId,
          amount: parsedAmount,
          type: "Order Deduction",
          notes: `Deduction for Order #${orderNumber}`
        }
      });
    }

    return NextResponse.json(order);
  } catch (error: any) {
    console.error("[ORDERS_POST]", error);
    
    if (error.code === 'P2002') {
      return new NextResponse("An order with this Order Number already exists.", { status: 400 });
    }
    
    return new NextResponse(error.message || "Internal Error", { status: 500 });
  }
}
