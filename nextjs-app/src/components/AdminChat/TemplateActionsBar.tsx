/**
 * Template Actions Bar Component
 * Quick action ribbon with templates and meeting-aware suggestions
 */

import React from 'react';
import { ChatIntent } from './AdminChat';

interface TemplateActionsBarProps {
  onTemplateSelect: (template: string) => void;
  currentIntent?: ChatIntent | null;
}

const BASE_TEMPLATES = [
  {
    id: 'meeting-prep',
    label: '📅 Meeting Prep',
    template: 'Help me prepare for my next meeting',
    icon: '📅',
    category: 'meeting'
  },
  {
    id: 'find-files',
    label: '🔍 Find Files',
    template: 'Find documents related to',
    icon: '🔍',
    category: 'search'
  },
  {
    id: 'draft-email',
    label: '📧 Draft Email',
    template: 'Help me draft an email about',
    icon: '📧',
    category: 'communication'
  },
  {
    id: 'create-task',
    label: '✅ Create Task',
    template: 'Create a task to',
    icon: '✅',
    category: 'productivity'
  },
  {
    id: 'teams-post',
    label: '💬 Teams Post',
    template: 'Post an announcement to Teams about',
    icon: '💬',
    category: 'communication'
  },
  {
    id: 'summarize',
    label: '📋 Summarize',
    template: 'Summarize the key points from',
    icon: '📋',
    category: 'analysis'
  }
];

const TONE_TEMPLATES = {
  professional: [
    'Please provide a professional summary of',
    'I need to send a formal communication regarding',
    'Could you help me create a business proposal for'
  ],
  friendly: [
    'Help me write a friendly message about',
    'I\'d like to share some good news with the team:',
    'Let\'s create a welcoming message for'
  ],
  urgent: [
    'This is urgent - please help me communicate',
    'I need immediate action on',
    'Emergency: Please draft a message about'
  ],
  casual: [
    'Quick question about',
    'Just wanted to check on',
    'Hey, can you help me with'
  ]
};

const INTENT_SPECIFIC_TEMPLATES: Record<string, string[]> = {
  file_search: [
    'Find all documents related to [project name]',
    'Search for files containing [keyword]',
    'Locate the latest version of [document type]',
    'Find presentations about [topic]'
  ],
  calendar_prep: [
    'Prepare agenda for [meeting name]',
    'What do I need to know for my next meeting?',
    'Find related documents for today\'s meetings',
    'Create meeting notes template for [meeting type]'
  ],
  email_draft: [
    'Draft a follow-up email about [topic]',
    'Create a professional email to [recipient] regarding [subject]',
    'Write a thank you email for [occasion]',
    'Compose a meeting invitation for [meeting purpose]'
  ],
  teams_post: [
    'Announce [news] to the team',
    'Share project update with [team name]',
    'Post meeting summary to [channel]',
    'Create team celebration message for [achievement]'
  ],
  task_creation: [
    'Add task: Review [document/process]',
    'Create reminder to follow up on [item]',
    'Schedule task: Prepare for [upcoming event]',
    'Add to-do: Research [topic]'
  ],
  general: []
};

export function TemplateActionsBar({
  onTemplateSelect,
  currentIntent
}: TemplateActionsBarProps) {
  
  // Get templates based on current intent
  const getRelevantTemplates = () => {
    if (!currentIntent || currentIntent.confidence < 0.6) {
      return BASE_TEMPLATES;
    }

    const intentTemplates = INTENT_SPECIFIC_TEMPLATES[currentIntent.type] || [];
    const baseRelevant = BASE_TEMPLATES.filter(t => {
      switch (currentIntent.type) {
        case 'file_search':
          return t.category === 'search';
        case 'calendar_prep':
          return t.category === 'meeting';
        case 'email_draft':
        case 'teams_post':
          return t.category === 'communication';
        case 'task_creation':
          return t.category === 'productivity';
        default:
          return true;
      }
    });

    return [
      ...baseRelevant.slice(0, 3),
      ...intentTemplates.slice(0, 3).map((template, index) => ({
        id: `intent-${index}`,
        label: template.split('[')[0].trim(),
        template,
        icon: '💡',
        category: 'intent-specific'
      }))
    ];
  };

  const templates = getRelevantTemplates();

  return (
    <div className="template-actions-bar">
      <div className="templates-container">
        {/* Quick Templates */}
        <div className="template-section">
          <span className="section-label">Quick Actions:</span>
          <div className="template-buttons">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => onTemplateSelect(template.template)}
                className={`template-btn ${template.category}`}
                title={template.template}
              >
                <span className="template-icon">{template.icon}</span>
                <span className="template-label">{template.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tone Selector */}
        <div className="tone-section">
          <span className="section-label">Tone:</span>
          <div className="tone-buttons">
            <button
              onClick={() => onTemplateSelect('Use a professional tone: ')}
              className="tone-btn professional"
              title="Professional tone"
            >
              💼
            </button>
            <button
              onClick={() => onTemplateSelect('Use a friendly tone: ')}
              className="tone-btn friendly"
              title="Friendly tone"
            >
              😊
            </button>
            <button
              onClick={() => onTemplateSelect('This is urgent: ')}
              className="tone-btn urgent"
              title="Urgent tone"
            >
              🚨
            </button>
            <button
              onClick={() => onTemplateSelect('Keep it casual: ')}
              className="tone-btn casual"
              title="Casual tone"
            >
              👋
            </button>
          </div>
        </div>

        {/* Intent-specific suggestions */}
        {currentIntent && currentIntent.confidence > 0.7 && currentIntent.suggestedActions && (
          <div className="suggestions-section">
            <span className="section-label">Suggestions:</span>
            <div className="suggestion-buttons">
              {currentIntent.suggestedActions.slice(0, 3).map((action, index) => (
                <button
                  key={index}
                  onClick={() => onTemplateSelect(`${action}: `)}
                  className="suggestion-btn"
                >
                  ✨ {action}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TemplateActionsBar;