// app/api/customers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  getCustomerProfile,
  updateCustomerProfile,
  createOrUpdateCustomer,
  getAllCustomers,
} from '@/utils/supabase/client';
import { createClient } from '@/utils/supabase/server';

// GET /api/customers - Admin only endpoint to get all customers
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
    const customers = await getAllCustomers(supabase);
    
    return NextResponse.json(customers);
    
  } catch (error: any) {
    console.error('GET /api/customers error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/customers - Update customer profile (admin only)
export async function PUT(req: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin role
    const anyClaims = sessionClaims as any;
    const isAdmin = anyClaims?.metadata?.role === 'admin' || 
                   anyClaims?.role === 'admin';
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { customerId, ...updates } = await req.json();
    
    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
    }

    const supabase = createClient();
    const customer = await updateCustomerProfile(supabase, customerId, updates);
    
    return NextResponse.json(customer);
    
  } catch (error: any) {
    console.error('PUT /api/customers error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/customers - Create new customer (admin only)
export async function POST(req: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin role
    const anyClaims = sessionClaims as any;
    const isAdmin = anyClaims?.metadata?.role === 'admin' || 
                   anyClaims?.role === 'admin';
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const data = await req.json();
    const supabase = createClient();
    
    const customer = await createOrUpdateCustomer(supabase, data);
    
    return NextResponse.json(customer);
    
  } catch (error: any) {
    console.error('POST /api/customers error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}