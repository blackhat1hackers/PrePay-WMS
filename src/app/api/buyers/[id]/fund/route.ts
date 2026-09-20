import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes((session.user as any).role)) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { amount, notes, type, documentUrl } = body; 

    if (!amount) {
      return new NextResponse("Amount is required", { status: 400 });
    }

    const parsedAmount = parseFloat(amount);
    
    // Fetch buyer
    const buyer = await db.buyer.findUnique({ where: { id } });
    if (!buyer) {
      return new NextResponse("Buyer not found", { status: 404 });
    }

    // Update buyer's balance
    const newBalance = buyer.availableBalance + parsedAmount;
    await db.buyer.update({
      where: { id },
      data: { availableBalance: newBalance }
    });

    // Create a wallet log
    const walletLog = await db.walletLog.create({
      data: {
        buyerId: id,
        amount: Math.abs(parsedAmount),
        type: parsedAmount >= 0 ? (type || "Loan") : "Manual Deduction",
        notes: notes || "Added Loan Fund",
        documentUrl
      }
    });

    return NextResponse.json({ buyerId: id, availableBalance: newBalance, log: walletLog });
  } catch (error) {
    console.error("[BUYER_FUND_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
