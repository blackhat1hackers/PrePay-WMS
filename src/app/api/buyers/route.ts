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

    const buyers = await db.buyer.findMany();

    return NextResponse.json(buyers);
  } catch (error) {
    console.error("[BUYERS_GET]", error);
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
    const { name, email, phone, country, stateOrCity, address, notes, paypalEmail, facebookLink, amazonReviewLink, imageUrl, walmartScreenshot, accountStatus, verificationStatus, trustRating } = body;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    const buyer = await db.buyer.create({
      data: {
        name,
        email,
        phone,
        country,
        stateOrCity,
        address,
        notes,
        paypalEmail,
        facebookLink,
        amazonReviewLink,
        imageUrl,
        walmartScreenshot,
        accountStatus: accountStatus || "Active",
        verificationStatus: verificationStatus || "Pending",
        trustRating: trustRating ? Number(trustRating) : 0,
      }
    });

    return NextResponse.json(buyer);
  } catch (error) {
    console.error("[BUYERS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
