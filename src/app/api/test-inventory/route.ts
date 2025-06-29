import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { auth } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const anyClaims = sessionClaims as any;
    const adminRole = anyClaims?.public_metadata?.admin_role || anyClaims?.admin_role;
    
    const supabase = createClient();
    
    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from("product_inventory")
      .select("count")
      .limit(1);
    
    if (testError) {
      console.error('Database connection error:', testError);
      return NextResponse.json({ 
        error: 'Database connection failed', 
        details: testError.message,
        adminRole,
        userId 
      }, { status: 500 });
    }
    
    // Test low stock view
    const { data: viewData, error: viewError } = await supabase
      .from("low_stock_products")
      .select("count")
      .limit(1);
    
    return NextResponse.json({
      success: true,
      adminRole,
      userId,
      hasAdminRole: adminRole === 'admin',
      databaseConnected: !testError,
      viewExists: !viewError,
      testData,
      viewData
    });
    
  } catch (error: any) {
    console.error('Test inventory error:', error);
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
} 