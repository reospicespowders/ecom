import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();
    
    console.log('🔍 Debug - userId:', userId);
    console.log('🔍 Debug - sessionClaims:', JSON.stringify(sessionClaims, null, 2));
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin role in public metadata
    const anyClaims = sessionClaims as any;
    
    console.log('🔍 Debug - sessionClaims:', JSON.stringify(sessionClaims, null, 2));
    
    // First check: User must be authenticated (allows all authenticated users)
    if (anyClaims?.role !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Second check: User must have admin_role = "admin" (restricts dashboard access)
    const adminRole = anyClaims?.admin_role;
    
    console.log('🔍 Debug - admin_role:', adminRole);
    console.log('🔍 Debug - user is authenticated:', anyClaims?.role === 'authenticated');
    
    // Only allow access if admin_role is exactly "admin"
    const isAdmin = adminRole === 'admin';
    
    console.log('🔍 Debug - isAdmin:', isAdmin);
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const supabase = createClient();
    // Fetch all customers directly using the server-side client
    const { data: customers, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching customers:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(customers);
    
  } catch (error: any) {
    console.error('GET /api/customers/all error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 