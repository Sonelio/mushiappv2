'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createBrowserClient } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';
import { useUser } from '@/components/providers/user-provider';

interface UpdateUserData {
  name: string;
  surname: string;
  email: string;
  photoUrl?: string;
}

export default function AccountPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const router = useRouter();
  const { user, loading } = useUser();
  const [formData, setFormData] = useState<UpdateUserData>({
    name: '',
    surname: '',
    email: '',
    photoUrl: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      const [firstName = '', lastName = ''] = (user.user_metadata?.full_name || '').split(' ');
      setFormData({
        name: firstName,
        surname: lastName,
        email: user.email || '',
        photoUrl: user.user_metadata?.avatar_url || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return; // Prevent double submission
    
    setIsLoading(true);
    setMessage(null);

    try {
      const fullName = `${formData.name} ${formData.surname}`.trim();
      
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to update profile. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setMessage({ 
        type: 'error', 
        text: 'File size too large. Please upload an image smaller than 5MB.' 
      });
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setMessage({ 
        type: 'error', 
        text: 'Invalid file type. Please upload a JPEG, PNG, or GIF image.' 
      });
      return;
    }

    setIsUploading(true);
    setMessage(null);

    try {
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar-${Date.now()}.${fileExt}`;

      // First, try to upload the file
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error('Failed to upload image to storage');
      }

      // Get the public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      if (!data?.publicUrl) {
        throw new Error('Failed to get image URL');
      }

      // Update user metadata with the new URL
      const { error: updateError } = await supabase.auth.updateUser({
        data: { 
          avatar_url: data.publicUrl,
          avatar_file: fileName // Store filename for future reference
        }
      });

      if (updateError) {
        console.error('User update error:', updateError);
        throw new Error('Failed to update profile with new image');
      }

      // Update local state
      setFormData(prev => ({ ...prev, photoUrl: data.publicUrl }));
      setMessage({ type: 'success', text: 'Photo uploaded successfully!' });
    } catch (error) {
      console.error('Complete upload error:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to upload photo. Please try again.' 
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!user) {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen flex items-start justify-center bg-black pt-20" style={{
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      <div className="w-[480px] bg-transparent p-8 pt-0 rounded-[30px] shadow-xl">
        <div className="text-center mb-6">
          <div className="relative w-32 h-32 mx-auto mb-4 group">
            <div className="w-full h-full rounded-[15px] overflow-hidden bg-[#10221B] relative">
              {formData.photoUrl ? (
                <Image
                  src={formData.photoUrl}
                  alt="Profile"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                  unoptimized={true}
                  priority
                  onError={() => {
                    console.error('Failed to load profile image:', formData.photoUrl);
                    setFormData(prev => ({ ...prev, photoUrl: '' }));
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-16 w-16" 
                    fill="none" 
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                    />
                  </svg>
                </div>
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                </div>
              )}
            </div>
            <label className="absolute inset-0 bg-black bg-opacity-50 rounded-[15px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer flex items-center justify-center">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={isUploading}
                className="hidden"
              />
              <Image
                src="/icons/profile-update.png"
                alt="Upload profile photo"
                width={48}
                height={48}
                priority
                className="w-12 h-12"
              />
            </label>
          </div>
          <h2 className="text-[35px] md:text-[45px] font-semibold text-white mb-6">Account Settings</h2>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg text-sm ${
            message.type === 'success' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="text-white text-[20px] mb-2">Name</div>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Name"
              className="w-full px-4 py-3 text-[20px] rounded bg-[#10221B] rounded-[10px] border-0 text-white placeholder-[#667B66] focus:ring-2 focus:ring-[#1D6D1E] focus:outline-none"
            />
          </div>

          <div>
            <div className="text-white text-[20px] mb-2">Surname</div>
            <input
              type="text"
              id="surname"
              value={formData.surname}
              onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
              placeholder="Surname"
              className="w-full px-4 py-3 text-[20px] rounded bg-[#10221B] rounded-[10px] border-0 text-white placeholder-[667B66] focus:ring-2 focus:ring-[#1D6D1E] focus:outline-none"
            />
          </div>

          <div>
            <div className="text-white text-[20px] mb-2">Email</div>
            <input
              type="email"
              id="email"
              value={formData.email}
              disabled
              className="w-full px-4 py-3 text-[20px] rounded bg-[#10221B] rounded-[10px] border-0 text-white opacity-100 cursor-not-allowed"
              placeholder="Email"
            />
          </div>

          <div className="flex gap-4 mt-8">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 px-4 bg-[#1D6D1E] text-white text-[20px] md:text-[35px] rounded-[10px] transition-colors font-semibold"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex-1 py-3 px-4 bg-white text-[#1D6D1E] text-[20px] md:text-[35px] rounded-[10px] transition-colors font-semibold"
            >
              Sign Out
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 