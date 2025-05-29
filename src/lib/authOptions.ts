import connectDB from "@/config/connectDB";
import UserModel from "@/models/User";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },  // Changed 'value' to 'type'
        password: { label: "Password", type: "password" },  // Changed 'value' to 'type' and 'text' to 'password'
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are missing");
        }

        try {
          await connectDB();
          const user = await UserModel.findOne({ email: credentials.email });

          if (!user) {
            throw new Error("User not found");
          }

          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordCorrect) {
            throw new Error("Incorrect password");
          }

          return {
            id: user._id.toString(),
            name: user.firstname,
            email: user.email,
            role: user.role,
            studentId: user.studentId,
            picture: user.picture,
          };
        } catch (error) {  // Added type annotation
          console.error("Authentication error:", error);
          throw new Error(
            error instanceof Error ? error.message : "Error connecting to database"
          );
        }
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    session: async ({ session, token }) => {  // Added type annotations
      if (token) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);