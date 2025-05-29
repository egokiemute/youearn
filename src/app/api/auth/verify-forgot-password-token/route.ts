import { NextResponse, NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token) {
      return NextResponse.json(
        {
          error: "Token is required!",
        },
        { status: 400 }
      );
    }

    const verifyToken = await jwt.verify(
      token,
      process.env.FORGOT_PASSWORD_SECRET_KEY!
    );

    if (!verifyToken) {
      return NextResponse.json(
        {
          error: "Token has expired!",
          expired: true,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "Token is valid",
      userId:
        typeof verifyToken === "object" && "id" in verifyToken
          ? verifyToken.id
          : null,
      expired: false,
    });

    // verify a token asymmetric
    // jwt.verify(token, cert, function(err, decoded) {
    //   console.log(decoded.foo) // bar
    // });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while trying to reset your password.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
