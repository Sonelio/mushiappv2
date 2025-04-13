"use client";

import { useState, useEffect, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import TemplatesCard from '@/components/TemplatesCard';
import FilterBar from '@/components/FilterBar';

interface Template {
  id: string;
  title: string;
  canvaUrl: string;
  category: string;
  format: string;
  imageUrl: string;
  language: string;
  popularity: number;
  savedCount: number;
  createdAt: string;
}

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<string[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<string[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState("popular");
  const [userSavedTemplates, setUserSavedTemplates] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(20);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Reset visibleCount when filters change
  useEffect(() => {
    setVisibleCount(20);
  }, [selectedIndustry, selectedFormat, selectedLanguage, sortOption]);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        router.push('/login');
        return;
      }
    };
    
    checkAuth();
  }, [router, supabase.auth]);

  // Fetch templates and user's saved templates
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        
        // Get user session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/login');
          return;
        }
        
        // Fetch templates
        const { data: templatesData, error: templatesError } = await supabase
          .from('templates')
          .select('*');

        if (templatesError) {
          setError(templatesError.message);
          throw templatesError;
        }

        if (!templatesData) {
          setTemplates([]);
          return;
        }

        // Fetch user's saved templates
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('savedTemplates')
          .eq('id', session.user.id)
          .single();

        if (userError) {
          // If user doesn't exist, create a new user record
          const { error: insertError } = await supabase
            .from('users')
            .insert([{ 
              id: session.user.id,
              savedTemplates: [] 
            }]);
            
          if (insertError) {
            console.error('Error creating user:', insertError);
          }
          setUserSavedTemplates([]);
        } else {
          setUserSavedTemplates(userData.savedTemplates || []);
        }

        // Transform the templates to get public URLs for images
        const transformedTemplates = await Promise.all(templatesData.map(async template => {
          if (template.imageUrl) {
            try {
              if (template.imageUrl.startsWith('http')) {
                return template;
              }

              let fileName = template.imageUrl;
              if (fileName.startsWith('templates/')) {
                fileName = fileName.substring('templates/'.length);
              }
              fileName = fileName.split('?')[0];
              fileName = fileName.trim().replace(/^\/+|\/+$/g, '');
              
              const { data: urlData } = supabase
                .storage
                .from('templates')
                .getPublicUrl(fileName);

              if (urlData?.publicUrl) {
                template.imageUrl = urlData.publicUrl;
              } else {
                template.imageUrl = '/mushi-logo.png';
              }
            } catch (error) {
              template.imageUrl = '/mushi-logo.png';
            }
          } else {
            template.imageUrl = '/mushi-logo.png';
          }
          return template;
        }));

        setTemplates(transformedTemplates);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred while fetching data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [supabase, router]);

  // Filter and sort templates
  const filteredAndSortedTemplates = templates.filter(template => {
    const industryMatch = selectedIndustry.length === 0 || selectedIndustry.includes(template.category.toUpperCase());
    const formatMatch = selectedFormat.length === 0 || selectedFormat.includes(template.format);
    const languageMatch = selectedLanguage.length === 0 || selectedLanguage.includes(template.language.toUpperCase());
    const savedMatch = sortOption === "saved" ? userSavedTemplates.includes(template.id) : true;
    return industryMatch && formatMatch && languageMatch && savedMatch;
  }).sort((a, b) => {
    switch (sortOption) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "saved":
        const aIndex = userSavedTemplates.indexOf(a.id);
        const bIndex = userSavedTemplates.indexOf(b.id);
        return bIndex - aIndex;
      case "popular":
      default:
        return (b.savedCount || 0) - (a.savedCount || 0);
    }
  });

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !isLoadingMore) {
          setIsLoadingMore(true);
          // Use setTimeout to prevent rapid multiple triggers
          setTimeout(() => {
            setVisibleCount((prev) => {
              const next = prev + 20;
              setIsLoadingMore(false);
              return next;
            });
          }, 500);
        }
      },
      { 
        rootMargin: '100px',
        threshold: 0.1 
      }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [isLoadingMore, filteredAndSortedTemplates.length]);

  // Get visible templates
  const visibleTemplates = filteredAndSortedTemplates.slice(0, visibleCount);
  const hasMore = visibleCount < filteredAndSortedTemplates.length;

  // Toggle save template function
  const toggleSaveTemplate = async (templateId: string) => {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error("Session error:", sessionError);
        setError("Authentication error. Please log in again.");
        return;
      }
      
      if (!sessionData.session?.user) {
        setError('Please log in to save templates');
        return;
      }

      const userId = sessionData.session.user.id;
      const isSaved = userSavedTemplates.includes(templateId);
      
      // Update user's saved templates locally first
      const updatedSavedTemplates = isSaved
        ? userSavedTemplates.filter(id => id !== templateId)
        : [...userSavedTemplates, templateId];
      
      // Directly update local state
      setUserSavedTemplates(updatedSavedTemplates);
      
      // Update local template display 
      setTemplates(templates.map(t => 
        t.id === templateId 
          ? { ...t, savedCount: Math.max(0, (t.savedCount || 0) + (isSaved ? -1 : 1)) }
          : t
      ));
      
      // Now try to persist the changes to the database
      try {
        // First attempt to update the user's savedTemplates
        const { data: userData, error: userFetchError } = await supabase
          .from('users')
          .select('id, savedTemplates')
          .eq('id', userId)
          .single();
          
        if (userFetchError) {
          // User doesn't exist, try to create new user
          const { error: insertError } = await supabase
            .from('users')
            .insert([{ 
              id: userId,
              savedTemplates: updatedSavedTemplates 
            }]);
            
          if (insertError) {
            throw new Error(`Failed to create user record: ${insertError.message}`);
          }
        } else {
          // User exists, update savedTemplates
          const { error: updateError } = await supabase
            .from('users')
            .update({ savedTemplates: updatedSavedTemplates })
            .eq('id', userId);
            
          if (updateError) {
            throw new Error(`Failed to update user's saved templates: ${updateError.message}`);
          }
        }
        
        // Now try to update the template's savedCount
        const template = templates.find(t => t.id === templateId);
        if (!template) {
          throw new Error(`Template ${templateId} not found`);
        }
        
        const newSavedCount = Math.max(0, (template.savedCount || 0) + (isSaved ? -1 : 1));
        
        // Update template savedCount
        const { error: templateError } = await supabase
          .from('templates')
          .update({ savedCount: newSavedCount })
          .eq('id', templateId);
          
        if (templateError) {
          console.warn(`Note: Failed to update template savedCount: ${templateError.message}`);
        }
        
        // Clear any existing error
        setError(null);
      } catch (error) {
        console.error('Error in toggleSaveTemplate:', error);
        setError('Failed to update save status. Please try again.');
        
        // Revert local state changes on error
        setUserSavedTemplates(userSavedTemplates);
        setTemplates(templates);
      }
    } catch (mainError) {
      console.error('Error in toggleSaveTemplate:', mainError);
      setError('Failed to update save status. Please try again.');
      
      // Revert local state changes on error
      setUserSavedTemplates(userSavedTemplates);
      setTemplates(templates);
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-white relative pt-6" style={{ background: "#000000" }}>
      <style jsx>{`
        @media (min-width: 1600px) {
          .template-grid {
            grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
          }
        }
        @media (min-width: 1280px) and (max-width: 1599px) {
          .template-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
          }
        }
        @media (min-width: 1024px) and (max-width: 1279px) {
          .template-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
          }
        }
      `}</style>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 px-4 py-2 md:pt-2 pt-4">
        {error && (
          <div className="text-red-500 text-center mb-8">
            Error: {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#1D6D1E] border-t-transparent"></div>
          </div>
        ) : filteredAndSortedTemplates.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <p className="text-xl">No templates found</p>
          </div>
        ) : (
          <>
            <div className="template-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {visibleTemplates.map((template) => (
                <TemplatesCard
                  key={template.id}
                  id={template.id}
                  title={template.title}
                  description={template.category}
                  imageUrl={template.imageUrl}
                  canvaUrl={template.canvaUrl}
                  price={0}
                  author={template.language}
                  isSaved={userSavedTemplates.includes(template.id)}
                  onToggleSave={() => toggleSaveTemplate(template.id)}
                />
              ))}
            </div>
            
            {hasMore && (
              <div 
                ref={loadMoreRef} 
                className="flex justify-center items-center py-8 mt-4"
              >
                {isLoadingMore ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#1D6D1E] border-t-transparent"></div>
                ) : (
                  <button
                    onClick={() => {
                      setIsLoadingMore(true);
                      setVisibleCount(prev => prev + 20);
                      setIsLoadingMore(false);
                    }}
                    className="bg-[#1D6D1E] text-white px-6 py-2 rounded-[15px] text-[20px] font-semibold hover:bg-[#1D6D1E]/80 transition-colors"
                  >
                    Load More
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Filter Bar Component */}
      <FilterBar
        selectedIndustry={selectedIndustry}
        setSelectedIndustry={setSelectedIndustry}
        selectedFormat={selectedFormat}
        setSelectedFormat={setSelectedFormat}
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={setSelectedLanguage}
        sortOption={sortOption}
        setSortOption={setSortOption}
        totalResults={filteredAndSortedTemplates.length}
      />
    </div>
  );
} 