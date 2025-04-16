import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

// Add paths that don't require authentication
const publicPaths = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/products',
  '/api/categories',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the path is public
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Get the token from the Authorization header
  const token = request.headers.get('Authorization')?.replace('Bearer', '')

  if (!token) {
    return new NextResponse(
      JSON.stringify({ message: 'Authentication required' }),
      { status: 401, headers: { 'content-type': 'application/json' } }
    )
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!)
    
    // Add the user info to the request headers
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('user', JSON.stringify(decoded))

    // Return the response with the modified headers
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ message: 'Invalid token' }),
      { status: 401, headers: { 'content-type': 'application/json' } }
    )
  }
}

// Configure which paths the middleware should run on
export const config = {
  matcher: '/api/:path*',
} 