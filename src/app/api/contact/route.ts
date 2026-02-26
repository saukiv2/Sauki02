import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;


export async function POST(req: Request) {
  try {
    const { name, email, subject, message } = await req.json();
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    // Save to DB
    await prisma.contactMessage.create({
      data: { name, email, subject, message },
    });

    // Optionally: send notification/email here

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to submit message." }, { status: 500 });
  }
}
