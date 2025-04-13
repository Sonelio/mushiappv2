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

interface UserData {
  id: string;
  savedTemplates: string[];
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
  const [savedTemplatesLoaded, setSavedTemplatesLoaded] = useState(false);
  const [visibleCount, setVisibleCount] = useState(20);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const supabase = useRef(createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )).current;

  // Reset visibleCount when filters change
  useEffect(() => {
    setVisibleCount(20);
  }, [selectedIndustry, selectedFormat, selectedLanguage, sortOption]);

  // Load saved templates from localStorage first
  useEffect(() => {
    try {
      console.log("Loading from localStorage on mount");
      const savedFromStorage = localStorage.getItem('userSavedTemplates');
      if (savedFromStorage) {
        console.log("Found saved templates in localStorage:", savedFromStorage);
        const parsed = JSON.parse(savedFromStorage);
        if (Array.isArray(parsed)) {
          console.log("Setting userSavedTemplates from localStorage:", parsed);
          setUserSavedTemplates(parsed);
        }
      } else {
        console.log("No saved templates found in localStorage");
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    } finally {
      setSavedTemplatesLoaded(true);
    }
  }, []); // Only run on mount

  // Save to localStorage when templates change
  useEffect(() => {
    if (userSavedTemplates.length > 0) {
      console.log("Saving to localStorage:", userSavedTemplates);
      localStorage.setItem('userSavedTemplates', JSON.stringify(userSavedTemplates));
    }
  }, [userSavedTemplates]);

  // Main data loading effect - only runs after localStorage is loaded
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!savedTemplatesLoaded) {
        console.log("Waiting for saved templates to load from localStorage");
        return;
      }

      try {
        setIsLoading(true);
        
        // Check authentication
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          router.push('/login');
          return;
        }

        // Fetch templates
        const { data: templatesData, error: templatesError } = await supabase
          .from('templates')
          .select('*')
          .order('savedCount', { ascending: false });

        if (templatesError) {
          throw new Error(templatesError.message);
        }

        // Transform templates
        if (templatesData && isMounted) {
          const transformedTemplates = await Promise.all(templatesData.map(async template => {
            if (!template.imageUrl) {
              return { ...template, imageUrl: '/mushi-logo.png' };
            }

            if (template.imageUrl.startsWith('http')) {
              return template;
            }

            try {
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

              return {
                ...template,
                imageUrl: urlData?.publicUrl || '/mushi-logo.png'
              };
            } catch (error) {
              return { ...template, imageUrl: '/mushi-logo.png' };
            }
          }));

          if (isMounted) {
            setTemplates(transformedTemplates);
            setIsLoading(false);
          }
        }
        
        // Initial DB sync only if localStorage is empty
        if (session?.user && isMounted && userSavedTemplates.length === 0) {
          try {
            const { data: userData } = await supabase
              .from('users')
              .select('savedTemplates')
              .eq('id', session.user.id)
              .single();

            if (userData?.savedTemplates && Array.isArray(userData.savedTemplates) && userData.savedTemplates.length > 0) {
              console.log("Initial load: Using DB templates as localStorage is empty:", userData.savedTemplates);
              setUserSavedTemplates(userData.savedTemplates);
            }
          } catch (error) {
            console.error('Error in initial DB sync:', error);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        if (isMounted) {
          setError('Failed to load data. Please try refreshing the page.');
          setIsLoading(false);
        }
      }
    };
    
    loadData();

    return () => {
      isMounted = false;
    };
  }, [router, supabase, savedTemplatesLoaded]); // Removed userSavedTemplates from dependencies

  // Toggle save template function
  const toggleSaveTemplate = async (templateId: string) => {
    try {
      console.log("Toggle save template:", templateId);
      const isSaved = userSavedTemplates.includes(templateId);
      console.log("Currently saved:", isSaved);
      
      // Update local state immediately
      const updatedSavedTemplates = isSaved
        ? userSavedTemplates.filter(id => id !== templateId)
        : [...userSavedTemplates, templateId];
      
      console.log("New saved templates:", updatedSavedTemplates);
      setUserSavedTemplates(updatedSavedTemplates);
      
      // Database update happens in the useEffect
      
      // Update template savedCount in local state
      const template = templates.find(t => t.id === templateId);
      if (template) {
        const newSavedCount = Math.max(0, (template.savedCount || 0) + (isSaved ? -1 : 1));
        setTemplates(templates.map(t => 
          t.id === templateId 
            ? { ...t, savedCount: newSavedCount }
            : t
        ));
      }
      
      // Also try to update the database if we're logged in
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const userId = session.user.id;
        
        // Try to update or create user
        try {
          const { error } = await supabase
            .from('users')
            .upsert({ 
              id: userId,
              savedTemplates: updatedSavedTemplates 
            });
            
          if (error) throw error;
          
          // Update template savedCount in database
          if (template) {
            const newSavedCount = Math.max(0, (template.savedCount || 0) + (isSaved ? -1 : 1));
            await supabase
              .from('templates')
              .update({ savedCount: newSavedCount })
              .eq('id', templateId);
          }
        } catch (dbError) {
          console.error('Database update failed, but local storage is updated:', dbError);
        }
      }
      
      setError(null);
    } catch (error) {
      console.error('Error in toggleSaveTemplate:', error);
      setError('Failed to update save status, but we saved locally.');
    }
  };

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