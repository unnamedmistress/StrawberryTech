import React, { useState, useEffect, useRef } from 'react';
import { SearchSuggestion } from '../../types/microsoft365';
import { getConnectorService } from '../../services/CodeAppConnectorService';

interface SearchPanelProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectResult: (result: SearchSuggestion) => void;
  searchMode: 'sharepoint' | 'microsoft_search';
  onModeChange: (mode: 'sharepoint' | 'microsoft_search') => void;
  placeholder?: string;
}

const SearchPanel: React.FC<SearchPanelProps> = ({
  isVisible,
  onClose,
  onSelectResult,
  searchMode,
  onModeChange,
  placeholder = 'Search documents and content...'
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions] = useState<SearchSuggestion[]>([
    { id: 'recent-docs', text: 'Recent documents', type: 'sharepoint' },
    { id: 'shared-files', text: 'Shared files', type: 'sharepoint' },
    { id: 'meeting-notes', text: 'Meeting notes', type: 'microsoft_search' },
    { id: 'project-files', text: 'Project files', type: 'sharepoint' },
    { id: 'team-updates', text: 'Team updates', type: 'microsoft_search' }
  ]);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const connectorService = getConnectorService();

  useEffect(() => {
    if (isVisible && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isVisible]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (query.trim()) {
        performSearch(query);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [query, searchMode]);

  const performSearch = async (searchQuery: string) => {
    setIsSearching(true);
    
    try {
      let searchResults: SearchSuggestion[] = [];
      
      if (searchMode === 'sharepoint') {
        const response = await connectorService.searchSharePoint(searchQuery);
        if (response.success && response.data) {
          searchResults = response.data.map((citation, index) => ({
            id: `sp-${index}`,
            text: citation.title,
            type: 'sharepoint' as const,
            metadata: {
              url: citation.webUrl,
              lastModified: citation.lastModifiedDateTime,
              author: citation.author?.displayName
            }
          }));
        }
      } else {
        const response = await connectorService.searchMicrosoft(searchQuery);
        if (response.success && response.data) {
          searchResults = (response.data as unknown[]).map((item: any, index) => ({
            id: `ms-${index}`,
            text: item.name || item.title || item.subject || 'Untitled',
            type: 'microsoft_search' as const,
            metadata: item
          }));
        }
      }
      
      setResults(searchResults);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    onSelectResult(suggestion);
  };

  if (!isVisible) return null;

  return (
    <div className="search-panel-overlay" onClick={onClose}>
      <div className="search-panel" onClick={e => e.stopPropagation()}>
        <div className="search-header">
          <h3>Search & Prep</h3>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="search-mode-toggle">
          <button
            className={`mode-btn ${searchMode === 'sharepoint' ? 'active' : ''}`}
            onClick={() => onModeChange('sharepoint')}
          >
            📄 SharePoint
          </button>
          <button
            className={`mode-btn ${searchMode === 'microsoft_search' ? 'active' : ''}`}
            onClick={() => onModeChange('microsoft_search')}
          >
            🔍 Microsoft Search
          </button>
        </div>

        <div className="search-input-container">
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="search-input"
          />
          {isSearching && <div className="search-spinner">⟳</div>}
        </div>

        <div className="search-content">
          {!query.trim() && (
            <div className="suggestions-section">
              <h4>Quick Searches</h4>
              <div className="suggestions-list">
                {suggestions
                  .filter(s => s.type === searchMode)
                  .map(suggestion => (
                    <button
                      key={suggestion.id}
                      className="suggestion-item"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion.text}
                    </button>
                  ))}
              </div>
            </div>
          )}

          {query.trim() && results.length > 0 && (
            <div className="results-section">
              <h4>Search Results</h4>
              <div className="results-list">
                {results.map(result => (
                  <button
                    key={result.id}
                    className="result-item"
                    onClick={() => onSelectResult(result)}
                  >
                    <div className="result-title">{result.text}</div>
                    {result.metadata && (
                      <div className="result-meta">
                        {(result.metadata as any).author && (
                          <span>By {String((result.metadata as any).author)}</span>
                        )}
                        {(result.metadata as any).lastModified && (
                          <span>Modified {new Date(String((result.metadata as any).lastModified)).toLocaleDateString()}</span>
                        )}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {query.trim() && !isSearching && results.length === 0 && (
            <div className="no-results">
              <p>No results found for "{query}"</p>
              <p className="no-results-hint">
                Try a different search term or switch to {searchMode === 'sharepoint' ? 'Microsoft Search' : 'SharePoint'} mode.
              </p>
            </div>
          )}
        </div>

        <style jsx>{`
          .search-panel-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: flex-start;
            justify-content: center;
            z-index: 1000;
            padding-top: 10vh;
          }

          .search-panel {
            background: white;
            border-radius: 12px;
            width: 90%;
            max-width: 600px;
            max-height: 80vh;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            display: flex;
            flex-direction: column;
          }

          .search-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem;
            border-bottom: 1px solid #e9ecef;
          }

          .search-header h3 {
            margin: 0;
            color: #333;
            font-size: 1.25rem;
          }

          .close-button {
            background: none;
            border: none;
            font-size: 1.5rem;
            color: #666;
            cursor: pointer;
            padding: 0.25rem;
            border-radius: 4px;
          }

          .close-button:hover {
            background: #f8f9fa;
            color: #000;
          }

          .search-mode-toggle {
            display: flex;
            padding: 0 1.5rem;
            border-bottom: 1px solid #e9ecef;
          }

          .mode-btn {
            flex: 1;
            padding: 0.75rem;
            border: none;
            background: none;
            color: #6c757d;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            border-bottom: 2px solid transparent;
          }

          .mode-btn:hover {
            color: #495057;
            background: #f8f9fa;
          }

          .mode-btn.active {
            color: #007bff;
            border-bottom-color: #007bff;
            background: #f8f9fa;
          }

          .search-input-container {
            position: relative;
            padding: 1.5rem;
            border-bottom: 1px solid #e9ecef;
          }

          .search-input {
            width: 100%;
            padding: 0.75rem 1rem;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            font-size: 1rem;
            transition: border-color 0.2s;
          }

          .search-input:focus {
            outline: none;
            border-color: #007bff;
            box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
          }

          .search-spinner {
            position: absolute;
            right: 2rem;
            top: 50%;
            transform: translateY(-50%);
            font-size: 1.2rem;
            color: #007bff;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            from { transform: translateY(-50%) rotate(0deg); }
            to { transform: translateY(-50%) rotate(360deg); }
          }

          .search-content {
            flex: 1;
            overflow-y: auto;
            padding: 1.5rem;
          }

          .suggestions-section, .results-section {
            margin-bottom: 2rem;
          }

          .suggestions-section h4, .results-section h4 {
            margin: 0 0 1rem 0;
            color: #495057;
            font-size: 1rem;
            font-weight: 600;
          }

          .suggestions-list, .results-list {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          .suggestion-item, .result-item {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 0.75rem;
            text-align: left;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 0.9rem;
          }

          .suggestion-item:hover, .result-item:hover {
            background: #e9ecef;
            border-color: #007bff;
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(0, 123, 255, 0.1);
          }

          .result-title {
            font-weight: 500;
            color: #333;
            margin-bottom: 0.25rem;
          }

          .result-meta {
            font-size: 0.8rem;
            color: #6c757d;
            display: flex;
            gap: 1rem;
          }

          .no-results {
            text-align: center;
            color: #6c757d;
            padding: 2rem;
          }

          .no-results p {
            margin: 0 0 0.5rem 0;
          }

          .no-results-hint {
            font-size: 0.9rem;
            opacity: 0.8;
          }

          @media (max-width: 768px) {
            .search-panel {
              width: 95%;
              margin: 0 auto;
            }

            .search-header, .search-input-container, .search-content {
              padding: 1rem;
            }

            .mode-btn {
              padding: 0.5rem;
              font-size: 0.9rem;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default SearchPanel;