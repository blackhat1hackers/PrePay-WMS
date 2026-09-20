import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

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
    delete body.order;
    delete body.orderId;
    
    if (body.amount) {
      body.amount = parseFloat(body.amount);
    }
    
    if (body.screenshots && Array.isArray(body.screenshots)) {
      // Keep it as an array
    } else if (body.screenshots) {
      delete body.screenshots; // Fallback if invalid format
    }

    const cashback = await db.cashback.update({
      where: { id },
      data: body
    });

    return NextResponse.json(cashback);
  } catch (error) {
    console.error("[CASHBACK_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
