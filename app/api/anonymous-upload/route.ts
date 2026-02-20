import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const formData = await request.formData();

    const file = formData.get('file') as File | null;
    const text = formData.get('text') as string | null;
    const code = formData.get('code') as string;

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    if (!file && !text) {
      return NextResponse.json({ error: 'File or text is required' }, { status: 400 });
    }

    let fileUrl: string | null = null;
    let fileName: string | null = null;
    let thumbnailUrl: string | null = null;
    let uploadType: 'file' | 'image' | 'text' = 'text';

    // Upload file to Supabase Storage if present
    if (file) {
      const fileExt = file.name.split('.').pop();
      const filePath = `anonymous/${code}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
      }

      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath);

      fileUrl = publicUrl;
      fileName = file.name;

      // Determine type
      if (file.type.startsWith('image/')) {
        uploadType = 'image';
        thumbnailUrl = publicUrl;
      } else {
        uploadType = 'file';
      }
    }

    // Calculate expiration time (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Insert into database
    const { error: dbError } = await supabase
      .from('uploads')
      .insert({
        user_id: null, // Anonymous upload
        type: uploadType,
        filename: fileName,
        url: fileUrl,
        text_content: text || null,
        thumbnail_url: thumbnailUrl,
        code: code,
        expires_at: expiresAt.toISOString(),
      });

    if (dbError) {
      console.error('Error saving to database:', dbError);
      return NextResponse.json({ error: 'Failed to save upload' }, { status: 500 });
    }

    return NextResponse.json({ code, success: true });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
