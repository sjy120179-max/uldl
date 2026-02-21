'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Tables } from '@/lib/supabase/database.types';
import Image from 'next/image';
import { FileText, Image as ImageIcon, Type, LogOut, Copy, Download, Trash2 } from 'lucide-react';
import { GradientUploadInput } from '@/components/ui/gradient-upload-input';

type Upload = Tables<'uploads'>;

export default function DashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const supabase = createClient();

  const ITEMS_PER_PAGE = 10;

  // Redirect if not logged in (but not during sign out)
  useEffect(() => {
    if (!authLoading && !user && !isSigningOut) {
      router.push('/auth');
    }
  }, [user, authLoading, router, isSigningOut]);

  // Fetch uploads
  const fetchUploads = useCallback(async (pageNum: number) => {
    if (!user) return;

    try {
      setLoading(true);
      const from = pageNum * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, error } = await supabase
        .from('uploads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Error fetching uploads:', error);
        return;
      }

      if (data.length < ITEMS_PER_PAGE) {
        setHasMore(false);
      }

      setUploads(prev => pageNum === 0 ? data : [...prev, ...data]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  // Initial load
  useEffect(() => {
    if (user) {
      fetchUploads(0);
    }
  }, [user, fetchUploads]);

  // Infinite scroll
  useEffect(() => {
    if (!hasMore || loading) return;

    const handleObserver = (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting) {
        setPage(prev => {
          const nextPage = prev + 1;
          fetchUploads(nextPage);
          return nextPage;
        });
      }
    };

    observerRef.current = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
    });

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loading, fetchUploads]);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
      setIsSigningOut(false);
    }
  };

  const handleUpload = async (message: string, file?: File) => {
    if (!user || (!message.trim() && !file)) return;

    try {
      setUploading(true);

      // Check total storage limit (999MB)
      if (file) {
        const { data: totalBytes } = await supabase.rpc('get_total_storage_bytes');
        const MAX_STORAGE_BYTES = 990 * 1024 * 1024;
        if ((totalBytes ?? 0) >= MAX_STORAGE_BYTES) {
          alert('Storage limit exceeded (990MB). Please try again later.');
          return;
        }
      }

      let fileUrl: string | null = null;
      let fileName: string | null = null;
      let thumbnailUrl: string | null = null;
      let uploadType: 'file' | 'image' | 'text' = 'text';

      // Upload file to Supabase Storage if present
      if (file) {
        const fileExt = file.name.split('.').pop();
        const filePath = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('uploads')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Error uploading file:', uploadError);
          alert('Failed to upload file');
          return;
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

      // Insert into database
      const { error: dbError } = await supabase
        .from('uploads')
        .insert({
          user_id: user.id,
          type: uploadType,
          filename: fileName,
          url: fileUrl,
          text_content: message.trim() || null,
          thumbnail_url: thumbnailUrl,
        });

      if (dbError) {
        console.error('Error saving to database:', dbError);
        alert('Failed to save upload');
        return;
      }

      // Refresh the list
      setPage(0);
      setHasMore(true);
      await fetchUploads(0);
    } catch (error) {
      console.error('Error:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    } catch (error) {
      console.error('Error copying:', error);
      alert('Failed to copy');
    }
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download error:', error);
      window.open(url, '_blank');
    }
  };

  const handleDelete = async (upload: Upload) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      // Delete file from storage if exists
      if (upload.url) {
        const path = upload.url.split('/uploads/')[1];
        if (path) {
          await supabase.storage.from('uploads').remove([path]);
        }
      }

      // Delete from database
      const { error } = await supabase
        .from('uploads')
        .delete()
        .eq('id', upload.id);

      if (error) {
        console.error('Error deleting:', error);
        alert('Failed to delete');
        return;
      }

      // Remove from local state
      setUploads(prev => prev.filter(u => u.id !== upload.id));
    } catch (error) {
      console.error('Error:', error);
      alert('Delete failed');
    }
  };

  const getThumbnail = (upload: Upload) => {
    if (upload.thumbnail_url) {
      return upload.thumbnail_url;
    }
    if (upload.type === 'image' && upload.url) {
      return upload.url;
    }
    return null;
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'file':
        return <FileText className="w-6 h-6" />;
      case 'image':
        return <ImageIcon className="w-6 h-6" />;
      case 'text':
        return <Type className="w-6 h-6" />;
      default:
        return <FileText className="w-6 h-6" />;
    }
  };

  if (authLoading || (loading && page === 0)) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: '1280px' }}>
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Image
                src="/uldl_icon_0.png"
                alt="AnyDrop Icon"
                width={40}
                height={40}
                className="w-10 h-10 object-contain"
              />
              <h1 className="text-xl font-bold text-foreground">AnyDrop</h1>
            </Link>

            {/* User Info & Actions */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-foreground">{user.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground hover:text-foreground/80 transition-colors rounded-md hover:bg-accent"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ maxWidth: '800px', width: '100%' }}>
        {/* Upload Area */}
        <div className="mb-8 flex justify-center">
          <GradientUploadInput
            onSubmit={handleUpload}
            maxFileSize={10}
            disabled={uploading}
            placeholder="Upload file or enter text..."
          />
        </div>
        {uploading && (
          <div className="text-center text-sm text-muted-foreground mb-4">
            Uploading...
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">My Files</h2>
          <p className="text-muted-foreground">Manage and view all your uploaded content</p>
        </div>

        {/* Upload List */}
        {uploads.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FileText className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No uploads yet</h3>
            <p className="text-muted-foreground">Start uploading files, images, or text to see them here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {uploads.map((upload) => {
              const thumbnail = getThumbnail(upload);
              const hasText = upload.text_content && upload.text_content.trim();
              const hasFile = upload.filename;

              return (
                <div
                  key={upload.id}
                  className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card hover:bg-accent transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="flex-shrink-0 w-16 h-16 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                    {thumbnail ? (
                      <Image
                        src={thumbnail}
                        alt={upload.filename || 'Upload'}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-muted-foreground">
                        {getIcon(upload.type)}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {hasText && (
                      <p className="text-sm text-foreground mb-1 whitespace-pre-wrap break-words">
                        {upload.text_content}
                      </p>
                    )}
                    {hasFile && (
                      <h3 className="text-sm font-medium text-foreground truncate">
                        {upload.filename}
                      </h3>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground capitalize">
                        {upload.type}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(upload.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {/* Copy button for text */}
                    {hasText && (
                      <button
                        onClick={() => handleCopy(upload.text_content!)}
                        className="p-2 rounded-md hover:bg-muted transition-colors"
                        title="Copy text"
                      >
                        <Copy className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                      </button>
                    )}

                    {/* Download button for files */}
                    {hasFile && upload.url && (
                      <button
                        onClick={() => handleDownload(upload.url!, upload.filename!)}
                        className="p-2 rounded-md hover:bg-muted transition-colors"
                        title="Download file"
                      >
                        <Download className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                      </button>
                    )}

                    {/* Delete button */}
                    <button
                      onClick={() => handleDelete(upload)}
                      className="p-2 rounded-md hover:bg-destructive/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Loading More Indicator */}
        {hasMore && (
          <div ref={loadMoreRef} className="flex justify-center py-8">
            {loading && <div className="text-muted-foreground">Loading more...</div>}
          </div>
        )}
      </main>
    </div>
  );
}
