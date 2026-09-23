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
    if (!session || !['ADMIN', 'SUPER_ADMIN', 'STAFF'].includes((session.user as any).role)) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const { id } = await params;
    
    // Fetch buyer with relations
    const buyer = await db.buyer.findUnique({
      where: { id },
      include: {
        orders: {
          include: {
            cashback: true
          }
        },
        walletLogs: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });
    
    if (!buyer) {
      return new NextResponse("Buyer not found", { status: 404 });
    }

    return NextResponse.json(buyer);
  } catch (error) {
    console.error("[BUYER_GET]", error);
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

    // Remove id and timestamps from the body if they exist
    delete body.id;
    delete body.createdAt;
    delete body.updatedAt;

    const buyer = await db.buyer.update({
      where: { id },
      data: body
    });

    return NextResponse.json(buyer);
  } catch (error) {
    console.error("[BUYER_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
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
    
    // Delete related wallet logs first to avoid foreign key constraint errors
    await db.walletLog.deleteMany({ where: { buyerId: id } });
    
    // Order and Cashback cascade on delete because of the Prisma schema, but we can explicitly delete them if preferred, 
    // or let Prisma cascade it if the schema has onDelete: Cascade for Order.
    // However, to be safe:
    await db.order.deleteMany({ where: { buyerId: id } });

    await db.buyer.delete({ where: { id } });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[BUYER_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
