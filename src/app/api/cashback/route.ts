import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'SUPER_ADMIN', 'STAFF'].includes((session.user as any).role)) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    let cashbacks: any[] = [];
    try {
      cashbacks = await db.cashback.findMany({
        include: {
          order: {
            include: {
              buyer: true
            }
          }
        }
      });
    } catch (e) {
      console.warn("Error fetching cashbacks", e);
    }

    return NextResponse.json(cashbacks);
  } catch (error) {
    console.error("[CASHBACK_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
