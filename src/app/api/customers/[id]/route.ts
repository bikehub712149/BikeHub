import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import Bike from "@/models/Bike";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();

  const { id } = await params;

  const bike = await Bike.findOne({
    id,
  });

  if (!bike) {
    return NextResponse.json(
      { message: "Bike not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(bike);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();

  const body = await req.json();

  const { id } = await params;

  const bike = await Bike.findOneAndUpdate(
    { id },
    body,
    {
      new: true,
    }
  );

  return NextResponse.json(bike);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();

  const { id } = await params;

  await Bike.findOneAndDelete({
    id,
  });

  return NextResponse.json({
    success: true,
  });
}