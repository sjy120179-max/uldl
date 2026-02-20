import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    // Fetch upload by code
    const { data, error } = await supabase
      .from('uploads')
      .select('*')
      .eq('code', code)
      .gt('expires_at', new Date().toISOString()) // Only get non-expired files
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Invalid code or file not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Download failed' }, { status: 500 });
  }
}
