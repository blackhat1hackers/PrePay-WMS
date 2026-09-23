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
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes((session.user as any).role)) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { amount, notes, documentUrl } = body;

    // Fetch existing log
    const existingLog = await db.walletLog.findUnique({ where: { id } });
    if (!existingLog) {
      return new NextResponse("Wallet log not found", { status: 404 });
    }

    // Only allow manual adjustments/loans to be edited freely, but we trust the admin.
    let diff = 0;
    if (amount !== undefined) {
      const newAmount = parseFloat(amount);
      const isPositive = existingLog.type === "Loan" || existingLog.type === "Manual Adjustment" || existingLog.type === "Order Refund";
      const oldSignedAmount = isPositive ? existingLog.amount : -existingLog.amount;
      
      const parsedAmount = parseFloat(amount);
      const newSignedAmount = parsedAmount;
      
      diff = newSignedAmount - oldSignedAmount;
      
      // update buyer available balance
      if (diff !== 0) {
        const buyer = await db.buyer.findUnique({ where: { id: existingLog.buyerId } });
        if (buyer) {
          await db.buyer.update({
            where: { id: buyer.id },
            data: { availableBalance: buyer.availableBalance + diff }
          });
        }
      }
      
      await db.walletLog.update({
        where: { id },
        data: {
          amount: Math.abs(parsedAmount),
          type: parsedAmount >= 0 ? "Loan" : "Manual Deduction",
          notes: notes !== undefined ? notes : existingLog.notes,
          documentUrl: documentUrl !== undefined ? documentUrl : existingLog.documentUrl
        }
      });
      
    } else {
      // Just updating notes or documentUrl
      await db.walletLog.update({
        where: { id },
        data: {
          notes: notes !== undefined ? notes : existingLog.notes,
          documentUrl: documentUrl !== undefined ? documentUrl : existingLog.documentUrl
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[WALLET_PATCH]", error);
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
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const { id } = await params;

    // Fetch existing log
    const existingLog = await db.walletLog.findUnique({ where: { id } });
    if (!existingLog) {
      return new NextResponse("Wallet log not found", { status: 404 });
    }

    // Determine the signed amount to reverse
    const isPositive = existingLog.type === "Loan" || existingLog.type === "Manual Adjustment" || existingLog.type === "Order Refund";
    const signedAmount = isPositive ? existingLog.amount : -existingLog.amount;

    // Reverse the balance on the buyer
    const buyer = await db.buyer.findUnique({ where: { id: existingLog.buyerId } });
    if (buyer) {
      await db.buyer.update({
        where: { id: buyer.id },
        data: { availableBalance: buyer.availableBalance - signedAmount }
      });
    }

    await db.walletLog.delete({ where: { id } });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[WALLET_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
