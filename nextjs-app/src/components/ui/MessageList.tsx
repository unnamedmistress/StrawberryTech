import React, { useMemo } from 'react';
import { Message } from '../../types/dataverse';
import { SharePointCitation } from '../../types/microsoft365';
import MarkdownRenderer from './MarkdownRenderer';
import QuickActionsBar from './QuickActionsBar';
import { QuickAction } from '../../types/microsoft365';

interface MessageListProps {
  messages: Message[];
  height: number;
  width?: string | number;
  onLoadMore?: () => void;
  hasNextPage?: boolean;
  isLoading?: boolean;
  onMessageAction?: (messageId: string, action: string) => void;
  className?: string;
}

interface MessageItemProps {
  message: Message;
  onMessageAction?: (messageId: string, action: string) => void;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, onMessageAction }) => {
  const citations: SharePointCitation[] = useMemo(() => {
    if (!message.citations) return [];
    try {
      return JSON.parse(message.citations);
    } catch {
      return [];
    }
  }, [message.citations]);

  const quickActions: QuickAction[] = useMemo(() => {
    if (message.role !== 'assistant') return [];

    return [
      {
        id: 'copy',
        icon: '📋',
        label: 'Copy',
        action: () => {
          navigator.clipboard.writeText(message.content);
          onMessageAction?.(message.id, 'copy');
        }
      },
      {
        id: 'regenerate',
        icon: '🔄',
        label: 'Regenerate',
        action: () => onMessageAction?.(message.id, 'regenerate')
      },
      {
        id: 'export',
        icon: '💾',
        label: 'Export',
        action: () => onMessageAction?.(message.id, 'export')
      }
    ];
  }, [message.role, message.content, message.id, onMessageAction]);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`message-item ${message.role}`}>
      <div className="message-header">
        <div className="message-avatar">
          {message.role === 'user' ? '👤' : '🤖'}
        </div>
        <div className="message-meta">
          <span className="message-role">
            {message.role === 'user' ? 'You' : 'Assistant'}
          </span>
          <span className="message-timestamp">
            {formatTimestamp(message.createdOn)}
          </span>
          {message.tokens && (
            <span className="message-tokens">{message.tokens} tokens</span>
          )}
        </div>
      </div>

      <div className="message-content">
        {message.messageType === 'text' && (
          <MarkdownRenderer 
            content={message.content} 
            citations={citations}
          />
        )}
        {message.messageType === 'file' && (
          <div className="file-message">
            <span className="file-icon">📎</span>
            <span className="file-content">{message.content}</span>
          </div>
        )}
        {message.messageType === 'action' && (
          <div className="action-message">
            <span className="action-icon">⚡</span>
            <span className="action-content">{message.content}</span>
          </div>
        )}
      </div>

      {quickActions.length > 0 && (
        <div className="message-actions">
          <QuickActionsBar actions={quickActions} />
        </div>
      )}

      <style jsx>{`
        .message-item {
          display: flex;
          flex-direction: column;
          padding: 1rem;
          margin-bottom: 0.5rem;
          border-radius: 12px;
          position: relative;
          transition: all 0.2s ease;
        }

        .message-item.user {
          background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
          margin-left: 2rem;
          border-bottom-right-radius: 4px;
        }

        .message-item.assistant {
          background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
          margin-right: 2rem;
          border-bottom-left-radius: 4px;
        }

        .message-item.system {
          background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
          margin: 0 1rem;
          border-radius: 8px;
          text-align: center;
          font-style: italic;
          opacity: 0.8;
        }

        .message-item:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .message-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }

        .message-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(4px);
          flex-shrink: 0;
        }

        .message-meta {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex: 1;
          font-size: 0.875rem;
          color: rgba(0, 0, 0, 0.7);
        }

        .message-role {
          font-weight: 600;
        }

        .message-timestamp {
          opacity: 0.8;
        }

        .message-tokens {
          background: rgba(255, 255, 255, 0.6);
          padding: 0.125rem 0.375rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-family: monospace;
        }

        .message-content {
          line-height: 1.6;
          color: #333;
        }

        .file-message, .action-message {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 8px;
          border-left: 3px solid #007bff;
        }

        .file-icon, .action-icon {
          font-size: 1.1rem;
        }

        .file-content, .action-content {
          flex: 1;
        }

        .message-actions {
          margin-top: 0.75rem;
          opacity: 0;
          transform: translateY(4px);
          transition: all 0.2s ease;
        }

        .message-item:hover .message-actions {
          opacity: 1;
          transform: translateY(0);
        }

        /* Dark mode support */
        :global(.dark) .message-item.user {
          background: linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%);
          color: #e5e7eb;
        }

        :global(.dark) .message-item.assistant {
          background: linear-gradient(135deg, #581c87 0%, #7c3aed 100%);
          color: #e5e7eb;
        }

        :global(.dark) .message-item.system {
          background: linear-gradient(135deg, #92400e 0%, #d97706 100%);
          color: #f3f4f6;
        }

        :global(.dark) .message-meta {
          color: rgba(255, 255, 255, 0.8);
        }

        :global(.dark) .message-content {
          color: #f3f4f6;
        }

        :global(.dark) .message-avatar {
          background: rgba(0, 0, 0, 0.3);
        }

        :global(.dark) .message-tokens {
          background: rgba(0, 0, 0, 0.4);
          color: #e5e7eb;
        }

        :global(.dark) .file-message,
        :global(.dark) .action-message {
          background: rgba(0, 0, 0, 0.3);
          color: #f3f4f6;
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          .message-item {
            margin: 0;
            border-radius: 8px;
          }

          .message-item.user {
            margin-left: 1rem;
          }

          .message-item.assistant {
            margin-right: 1rem;
          }

          .message-header {
            gap: 0.5rem;
            margin-bottom: 0.5rem;
          }

          .message-meta {
            gap: 0.5rem;
            font-size: 0.8rem;
          }

          .message-avatar {
            width: 28px;
            height: 28px;
            font-size: 1rem;
          }
        }

        /* High contrast mode */
        @media (prefers-contrast: high) {
          .message-item {
            border: 2px solid;
          }

          .message-item.user {
            border-color: #0066cc;
          }

          .message-item.assistant {
            border-color: #6600cc;
          }

          .message-item.system {
            border-color: #cc6600;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .message-item,
          .message-actions {
            transition: none;
          }

          .message-item:hover {
            transform: none;
          }
        }
      `}</style>
    </div>
  );
};

