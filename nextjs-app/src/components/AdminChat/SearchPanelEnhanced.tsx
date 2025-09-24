/**
 * Enhanced Search Panel Component
 * Auto-opens based on file search intent, provides SharePoint/OneDrive search
 */

import React, { useState, useEffect } from 'react';
import { connectorGraphService } from '../../services/ConnectorGraphService';

interface SearchResult {
  id: string;
  title: string;
  url: string;
  snippet?: string;
  type: 'file' | 'document' | 'page';
  lastModified: string;
  author: string;
  size?: number;
}

interface SearchPanelEnhancedProps {
  onClose: () => void;
  onFileSelect: (file: SearchResult) => void;
  autoQuery?: string; // Auto-populate search from intent
}

export function SearchPanelEnhanced({
  onClose,
  onFileSelect,
  autoQuery = ''
}: SearchPanelEnhancedProps) {
  const [query, setQuery] = useState(autoQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'documents' | 'presentations' | 'spreadsheets'>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'modified' | 'title'>('relevance');

  // Popular search suggestions based on admin context
  const searchSuggestions = [
    '📊 Q3 Performance Reports',
    '📋 Budget Planning Documents',  
    '📝 Meeting Templates',
    '👥 Team Onboarding Guides',
    '🔧 Process Documentation',
    '📈 Analytics Dashboards',
    '🎯 Strategy Presentations',
    '📧 Email Templates'
  ];

  // Auto-search on mount if autoQuery provided
  useEffect(() => {
    if (autoQuery.trim()) {
      handleSearch();
    }
  }, [autoQuery]);

  // Load search history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('admin-chat-search-history');
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load search history:', error);
      }
    }
  }, []);

  // Perform search through connector
  const handleSearch = async (searchQuery?: string) => {
    const searchTerm = searchQuery || query;
    if (!searchTerm.trim()) return;

    setLoading(true);
    try {
      // Search SharePoint files
      const response = await connectorGraphService.searchFiles(searchTerm);
      
      if (response.success && response.data) {
        // Transform Graph files to SearchResults
        const searchResults: SearchResult[] = response.data.map(file => ({
          id: file.id,
          title: file.name,
          url: file.webUrl,
          snippet: extractSnippet(file.name, searchTerm),
          type: getFileType(file.name),
          lastModified: file.lastModifiedDateTime,
          author: file.createdBy.user.displayName,
          size: file.size
        }));

        // Apply filters
        const filteredResults = applyFilters(searchResults);
        
        // Apply sorting
        const sortedResults = applySorting(filteredResults);
        
        setResults(sortedResults);

        // Update search history
        updateSearchHistory(searchTerm);
      } else {
        console.error('Search failed:', response.error);
        setResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Update search history
  const updateSearchHistory = (searchTerm: string) => {
    const newHistory = [searchTerm, ...searchHistory.filter(item => item !== searchTerm)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('admin-chat-search-history', JSON.stringify(newHistory));
  };

  // Extract snippet for search result
  const extractSnippet = (fileName: string, searchTerm: string): string => {
    // Simple snippet extraction based on filename match
    const terms = searchTerm.toLowerCase().split(' ');
    const nameLower = fileName.toLowerCase();
    
    const matchedTerms = terms.filter(term => nameLower.includes(term));
    if (matchedTerms.length > 0) {
      return `Contains: ${matchedTerms.join(', ')}`;
    }
    
    return 'Search result';
  };

  // Get file type from extension
  const getFileType = (fileName: string): SearchResult['type'] => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    
    if (['doc', 'docx', 'pdf', 'txt'].includes(ext || '')) return 'document';
    if (['ppt', 'pptx'].includes(ext || '')) return 'document';
    if (['xls', 'xlsx'].includes(ext || '')) return 'document';
    
    return 'file';
  };

  // Apply content type filters
  const applyFilters = (results: SearchResult[]): SearchResult[] => {
    if (selectedFilter === 'all') return results;
    
    return results.filter(result => {
      const fileName = result.title.toLowerCase();
      switch (selectedFilter) {
        case 'documents':
          return fileName.includes('.doc') || fileName.includes('.pdf') || fileName.includes('.txt');
        case 'presentations':
          return fileName.includes('.ppt');
        case 'spreadsheets':
          return fileName.includes('.xls');
        default:
          return true;
      }
    });
  };

  // Apply sorting
  const applySorting = (results: SearchResult[]): SearchResult[] => {
    return [...results].sort((a, b) => {
      switch (sortBy) {
        case 'modified':
          return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'relevance':
        default:
          // Simple relevance based on title match
          const queryLower = query.toLowerCase();
          const aRelevance = a.title.toLowerCase().includes(queryLower) ? 1 : 0;
          const bRelevance = b.title.toLowerCase().includes(queryLower) ? 1 : 0;
          return bRelevance - aRelevance;
      }
    });
  };

  // Handle key press in search input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Format file size
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
    return Math.round(bytes / (1024 * 1024)) + ' MB';
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="search-panel-enhanced">
      <div className="panel-header">
        <h3 className="panel-title">🔍 Search Files & Documents</h3>
        <button onClick={onClose} className="close-btn">×</button>
      </div>

      {/* Search Input */}
      <div className="search-input-section">
        <div className="search-input-container">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search for files, documents, presentations..."
            className="search-input"
            autoFocus
          />
          <button
            onClick={() => handleSearch()}
            disabled={!query.trim() || loading}
            className="search-btn"
          >
            {loading ? '⏳' : '🔍'}
          </button>
        </div>

        {/* Search Filters */}
        <div className="search-filters">
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value as any)}
            className="filter-select"
          >
            <option value="all">All Files</option>
            <option value="documents">Documents</option>
            <option value="presentations">Presentations</option>
            <option value="spreadsheets">Spreadsheets</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="sort-select"
          >
            <option value="relevance">Relevance</option>
            <option value="modified">Last Modified</option>
            <option value="title">Title</option>
          </select>
        </div>
      </div>

      {/* Search Suggestions */}
      {!query && !loading && results.length === 0 && (
        <div className="search-suggestions">
          <h4>Popular Searches</h4>
          <div className="suggestion-chips">
            {searchSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  const cleanSuggestion = suggestion.substring(2); // Remove emoji
                  setQuery(cleanSuggestion);
                  handleSearch(cleanSuggestion);
                }}
                className="suggestion-chip"
              >
                {suggestion}
              </button>
            ))}
          </div>

          {/* Search History */}
          {searchHistory.length > 0 && (
            <div className="search-history">
              <h4>Recent Searches</h4>
              <div className="history-list">
                {searchHistory.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setQuery(item);
                      handleSearch(item);
                    }}
                    className="history-item"
                  >
                    🕐 {item}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search Results */}
      <div className="search-results">
        {loading && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Searching SharePoint and OneDrive...</p>
          </div>
        )}

        {!loading && results.length === 0 && query && (
          <div className="empty-state">
            <p>No files found matching "{query}"</p>
            <p className="empty-hint">Try different keywords or check spelling</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <>
            <div className="results-header">
              <span className="results-count">{results.length} results found</span>
            </div>
            
            <div className="results-list">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="result-item"
                  onClick={() => onFileSelect(result)}
                >
                  <div className="result-icon">
                    {result.type === 'document' && '📄'}
                    {result.type === 'file' && '📁'}
                    {result.type === 'page' && '📝'}
                  </div>
                  
                  <div className="result-content">
                    <h4 className="result-title">{result.title}</h4>
                    {result.snippet && (
                      <p className="result-snippet">{result.snippet}</p>
                    )}
                    <div className="result-meta">
                      <span className="result-author">👤 {result.author}</span>
                      <span className="result-date">📅 {formatDate(result.lastModified)}</span>
                      {result.size && (
                        <span className="result-size">📊 {formatFileSize(result.size)}</span>
                      )}
                    </div>
                  </div>

                  <div className="result-actions">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(result.url, '_blank');
                      }}
                      className="action-btn-small"
                      title="Open in new tab"
                    >
                      🔗
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onFileSelect(result);
                      }}
                      className="action-btn-small select-btn"
                      title="Select this file"
                    >
                      ✅
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default SearchPanelEnhanced;