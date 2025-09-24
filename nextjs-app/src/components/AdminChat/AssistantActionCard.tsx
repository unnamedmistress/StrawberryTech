/**
 * Assistant Action Card Component
 * Condensed assistant response with quick actions and tone selector
 * Addresses the requirement for actionable assistant messages
 */

import React, { useState } from 'react';
import { ChatMessage } from './AdminChat';

interface AssistantActionCardProps {
  message: ChatMessage;
  onRegenerate: () => void;
  onEdit: () => void;
  onAddTask: () => void;
  onExport: () => void;
  onToneChange: (tone: string) => void;
}

const TONE_PRESETS = [
  { id: 'professional', label: 'Professional', icon: '💼' },
  { id: 'friendly', label: 'Friendly', icon: '😊' },
  { id: 'formal', label: 'Formal', icon: '🎩' },
  { id: 'casual', label: 'Casual', icon: '👋' },
  { id: 'concise', label: 'Concise', icon: '⚡' },
  { id: 'detailed', label: 'Detailed', icon: '📝' }
];

export function AssistantActionCard({
  message,
  onRegenerate,
  onEdit,
  onAddTask,
  onExport,
  onToneChange
}: AssistantActionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [selectedTone, setSelectedTone] = useState<string>('professional');
  const [showToneSelector, setShowToneSelector] = useState(false);

  // Generate one-sentence summary of the message
  const generateSummary = (content: string): string => {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length === 0) return content.substring(0, 100) + '...';
    
    const firstSentence = sentences[0].trim();
    if (firstSentence.length > 120) {
      return firstSentence.substring(0, 120) + '...';
    }
    return firstSentence + '.';
  };

  // Handle tone change
  const handleToneChange = (tone: string) => {
    setSelectedTone(tone);
    setShowToneSelector(false);
    onToneChange(tone);
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Extract action items from content
  const extractActionItems = (content: string): string[] => {
    const actionPatterns = [
      /(?:^|\n)[-*•]\s*(.+)/gm, // Bullet points
      /(?:action|todo|task):\s*(.+)/gi, // Explicit actions
      /(?:next step|follow up):\s*(.+)/gi // Next steps
    ];
    
    const actions: string[] = [];
    actionPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const cleaned = match.replace(/^[-*•]\s*/, '').trim();
          if (cleaned.length > 5 && cleaned.length < 100) {
            actions.push(cleaned);
          }
        });
      }
    });
    
    return actions.slice(0, 3); // Limit to 3 actions
  };

  const summary = generateSummary(message.content);
  const actionItems = extractActionItems(message.content);
  const tokenCount = message.tokenCount || Math.ceil(message.content.length / 4);

  return (
    <div className="assistant-action-card">
      {/* Card Header */}
      <div className="card-header">
        <div className="assistant-avatar">
          <span className="avatar-icon">🤖</span>
        </div>
        <div className="message-meta">
          <span className="assistant-label">Assistant</span>
          <span className="message-time">{formatTime(message.timestamp)}</span>
        </div>
        <div className="card-actions">
          <button
            onClick={() => setExpanded(!expanded)}
            className="expand-btn"
            title={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? '▼' : '▶'}
          </button>
        </div>
      </div>

      {/* Summary Section */}
      <div className="card-summary">
        <p className="summary-text">{summary}</p>
        {tokenCount > 0 && (
          <span className="token-count" title="Estimated tokens">
            ~{tokenCount} tokens
          </span>
        )}
      </div>

      {/* Action Items Preview */}
      {actionItems.length > 0 && (
        <div className="action-items-preview">
          <span className="action-label">Actions:</span>
          <div className="action-tags">
            {actionItems.map((action, index) => (
              <span key={index} className="action-tag">
                {action}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions Row */}
      <div className="quick-actions-row">
        <button
          onClick={onRegenerate}
          className="action-btn regenerate"
          title="Regenerate response"
        >
          <span className="action-icon">🔄</span>
          <span className="action-label">Regenerate</span>
        </button>

        <button
          onClick={onEdit}
          className="action-btn edit"
          title="Edit last message"
        >
          <span className="action-icon">✏️</span>
          <span className="action-label">Edit</span>
        </button>

        <button
          onClick={onAddTask}
          className="action-btn add-task"
          title="Add to Tasks"
        >
          <span className="action-icon">✅</span>
          <span className="action-label">Add Task</span>
        </button>

        <button
          onClick={onExport}
          className="action-btn export"
          title="Export to OneNote/Word"
        >
          <span className="action-icon">📋</span>
          <span className="action-label">Export</span>
        </button>

        {/* Tone Selector */}
        <div className="tone-selector-container">
          <button
            onClick={() => setShowToneSelector(!showToneSelector)}
            className="action-btn tone-selector"
            title="Change tone"
          >
            <span className="action-icon">🎭</span>
            <span className="action-label">Tone</span>
          </button>

          {showToneSelector && (
            <div className="tone-dropdown">
              <div className="tone-header">
                <span>Current: {TONE_PRESETS.find(t => t.id === selectedTone)?.label}</span>
              </div>
              <div className="tone-options">
                {TONE_PRESETS.map(tone => (
                  <button
                    key={tone.id}
                    onClick={() => handleToneChange(tone.id)}
                    className={`tone-option ${selectedTone === tone.id ? 'selected' : ''}`}
                  >
                    <span className="tone-icon">{tone.icon}</span>
                    <span className="tone-label">{tone.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="expanded-content">
          <div className="full-content">
            {message.contentHtml ? (
              <div dangerouslySetInnerHTML={{ __html: message.contentHtml }} />
            ) : (
              <div className="content-text">
                {message.content.split('\n').map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
            )}
          </div>

          {/* Citations Footer */}
          {message.citations && message.citations.length > 0 && (
            <div className="citations-footer">
              <h5 className="citations-title">Sources:</h5>
              <div className="citations-list">
                {message.citations.map((citation, index) => (
                  <div key={index} className="citation-item">
                    <a
                      href={citation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="citation-link"
                    >
                      <span className="citation-title">{citation.title}</span>
                      <span className="citation-icon">🔗</span>
                    </a>
                    {citation.snippet && (
                      <p className="citation-snippet">{citation.snippet}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Extended Actions */}
          <div className="extended-actions">
            <button className="extended-action-btn">
              <span className="action-icon">📧</span>
              Send as Email
            </button>
            <button className="extended-action-btn">
              <span className="action-icon">💬</span>
              Post to Teams
            </button>
            <button className="extended-action-btn">
              <span className="action-icon">📅</span>
              Create Meeting
            </button>
            <button className="extended-action-btn">
              <span className="action-icon">🔍</span>
              Find Related
            </button>
          </div>
        </div>
      )}

      {/* Card Footer - Always visible */}
      <div className="card-footer">
        <div className="audit-info">
          <span className="correlation-id" title="Correlation ID">
            ID: {message.id.substring(0, 8)}...
          </span>
        </div>
        <div className="card-controls">
          <button
            className="feedback-btn positive"
            title="Good response"
          >
            👍
          </button>
          <button
            className="feedback-btn negative"
            title="Poor response"
          >
            👎
          </button>
        </div>
      </div>
    </div>
  );
}

export default AssistantActionCard;