const MessageList: React.FC<MessageListProps> = ({
  messages,
  height,
  width = '100%',
  onLoadMore,
  hasNextPage = false,
  isLoading = false,
  onMessageAction,
  className = ''
}) => {
  // Scroll to bottom when new messages arrive
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    if (element.scrollTop < 100 && hasNextPage && !isLoading && onLoadMore) {
      onLoadMore();
    }
  };

  if (messages.length === 0) {
    return (
      <div className={`empty-message-list ${className}`}>
        <div className="empty-state">
          <div className="empty-icon">💬</div>
          <h3>No messages yet</h3>
          <p>Start a conversation to see messages here.</p>
        </div>

        <style jsx>{`
          .empty-message-list {
            height: ${typeof height === 'number' ? `${height}px` : height};
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
          }

          .empty-state {
            text-align: center;
            color: #6c757d;
            max-width: 300px;
            padding: 2rem;
          }

          .empty-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
            opacity: 0.5;
          }

          .empty-state h3 {
            margin: 0 0 0.5rem 0;
            color: #495057;
            font-size: 1.25rem;
            font-weight: 600;
          }

          .empty-state p {
            margin: 0;
            line-height: 1.5;
            opacity: 0.8;
          }

          /* Dark mode */
          :global(.dark) .empty-state {
            color: #9ca3af;
          }

          :global(.dark) .empty-state h3 {
            color: #f3f4f6;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className={`message-list-container ${className}`}>
      {isLoading && (
        <div className="loading-indicator">
          <div className="loading-spinner">⟳</div>
          <span>Loading messages...</span>
        </div>
      )}

      <div 
        className="message-list-content"
        style={{ height: typeof height === 'number' ? `${height}px` : height, width }}
        onScroll={handleScroll}
      >
        {messages.map((message) => (
          <MessageItem 
            key={message.id} 
            message={message} 
            onMessageAction={onMessageAction} 
          />
        ))}
      </div>

      <style jsx>{`
        .message-list-container {
          position: relative;
          background: #f8f9fa;
          border-radius: 8px;
          overflow: hidden;
        }

        .message-list-content {
          overflow-y: auto;
          padding: 1rem;
        }

        .loading-indicator {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(2px);
          padding: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: #6c757d;
          z-index: 10;
          border-bottom: 1px solid #e9ecef;
        }

        .loading-spinner {
          animation: spin 1s linear infinite;
          font-size: 1.1rem;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Dark mode */
        :global(.dark) .message-list-container {
          background: #1f2937;
        }

        :global(.dark) .loading-indicator {
          background: rgba(31, 41, 55, 0.9);
          color: #9ca3af;
          border-bottom-color: #374151;
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .loading-spinner {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};

export default MessageList;