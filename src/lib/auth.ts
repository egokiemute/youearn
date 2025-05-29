import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

export interface TokenPayload {
  userId: string;
  email: string;
  role?: string;
}

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET as string,
    { expiresIn: '24h' }
  );
};

export const verifyToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET as string) as TokenPayload;
  } catch (error) {
    console.log(error)
    return null;
  }
};

export const getTokenFromRequest = (request: NextRequest): string | null => {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
};

export const getUserFromRequest = (request: NextRequest): TokenPayload | null => {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  return verifyToken(token);
};