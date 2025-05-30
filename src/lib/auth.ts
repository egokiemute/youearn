import { SignJWT, jwtVerify } from 'jose';
import { NextRequest } from 'next/server';

export interface TokenPayload {
  userId: string;
  email: string;
  role?: string;
  iat?: number;
  exp?: number;
}

const secret = new TextEncoder().encode(process.env.JWT_SECRET as string);

export const generateToken = async (payload: TokenPayload): Promise<string> => {
  return await new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);
};

export const verifyToken = async (token: string): Promise<TokenPayload | null> => {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as TokenPayload;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getTokenFromRequest = (request: NextRequest): string | null => {
  // Try Authorization header first
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Try cookies as fallback
  const tokenFromCookie = request.cookies.get('token')?.value;
  return tokenFromCookie || null;
};

export const getUserFromRequest = async (request: NextRequest): Promise<TokenPayload | null> => {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  return await verifyToken(token);
};