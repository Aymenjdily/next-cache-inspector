import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const subscribeSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as unknown;
    const result = subscribeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 },
      );
    }

    // Database functionality is optional and requires DATABASE_URL env var
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "Newsletter is not configured. Set DATABASE_URL environment variable." },
        { status: 503 },
      );
    }

    // Dynamic import to avoid build errors when Prisma client is not generated
    const { prisma } = await import("@/lib/db");
    const { email } = result.data;

    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You're already subscribed!" },
        { status: 409 },
      );
    }

    await prisma.newsletterSubscriber.create({
      data: { email },
    });

    return NextResponse.json(
      { message: "Subscribed successfully!" },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
