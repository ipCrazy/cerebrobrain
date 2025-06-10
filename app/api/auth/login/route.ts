import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import UserModel from "@/models/User";
import connectToDatabase from "@/lib/mongo";
import { generateToken } from "@/utils/jwt";

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const { email, password } = await request.json();
    

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

   
const user = await UserModel.findOne({ email }).select("+password");

if (user) {
    console.log("Hashed password from DB (for debugging - be careful with this in production!):", user.password);
}
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 400 }
      );
    }
 // --- LOGOVI ZA DEBAGOVANJE - SAMO ZA LOGIN ---
  console.log("--- LOGIN PASSWORD VERIFICATION ---");
  console.log("Raw password received from frontend:", password); // OPREZ: NIKADA U PROD!
  console.log("Hashed password retrieved from DB:", user.password);

  console.log("Checking password with bcrypt.compare():");
  console.log("  - bcrypt will extract the salt from the DB hash."); // Objašnjava kako bcrypt radi
  console.log("  - It will then hash the raw frontend password using that same salt.");
  console.log("  - Finally, it will compare this newly generated hash with the DB hash.");
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 400 }
      );
    }

    const token = generateToken(user._id);

    // Postavljamo cookie koristeći Next.js cookies API
    (await cookies()).set({
      name: "auth-token",
      value: token,
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return NextResponse.json({ message: "Login successful." }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}