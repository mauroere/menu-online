import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Verifica que las variables de entorno críticas estén configuradas
    const requiredEnvVars = ['NEXTAUTH_SECRET', 'NEXTAUTH_URL', 'DATABASE_URL'];
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missingEnvVars.length > 0) {
      return NextResponse.json(
        { 
          status: 'error', 
          message: `Missing required environment variables: ${missingEnvVars.join(', ')}`,
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }
    
    // Devuelve información de salud
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      env: {
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        NODE_ENV: process.env.NODE_ENV,
        // No incluimos NEXTAUTH_SECRET por seguridad
        DATABASE_URL: process.env.DATABASE_URL ? 'set' : 'not set',
        DIRECT_URL: process.env.DIRECT_URL ? 'set' : 'not set'
      }
    });
  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
} 