import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import DOMPurify from 'dompurify';
import { SharePointCitation } from '../../types/microsoft365';

interface MarkdownRendererProps {
  content: string;
  citations?: SharePointCitation[];
  className?: string;
  allowHtml?: boolean;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  citations = [],
  className = '',
  allowHtml = false
}) => {
  // Sanitize the content before rendering
  const sanitizedContent = React.useMemo(() => {
    if (typeof window !== 'undefined' && DOMPurify) {
      return DOMPurify.sanitize(content, {
        ALLOWED_TAGS: allowHtml ? 
          ['p', 'br', 'strong', 'em', 'u', 'code', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'a'] :
          ['p', 'br', 'strong', 'em', 'code', 'pre', 'ul', 'ol', 'li'],
        ALLOWED_ATTR: ['href', 'target', 'rel'],
        ALLOWED_URI_REGEXP: /^https?:\/\/|^mailto:|^#/
      });
    }
    return content;
  }, [content, allowHtml]);

  // Process citations and create footnotes
  const processedContent = React.useMemo(() => {
    let processed = sanitizedContent;
    
    citations.forEach((citation, index) => {
      const citationNumber = index + 1;
      
      // Replace citation patterns with numbered footnotes
      const patterns = [
        new RegExp(`\\[${citation.title}\\]`, 'gi'),
        new RegExp(`【${citation.title}】`, 'gi'),
        new RegExp(`\\(${citation.title}\\)`, 'gi')
      ];
      
      patterns.forEach(pattern => {
        processed = processed.replace(pattern, `[^${citationNumber}]`);
      });
    });
    
    return processed;
  }, [sanitizedContent, citations]);

  return (
    <div className={`markdown-renderer ${className}`}>
      <div className="markdown-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSanitize]}
          components={{
            // Custom components for better control
            h1: ({ children }) => <h1 className="markdown-h1">{children}</h1>,
            h2: ({ children }) => <h2 className="markdown-h2">{children}</h2>,
            h3: ({ children }) => <h3 className="markdown-h3">{children}</h3>,
            h4: ({ children }) => <h4 className="markdown-h4">{children}</h4>,
            p: ({ children }) => <p className="markdown-p">{children}</p>,
            code: ({ children, className }) => 
              className?.includes('language-') ? 
                <code className={`markdown-code-block ${className}`}>{children}</code> :
                <code className="markdown-code-inline">{children}</code>,
            pre: ({ children }) => <pre className="markdown-pre">{children}</pre>,
            blockquote: ({ children }) => <blockquote className="markdown-blockquote">{children}</blockquote>,
            ul: ({ children }) => <ul className="markdown-ul">{children}</ul>,
            ol: ({ children }) => <ol className="markdown-ol">{children}</ol>,
            li: ({ children }) => <li className="markdown-li">{children}</li>,
            a: ({ href, children }) => (
              <a 
                href={href} 
                className="markdown-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            ),
            table: ({ children }) => (
              <div className="table-wrapper">
                <table className="markdown-table">{children}</table>
              </div>
            ),
            thead: ({ children }) => <thead className="markdown-thead">{children}</thead>,
            tbody: ({ children }) => <tbody className="markdown-tbody">{children}</tbody>,
            tr: ({ children }) => <tr className="markdown-tr">{children}</tr>,
            th: ({ children }) => <th className="markdown-th">{children}</th>,
            td: ({ children }) => <td className="markdown-td">{children}</td>,
          }}
        >
          {processedContent}
        </ReactMarkdown>
      </div>

      {citations.length > 0 && (
        <div className="citations-footer">
          <div className="citations-header">
            <h4>References</h4>
            <span className="citations-count">{citations.length} source{citations.length > 1 ? 's' : ''}</span>
          </div>
          <div className="citations-list">
            {citations.map((citation, index) => (
              <div key={citation.id} className="citation-item">
                <div className="citation-number">[^{index + 1}]</div>
                <div className="citation-content">
                  <div className="citation-title">
                    <a 
                      href={citation.webUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="citation-link"
                    >
                      {citation.title}
                    </a>
                  </div>
                  <div className="citation-meta">
                    {citation.author?.displayName && (
                      <span className="citation-author">By {citation.author.displayName}</span>
                    )}
                    <span className="citation-date">
                      Modified {new Date(citation.lastModifiedDateTime).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .markdown-renderer {
          line-height: 1.6;
          color: #333;
        }

        .markdown-content {
          margin-bottom: 2rem;
        }

        /* Typography */
        :global(.markdown-h1) {
          font-size: 2rem;
          font-weight: 700;
          color: #2c3e50;
          margin: 2rem 0 1rem 0;
          border-bottom: 3px solid #3498db;
          padding-bottom: 0.5rem;
        }

        :global(.markdown-h2) {
          font-size: 1.5rem;
          font-weight: 600;
          color: #34495e;
          margin: 1.5rem 0 0.75rem 0;
          border-bottom: 2px solid #ecf0f1;
          padding-bottom: 0.25rem;
        }

        :global(.markdown-h3) {
          font-size: 1.25rem;
          font-weight: 600;
          color: #34495e;
          margin: 1.25rem 0 0.5rem 0;
        }

        :global(.markdown-h4) {
          font-size: 1.1rem;
          font-weight: 600;
          color: #34495e;
          margin: 1rem 0 0.5rem 0;
        }

        :global(.markdown-p) {
          margin: 0.75rem 0;
        }

        /* Code styling */
        :global(.markdown-code-inline) {
          background: #f8f9fa;
          color: #e83e8c;
          padding: 0.2rem 0.4rem;
          border-radius: 3px;
          font-family: 'Monaco', 'Consolas', monospace;
          font-size: 0.9em;
        }

        :global(.markdown-code-block) {
          background: #2d3748;
          color: #e2e8f0;
          padding: 1rem;
          border-radius: 6px;
          font-family: 'Monaco', 'Consolas', monospace;
          font-size: 0.9em;
          overflow-x: auto;
        }

        :global(.markdown-pre) {
          background: #2d3748;
          color: #e2e8f0;
          padding: 1rem;
          border-radius: 6px;
          overflow-x: auto;
          margin: 1rem 0;
        }

        :global(.markdown-blockquote) {
          border-left: 4px solid #3498db;
          background: #f8f9fa;
          margin: 1rem 0;
          padding: 1rem;
          font-style: italic;
        }

        /* Lists */
        :global(.markdown-ul), :global(.markdown-ol) {
          margin: 1rem 0;
          padding-left: 2rem;
        }

        :global(.markdown-li) {
          margin: 0.5rem 0;
        }

        /* Links */
        :global(.markdown-link) {
          color: #3498db;
          text-decoration: none;
          border-bottom: 1px solid transparent;
          transition: all 0.2s;
        }

        :global(.markdown-link:hover) {
          color: #2980b9;
          border-bottom-color: #2980b9;
        }

        /* Tables */
        .table-wrapper {
          overflow-x: auto;
          margin: 1rem 0;
        }

        :global(.markdown-table) {
          width: 100%;
          border-collapse: collapse;
          border: 1px solid #dee2e6;
        }

        :global(.markdown-thead) {
          background: #f8f9fa;
        }

        :global(.markdown-th), :global(.markdown-td) {
          padding: 0.75rem;
          border: 1px solid #dee2e6;
          text-align: left;
        }

        :global(.markdown-th) {
          font-weight: 600;
          color: #495057;
        }

        :global(.markdown-tr:nth-child(even)) {
          background: #f8f9fa;
        }

        /* Citations */
        .citations-footer {
          border-top: 2px solid #e9ecef;
          padding-top: 1.5rem;
          margin-top: 2rem;
        }

        .citations-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .citations-header h4 {
          margin: 0;
          color: #495057;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .citations-count {
          color: #6c757d;
          font-size: 0.9rem;
          background: #e9ecef;
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
        }

        .citations-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .citation-item {
          display: flex;
          gap: 0.75rem;
          padding: 0.75rem;
          background: #f8f9fa;
          border-radius: 6px;
          border-left: 3px solid #007bff;
        }

        .citation-number {
          font-family: monospace;
          font-weight: 600;
          color: #007bff;
          font-size: 0.9rem;
          flex-shrink: 0;
        }

        .citation-content {
          flex: 1;
        }

        .citation-title {
          margin-bottom: 0.25rem;
        }

        .citation-link {
          color: #007bff;
          text-decoration: none;
          font-weight: 500;
        }

        .citation-link:hover {
          text-decoration: underline;
        }

        .citation-meta {
          font-size: 0.8rem;
          color: #6c757d;
          display: flex;
          gap: 1rem;
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .markdown-renderer {
            color: #e2e8f0;
          }

          :global(.markdown-h1), :global(.markdown-h2), :global(.markdown-h3), :global(.markdown-h4) {
            color: #f7fafc;
          }

          :global(.markdown-h1) {
            border-bottom-color: #4299e1;
          }

          :global(.markdown-h2) {
            border-bottom-color: #4a5568;
          }

          :global(.markdown-blockquote) {
            background: #2d3748;
            border-left-color: #4299e1;
          }

          :global(.markdown-code-inline) {
            background: #2d3748;
            color: #f687b3;
          }

          .citations-footer {
            border-top-color: #4a5568;
          }

          .citations-header h4 {
            color: #f7fafc;
          }

          .citations-count {
            background: #4a5568;
            color: #e2e8f0;
          }

          .citation-item {
            background: #2d3748;
            border-left-color: #4299e1;
          }

          .citation-number {
            color: #4299e1;
          }

          .citation-link {
            color: #4299e1;
          }

          .citation-meta {
            color: #a0aec0;
          }
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          :global(.markdown-h1) {
            font-size: 1.5rem;
          }

          :global(.markdown-h2) {
            font-size: 1.25rem;
          }

          .citations-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .citation-item {
            flex-direction: column;
            gap: 0.5rem;
          }

          .citation-meta {
            flex-direction: column;
            gap: 0.25rem;
          }
        }
      `}</style>
    </div>
  );
};

export default MarkdownRenderer;