'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Clock, Users, Building2, Briefcase, CheckSquare } from 'lucide-react';
import { SearchResultsDropdown } from '@/components/search/search-results-dropdown';
import { useSearchHistory, SearchHistoryItem } from '@/components/search/use-search-history';

interface SearchResult {
  id: string;
  name?: string;
  title?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  status?: string;
  industry?: string;
  value?: number;
  stage?: string;
  priority?: string;
  completed?: boolean;
  dueDate?: string;
  expectedCloseDate?: string;
  createdAt: string;
}

interface SearchResponse {
  contacts: { total: number; results: SearchResult[] };
  companies: { total: number; results: SearchResult[] };
  deals: { total: number; results: SearchResult[] };
  tasks: { total: number; results: SearchResult[] };
}

export function GlobalSearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { searchHistory, addToHistory } = useSearchHistory();

  // Handle keyboard shortcut (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => {
          if (!prev) {
            setTimeout(() => inputRef.current?.focus(), 0);
          }
          return !prev;
        });
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setQuery('');
        setResults(null);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (!query.trim()) {
      setResults(null);
      setSelectedIndex(-1);
      return;
    }

    debounceTimeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=5`);
        const data = await response.json();
        setResults(data);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Search error:', error);
        setResults(null);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [query]);

  // Handle keyboard navigation in results
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!results) return;

    const allResults = [
      ...results.contacts.results,
      ...results.companies.results,
      ...results.deals.results,
      ...results.tasks.results,
    ];

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < allResults.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      const selectedResult = allResults[selectedIndex];
      handleResultClick(selectedResult);
    }
  }, [results, selectedIndex]);

  const handleResultClick = (result: SearchResult) => {
    // Determine result type and navigate accordingly
    let url = '';
    if (result.firstName && result.lastName) {
      // Contact
      url = `/contacts/${result.id}`;
    } else if (result.industry) {
      // Company
      url = `/companies/${result.id}`;
    } else if (result.stage) {
      // Deal
      url = `/deals/${result.id}`;
    } else if (result.title) {
      // Task
      url = `/tasks/${result.id}`;
    }

    if (url) {
      addToHistory(query);
      window.location.href = url;
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults(null);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleClose = () => {
    setIsOpen(false);
    setQuery('');
    setResults(null);
    setSelectedIndex(-1);
  };

  return (
    <>
      {/* Search Trigger Button */}
      <button
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="hidden sm:inline-flex h-5 px-1.5 text-xs font-medium text-muted-foreground border rounded bg-muted">
          ⌘K
        </kbd>
      </button>

      {/* Search Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-32 bg-black/50" onClick={handleClose}>
          <div
            className="w-full max-w-2xl bg-background border rounded-lg shadow-xl mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 border-b p-4">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search contacts, companies, deals, tasks..."
                className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                autoFocus
              />
              {query && (
                <button
                  onClick={handleClear}
                  className="p-1 hover:bg-accent rounded transition-colors"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
              <kbd className="h-5 px-1.5 text-xs font-medium text-muted-foreground border rounded bg-muted">
                ESC
              </kbd>
            </div>

            {/* Search Results */}
            <div className="max-h-[60vh] overflow-y-auto">
              {loading && (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  Searching...
                </div>
              )}

              {!loading && !query && searchHistory.length > 0 && (
                <div className="p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
                    <Clock className="h-4 w-4" />
                    Recent Searches
                  </div>
                  <div className="space-y-1">
                    {searchHistory.map((item: SearchHistoryItem, index: number) => (
                      <button
                        key={index}
                        onClick={() => {
                          setQuery(item.query);
                          inputRef.current?.focus();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors text-left"
                      >
                        <Clock className="h-4 w-4" />
                        {item.query}
                        <span className="ml-auto text-xs text-muted-foreground/60">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!loading && results && (
                <SearchResultsDropdown
                  results={results}
                  selectedIndex={selectedIndex}
                  onResultClick={handleResultClick}
                />
              )}

              {!loading && query && results && !loading && (
                results.contacts.total === 0 &&
                results.companies.total === 0 &&
                results.deals.total === 0 &&
                results.tasks.total === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Search className="h-12 w-12 mb-3 opacity-50" />
                    <p className="text-lg font-medium">No results found</p>
                    <p className="text-sm mt-1">Try adjusting your search terms</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
