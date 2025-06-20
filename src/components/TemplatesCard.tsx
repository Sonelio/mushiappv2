'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface TemplatesCardProps {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  canvaUrl: string;
  price: number;
  author: string;
  isSaved?: boolean;
  onToggleSave?: () => void;
}

export default function TemplatesCard({
  id,
  title,
  description,
  imageUrl,
  canvaUrl,
  price,
  author,
  isSaved = false,
  onToggleSave
}: TemplatesCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isClicked, setIsClicked] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on a mobile device
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Set initial value
    handleResize();
    
    // Add event listener
    window.addEventListener("resize", handleResize);
    
    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle click outside to close overlay
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isClicked && !target.closest('.template-card-content')) {
        setIsClicked(false);
      }
    };

    if (isMobile && isClicked) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isClicked, isMobile]);

  const handleClick = (e: React.MouseEvent) => {
    if (isMobile) {
      e.preventDefault();
      e.stopPropagation();
      setIsClicked(!isClicked);
    }
  };

  const handleCanvaClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canvaUrl) {
      window.open(canvaUrl, '_blank');
      if (isMobile) {
        setIsClicked(false);
      }
    }
  };

  return (
    <div className="relative group rounded-[20px] overflow-hidden shadow-lg bg-[#181818] aspect-square">
      <style jsx>{`
        @media (min-width: 1024px) and (max-width: 1279px) {
          .template-button {
            height: 42px !important;
            font-size: 16px !important;
            padding-left: 20px !important;
            padding-right: 20px !important;
          }
          .save-button {
            height: 38px !important;
            width: 38px !important;
          }
          .save-icon {
            width: 14px !important;
            height: 14px !important;
          }
        }
      `}</style>
      <div className="template-card-content relative w-full h-full overflow-hidden cursor-pointer" onClick={handleClick}>
        {!imageError && imageUrl ? (
          <>
            {isLoading && (
              <div className="absolute inset-0 bg-[#181818] flex items-center justify-center z-10">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
              </div>
            )}
            <img 
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setImageError(true);
                setIsLoading(false);
              }}
            />
            
            {/* Hover/Click Overlay */}
            <div
              className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                isMobile 
                  ? isClicked ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                  : 'opacity-0 group-hover:opacity-100 pointer-events-auto'
              }`}
              style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
              onClick={(e) => {
                e.stopPropagation();
                if (isMobile) {
                  setIsClicked(false);
                }
              }}
            >
              <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={handleCanvaClick}
                  className="template-button bg-[#222222] text-white px-4 sm:px-4 lg:px-6 py-3 sm:py-2 lg:py-2 rounded-[15px] text-[18px] sm:text-[16px] lg:text-[20px] font-semibold hover:bg-[#222222]/80 transition-colors cursor-pointer h-[50px] sm:h-[45px] lg:h-[50px] whitespace-nowrap"
                >
                  Open in Canva
                </button>
                {onToggleSave && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onToggleSave();
                      if (isMobile) {
                        setIsClicked(false);
                      }
                    }}
                    className="save-button bg-[#222222] text-white rounded-[15px] hover:bg-[#222222]/80 transition-colors cursor-pointer h-[40px] sm:h-[45px] lg:h-[50px] w-[40px] sm:w-[45px] lg:w-[50px] flex items-center justify-center"
                  >
                    <img
                      src={isSaved ? "/icons/hover-icon-scs.png" : "/icons/hover-icon.png"}
                      alt={isSaved ? "Saved" : "Save"}
                      className="save-icon w-4 h-4"
                    />
                  </button>
                )}
              </div>
            </div>
          </>
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
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
} 