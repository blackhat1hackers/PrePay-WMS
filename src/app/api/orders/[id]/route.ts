import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const { id } = await params;
    
    const order = await db.order.findUnique({
      where: { id },
      include: { buyer: true, cashback: true }
    });

    if (!order) {
      return new NextResponse("Not Found", { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("[ORDER_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'SUPER_ADMIN', 'STAFF'].includes((session.user as any).role)) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    delete body.id;
    delete body.createdAt;
    delete body.updatedAt;
    delete body.buyer;
    delete body.cashback;
    
    if (body.orderSubmissionDate === null) {
      body.orderSubmissionDate = null;
    } else if (body.orderSubmissionDate) {
      body.orderSubmissionDate = new Date(body.orderSubmissionDate);
    }
    
    if (body.reviewSubmissionDate === null) {
      body.reviewSubmissionDate = null;
    } else if (body.reviewSubmissionDate) {
      body.reviewSubmissionDate = new Date(body.reviewSubmissionDate);
    }

    const oldOrder = await db.order.findUnique({ where: { id } });
    if (!oldOrder) {
      return new NextResponse("Not Found", { status: 404 });
    }

    if (body.amount !== undefined) {
      body.amount = parseFloat(body.amount) || 0;
      
      const diff = body.amount - oldOrder.amount;
      if (diff !== 0) {
        const buyer = await db.buyer.findUnique({ where: { id: oldOrder.buyerId } });
        if (buyer) {
           await db.buyer.update({
             where: { id: buyer.id },
             data: { availableBalance: buyer.availableBalance - diff }
           });
           
           await db.walletLog.create({
             data: {
               buyerId: buyer.id,
               amount: Math.abs(diff),
               type: diff > 0 ? "Order Deduction" : "Order Refund",
               notes: `Adjustment for Order #${oldOrder.orderNumber}`
             }
           });
        }
      }
    }

    const order = await db.order.update({
      where: { id },
      data: body
    });

    return NextResponse.json(order);
  } catch (error: any) {
    console.error("[ORDER_PATCH]", error);
    if (error.code === 'P2002') {
      return new NextResponse("An order with this Order Number already exists.", { status: 400 });
    }
    return new NextResponse(error.message || "Internal Error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes((session.user as any).role)) {
      return new NextResponse("Unauthorized - Only Admins can delete", { status: 403 });
    }

    const { id } = await params;
    
    const oldOrder = await db.order.findUnique({ where: { id } });
    if (oldOrder) {
      const buyer = await db.buyer.findUnique({ where: { id: oldOrder.buyerId } });
      if (buyer) {
         await db.buyer.update({
           where: { id: buyer.id },
           data: { availableBalance: buyer.availableBalance + oldOrder.amount }
         });
         
         await db.walletLog.create({
           data: {
             buyerId: buyer.id,
             amount: oldOrder.amount,
             type: "Order Refund",
             notes: `Refund for Cancelled/Deleted Order #${oldOrder.orderNumber}`
           }
         });
      }
    }

    await db.order.delete({ where: { id } });

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("[ORDER_DELETE]", error);
    return new NextResponse(error.message || "Internal Error", { status: 500 });
  }
}
