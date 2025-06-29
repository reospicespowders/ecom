import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the JWT token
    const { getToken } = await auth();
    const jwtToken = await getToken();

    return NextResponse.json({
      userId,
      sessionClaims,
      jwtToken: jwtToken ? {
        length: jwtToken.length,
        preview: jwtToken.substring(0, 50) + '...',
        hasSub: jwtToken.includes('sub'),
      } : null,
      message: 'JWT debug information'
    });

  } catch (error: any) {
    console.error('JWT debug error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 