'use client';

import { useState, useEffect } from 'react';

const SEARCH_HISTORY_KEY = 'crm_search_history';
const MAX_HISTORY_ITEMS = 10;

export interface SearchHistoryItem {
  query: string;
  timestamp: string;
}

export function useSearchHistory() {
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (stored) {
        const history = JSON.parse(stored) as SearchHistoryItem[];
        setSearchHistory(history);
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  }, []);

  const addToHistory = (query: string) => {
    if (!query.trim()) return;

    const newItem: SearchHistoryItem = {
      query: query.trim(),
      timestamp: new Date().toISOString(),
    };

    setSearchHistory((prev) => {
      // Remove existing entry with same query
      const filtered = prev.filter((item) => item.query !== newItem.query);
      // Add new item at the beginning
      const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);

      // Save to localStorage
      try {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Error saving search history:', error);
      }

      return updated;
    });
  };

  const clearHistory = () => {
    setSearchHistory([]);
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  };

  return {
    searchHistory,
    addToHistory,
    clearHistory,
  };
}
