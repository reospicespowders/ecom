import { NextRequest, NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Log all session claims for debugging
    console.log('Session Claims:', JSON.stringify(sessionClaims, null, 2));
    
    const anyClaims = sessionClaims as any;
    const adminRole = anyClaims?.admin_role;
    
    return NextResponse.json({
      userId,
      adminRole,
      hasAdminRole: adminRole === 'admin',
      allClaims: sessionClaims
    });
  } catch (error: any) {
    console.error('JWT Test error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 