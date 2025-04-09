"use client";

export default function MembershipPage() {
  // ... existing code ...

  return (
    <div
      className="min-h-screen flex flex-col text-white relative pt-6"
      style={{
        background: "#000000"
      }}
    >
      <style jsx>{`
        @media (min-width: 1280px) and (max-width: 1440px) {
          .template-grid {
            grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
          }
        }
      `}</style>
      {/* MAIN CONTENT AREA */}
      <main className="flex-1 px-4 py-2 md:pt-2 pt-4">
        <div className="template-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
          {sortedTemplates.slice(0, visibleTemplates).map((item, index) => {
            // ... existing template card code ...
          })}
          {sortedTemplates.length === 0 && (
            <p className="text-gray-400 text-center col-span-full">
              No templates found.
            </p>
          )}
        </div>

        {/* Loading indicator */}
        {isLoadingMore && (
          <div className="flex justify-center mt-6">
            <div className="text-white">Loading more templates...</div>
          </div>
        )}

        {/* Fallback "Load More" button */}
        {!isLoadingMore && visibleTemplates < sortedTemplates.length && (
          <div className="flex justify-center mt-6 pb-20">
            <button 
              onClick={loadMore}
              className="bg-[#0e1814] hover:bg-[#0e1814]/80 text-white px-4 py-2 rounded-md"
            >
              Load More ({sortedTemplates.length - visibleTemplates} remaining)
            </button>
          </div>
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
        totalResults={sortedTemplates.length}
      />
    </div>
  );
} 