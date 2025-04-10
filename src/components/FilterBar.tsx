"use client";

import { useState, useEffect, useRef } from 'react';

interface FilterBarProps {
  selectedIndustry: string[];
  setSelectedIndustry: (value: string[]) => void;
  selectedFormat: string[];
  setSelectedFormat: (value: string[]) => void;
  selectedLanguage: string[];
  setSelectedLanguage: (value: string[]) => void;
  sortOption: string;
  setSortOption: (value: string) => void;
  totalResults: number;
  embedded?: boolean;
}

export default function FilterBar({
  selectedIndustry,
  setSelectedIndustry,
  selectedFormat,
  setSelectedFormat,
  selectedLanguage,
  setSelectedLanguage,
  sortOption,
  setSortOption,
  totalResults,
  embedded = false,
}: FilterBarProps) {
  const [sortOpen, setSortOpen] = useState(false);
  const [desktopFilterOpen, setDesktopFilterOpen] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const filterPanelRef = useRef<HTMLDivElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);

  // Handle clicks outside the filter panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterOpen && 
          filterPanelRef.current && 
          filterButtonRef.current &&
          !filterPanelRef.current.contains(event.target as Node) &&
          !filterButtonRef.current.contains(event.target as Node)) {
        setFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [filterOpen]);

  // Handle clicks outside dropdowns for desktop
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const isFilterButton = target.closest('button');
      const isDropdown = target.closest('.filter-dropdown') || target.closest('.sort-dropdown');
      
      if (!isFilterButton && !isDropdown) {
        setSortOpen(false);
        setDesktopFilterOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Modified click handlers for industry
  const handleIndustryClick = (industry: string) => {
    if (selectedIndustry.includes(industry)) {
      setSelectedIndustry(selectedIndustry.filter(i => i !== industry));
    } else {
      setSelectedIndustry([...selectedIndustry, industry]);
    }
  };

  // Modified click handlers for format
  const handleFormatClick = (format: string) => {
    if (selectedFormat.includes(format)) {
      setSelectedFormat(selectedFormat.filter(f => f !== format));
    } else {
      setSelectedFormat([...selectedFormat, format]);
    }
  };

  // Modified click handlers for language
  const handleLanguageClick = (language: string) => {
    if (selectedLanguage.includes(language)) {
      setSelectedLanguage(selectedLanguage.filter(l => l !== language));
    } else {
      setSelectedLanguage([...selectedLanguage, language]);
    }
  };

  return (
    <>
      {/* Mobile Bottom Bar */}
      <div className="md:hidden fixed bottom-4 left-0 right-0 flex justify-between items-center z-20 w-full">
        <div className="flex items-center gap-[14px] mx-4">
          <button
            ref={filterButtonRef}
            onClick={() => setFilterOpen(!filterOpen)}
            className="bg-[#11231C] text-white w-[280px] h-[60px] rounded-lg flex items-center justify-end pr-6 relative"
          >
            <img 
              src={filterOpen ? "/icons/mobile-filter2.png" : "/icons/mobile-filter1.png"}
              alt="Filter icon"
              className="md:hidden w-6 h-6 object-contain absolute left-5"
            />
            <span className="uppercase text-2xl font-semibold">
              Filters & Sort
            </span>
          </button>

          <button
            onClick={() => window.open('mailto:support@example.com')}
            className="bg-[#11231C] text-white w-[64px] h-[60px] rounded-lg flex items-center justify-center"
          >
            <img
              src="/icons/mobile-support1.png"
              alt="Support icon"
              className="w-10 h-10 object-contain"
            />
          </button>
        </div>

        {/* MOBILE FILTER PANEL */}
        <div 
          ref={filterPanelRef}
          className={`md:hidden absolute bottom-full left-0 right-0 bg-[#11231C] z-30 transition-all duration-300 shadow-lg rounded-xl mx-4 ${
            filterOpen ? 'opacity-100 translate-y-0 mb-4' : 'opacity-0 translate-y-1/4 pointer-events-none'
          }`}
          style={{ maxHeight: "80vh" }}
        >
          <div className="p-4 overflow-y-auto flex flex-col" style={{ maxHeight: "calc(80vh - 40px)" }}>
            {/* Sort Section */}
            <div className="mb-6">
              <h3 className="text-2xl font-bold uppercase mb-4 text-center">Sort By</h3>
              <div className="flex items-center justify-between px-2">
                {["popular", "oldest", "newest", "saved"].map((option) => (
                  <button
                    key={option}
                    onClick={() => setSortOption(option)}
                    className={`px-3 py-2 text-[13px] font-bold uppercase rounded-lg ${
                      sortOption === option 
                        ? "bg-[#0C1813] text-white" 
                        : "bg-[#10221B] text-gray-300"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Industry Section */}
            <div className="mb-6">
              <h3 className="text-2xl font-bold uppercase mb-4 text-center">Industry</h3>
              <div className="flex flex-wrap gap-3 justify-center">
                {["FOOD", "DRINK", "FASHION", "BEAUTY", "HEALTH"].map((industry) => (
                  <button
                    key={industry}
                    onClick={() => handleIndustryClick(industry)}
                    className={`px-4 py-2 text-[15px] font-bold uppercase rounded-lg ${
                      selectedIndustry.includes(industry)
                        ? "bg-[#0C1813] text-white"
                        : "bg-[#10221B] text-gray-300"
                    }`}
                  >
                    {industry}
                  </button>
                ))}
              </div>
            </div>

            {/* Format and Language Section */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Format */}
              <div>
                <h3 className="text-2xl font-bold uppercase mb-4 text-center">Format</h3>
                <div className="flex gap-3 items-center justify-center">
                  {["Feed", "Story"].map((format) => (
                    <button
                      key={format}
                      onClick={() => handleFormatClick(format)}
                      className={`px-4 py-2 text-[15px] font-bold uppercase rounded-lg ${
                        selectedFormat.includes(format)
                          ? "bg-[#0C1813] text-white"
                          : "bg-[#10221B] text-gray-300"
                      }`}
                    >
                      {format}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div>
                <h3 className="text-2xl font-bold uppercase mb-4 text-center">Language</h3>
                <div className="flex gap-3 items-center justify-center">
                  {["LT", "EN"].map((language) => (
                    <button
                      key={language}
                      onClick={() => handleLanguageClick(language)}
                      className={`px-4 py-2 text-[15px] font-bold uppercase rounded-lg ${
                        selectedLanguage.includes(language)
                          ? "bg-[#0C1813] text-white"
                          : "bg-[#10221B] text-gray-300"
                      }`}
                    >
                      {language}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results count */}
            <div className="text-center -mt-6">
              <span className="text-[20px] font-semibold text-[#667B66]">
                {totalResults} results
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Filter Bar - Your existing desktop implementation */}
      <div className="fixed bottom-4 hidden md:flex justify-between z-20 w-full px-10" role="toolbar" aria-label="Template controls">
        {/* LEFT SIDE - Filters */}
        <div className="hidden md:flex items-center gap-2">
          {/* Industry Filter */}
          <div className="relative">
            <button
              onClick={() => setDesktopFilterOpen(prev => prev === 'industry' ? null : 'industry')}
              className="bg-[#10221B] text-white rounded-lg flex items-center"
              aria-expanded={desktopFilterOpen === 'industry'}
              aria-controls="industry-dropdown"
              style={{
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                width: "155px",
                height: "60px",
                paddingLeft: "13px",
                paddingRight: "14px",
                boxSizing: "border-box"
              }}
            >
              <div className="flex items-center" style={{flex: "1"}}>
                <span className="uppercase text-xl font-semibold">Industry</span>
              </div>
              <img 
                src="/icons/filter-bar1.svg"
                alt="Filter icon"
                className="w-4 h-4 object-contain"
                aria-hidden="true"
                style={{
                  marginLeft: "8px",
                  flexShrink: 0,
                  imageRendering: 'auto',
                  shapeRendering: 'geometricPrecision'
                }}
              />
            </button>
            
            {desktopFilterOpen === 'industry' && (
              <div className="filter-dropdown" style={{ width: "155px", position: "absolute", bottom: "100%", left: 0 }}>
                <div 
                  id="industry-dropdown"
                  className="w-full mb-2 bg-[#10221B] text-white rounded-lg shadow-lg z-30 overflow-hidden"
                  role="dialog"
                  aria-label="Industry options"
                  onClick={(e) => e.stopPropagation()}
                >
                  {["DRINK", "FOOD", "FASHION", "BEAUTY", "HEALTH"].map((industry) => (
                    <div
                      key={industry}
                      onClick={() => handleIndustryClick(industry)}
                      className={`cursor-pointer text-xl font-semibold text-left uppercase flex items-center justify-between ${
                        selectedIndustry.includes(industry)
                          ? "text-white"
                          : "text-gray-300 md:hover:bg-[#1a3429] md:hover:text-white"
                      }`}
                      style={{
                        display: "flex", 
                        justifyContent: "space-between", 
                        alignItems: "center",
                        paddingLeft: "13px",
                        paddingRight: "14px",
                        height: "40px"
                      }}
                    >
                      <span>{industry}</span>
                      <img 
                        src={selectedIndustry.includes(industry) ? "/icons/filter-bar2.svg" : "/icons/filter-bar3.svg"}
                        alt=""
                        className="w-4 h-4 object-contain"
                        style={{ 
                          imageRendering: 'auto',
                          shapeRendering: 'geometricPrecision'
                        }}
                        aria-hidden="true"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Format Filter */}
          <div className="relative">
            <button
              onClick={() => setDesktopFilterOpen(prev => prev === 'format' ? null : 'format')}
              className="bg-[#10221B] text-white rounded-lg flex items-center"
              aria-expanded={desktopFilterOpen === 'format'}
              aria-controls="format-dropdown"
              style={{
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                width: "140px",
                height: "60px",
                paddingLeft: "13px",
                paddingRight: "16px",
                boxSizing: "border-box"
              }}
            >
              <div className="flex items-center" style={{flex: "1"}}>
                <span className="uppercase text-xl font-semibold">Format</span>
              </div>
              <img 
                src="/icons/filter-bar1.svg"
                alt="Filter icon"
                className="w-4 h-4 object-contain"
                aria-hidden="true"
                style={{
                  marginLeft: "8px",
                  flexShrink: 0,
                  imageRendering: 'auto',
                  shapeRendering: 'geometricPrecision'
                }}
              />
            </button>
            
            {desktopFilterOpen === 'format' && (
              <div className="filter-dropdown" style={{ width: "140px", position: "absolute", bottom: "100%", left: 0 }}>
                <div 
                  id="format-dropdown"
                  className="w-full mb-2 bg-[#10221B] text-white rounded-lg shadow-lg z-30 overflow-hidden"
                  role="dialog"
                  aria-label="Format options"
                  onClick={(e) => e.stopPropagation()}
                >
                  {["Feed", "Story"].map((format) => (
                    <div
                      key={format}
                      onClick={() => handleFormatClick(format)}
                      className={`cursor-pointer text-xl font-semibold text-left uppercase flex items-center justify-between ${
                        selectedFormat.includes(format)
                          ? "text-white"
                          : "text-gray-300 md:hover:bg-[#1a3429] md:hover:text-white"
                      }`}
                      style={{
                        display: "flex", 
                        justifyContent: "space-between", 
                        alignItems: "center",
                        paddingLeft: "13px",
                        paddingRight: "16px",
                        height: "40px"
                      }}
                    >
                      <span>{format}</span>
                      <img 
                        src={selectedFormat.includes(format) ? "/icons/filter-bar2.svg" : "/icons/filter-bar3.svg"}
                        alt=""
                        className="w-4 h-4 object-contain"
                        style={{ 
                          imageRendering: 'auto',
                          shapeRendering: 'geometricPrecision'
                        }}
                        aria-hidden="true"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Language Filter */}
          <div className="relative">
            <button
              onClick={() => setDesktopFilterOpen(prev => prev === 'language' ? null : 'language')}
              className="bg-[#10221B] text-white rounded-lg flex items-center"
              aria-expanded={desktopFilterOpen === 'language'}
              aria-controls="language-dropdown"
              style={{
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                width: "175px",
                height: "60px",
                paddingLeft: "13px",
                paddingRight: "17px",
                boxSizing: "border-box"
              }}
            >
              <div className="flex items-center" style={{flex: "1"}}>
                <span className="uppercase text-xl font-semibold">Language</span>
              </div>
              <img 
                src="/icons/filter-bar1.svg"
                alt="Filter icon"
                className="w-4 h-4 object-contain"
                aria-hidden="true"
                style={{
                  marginLeft: "8px",
                  flexShrink: 0,
                  imageRendering: 'auto',
                  shapeRendering: 'geometricPrecision'
                }}
              />
            </button>
            
            {desktopFilterOpen === 'language' && (
              <div className="filter-dropdown" style={{ width: "175px", position: "absolute", bottom: "100%", left: 0 }}>
                <div 
                  id="language-dropdown"
                  className="w-full mb-2 bg-[#10221B] text-white rounded-lg shadow-lg z-30 overflow-hidden"
                  role="dialog"
                  aria-label="Language options"
                  onClick={(e) => e.stopPropagation()}
                >
                  {["LT", "EN"].map((language) => (
                    <div
                      key={language}
                      onClick={() => handleLanguageClick(language)}
                      className={`cursor-pointer text-xl font-semibold text-left uppercase flex items-center justify-between ${
                        selectedLanguage.includes(language)
                          ? "text-white"
                          : "text-gray-300 md:hover:bg-[#1a3429] md:hover:text-white"
                      }`}
                      style={{
                        display: "flex", 
                        justifyContent: "space-between", 
                        alignItems: "center",
                        paddingLeft: "13px",
                        paddingRight: "17px",
                        height: "40px"
                      }}
                    >
                      <span>{language}</span>
                      <img 
                        src={selectedLanguage.includes(language) ? "/icons/filter-bar2.svg" : "/icons/filter-bar3.svg"}
                        alt=""
                        className="w-4 h-4 object-contain"
                        style={{ 
                          imageRendering: 'auto',
                          shapeRendering: 'geometricPrecision'
                        }}
                        aria-hidden="true"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE - Sort and Results */}
        <div className="hidden md:flex items-center gap-2">
          <div 
            className="bg-[#10221B] rounded-[10px] flex items-center px-4"
            style={{
              width: "280px",
              height: "60px",
              paddingLeft: "13px",
              paddingRight: "0px"
            }}
          >
            {/* SORT DROPDOWN */}
            <div className="relative border border-[#203C1F] rounded-[10px]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSortOpen(!sortOpen);
                  setDesktopFilterOpen(null);
                }}
                className="bg-[#203C1F] text-white rounded-[10px] flex items-center justify-between px-3"
                style={{
                  width: "130px",
                  height: "36px"
                }}
                aria-expanded={sortOpen}
                aria-controls="sort-dropdown"
                aria-label="Sort templates"
              >
                <span className="uppercase text-[20px] font-semibold">Sort</span>
                <img 
                  src="/icons/filter-bar1.svg"
                  alt="Sort icon"
                  className="w-4 h-4 object-contain"
                  style={{ 
                    imageRendering: 'auto',
                    shapeRendering: 'geometricPrecision'
                  }}
                />
              </button>
              {sortOpen && (
                <div 
                  className="sort-dropdown absolute bottom-full left-0 mb-4 w-[130px] bg-[#203C1F] text-white rounded-lg shadow-lg z-30"
                  role="listbox"
                  aria-label="Sort options"
                >
                  <div className="py-1">
                    {["popular", "newest", "oldest", "saved"].map((option) => (
                      <div
                        key={option}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSortOption(option);
                        }}
                        className={`cursor-pointer px-3 py-1 text-xl font-semibold text-left uppercase ${
                          sortOption === option 
                            ? "bg-[#10221B] text-white" 
                            : "text-gray-300"
                        }`}
                        role="option"
                        aria-selected={sortOption === option}
                      >
                        <span>{option}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <span className="text-[20px] font-semibold text-[#667B66] ml-4" role="status">
              {totalResults} results
            </span>
          </div>

          {/* Support Button */}
          <button
            onClick={() => window.open('mailto:support@example.com')}
            className="bg-[#10221B] text-white w-[160px] h-[60px] rounded-lg flex items-center justify-between px-4"
          >
            <div className="flex items-center gap-2">
              <img
                src="/icons/support-icon.svg"
                alt="Support icon"
                className="w-5 h-5 object-contain"
                style={{ 
                  imageRendering: 'auto',
                  shapeRendering: 'geometricPrecision'
                }}
              />
              <span className="uppercase text-xl font-semibold">Support</span>
            </div>
          </button>
        </div>
      </div>
    </>
  );
} 