/**
 * AdminChat Main Component
 * Power Apps based admin chat with connector integration, approval workflows, and Dataverse persistence
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { connectorService } from '../../services/CodeAppConnectorService';
import { connectorGraphService } from '../../services/ConnectorGraphService';
import { dataverseRepository, Conversation, Message } from '../../services/DataverseRepository';
import { AssistantActionCard } from './AssistantActionCard';
import { SearchPanelEnhanced } from './SearchPanelEnhanced';
import { PrepPanel } from './PrepPanel';
import { TemplateActionsBar } from './TemplateActionsBar';
import { ApprovalModal } from './ApprovalModal';
import { ErrorService, ErrorServiceClass } from '../common/ErrorService';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  contentHtml?: string;
  citations?: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
  timestamp: string;
  tokenCount?: number;
  actionable?: boolean;
}

export interface ChatIntent {
  type: 'file_search' | 'calendar_prep' | 'email_draft' | 'teams_post' | 'task_creation' | 'general';
  confidence: number;
  entities?: Record<string, string>;
  suggestedActions?: string[];
}

interface AdminChatProps {
  conversationId?: string;
  currentUser?: {
    id: string;
    displayName: string;
    email: string;
  };
  theme?: 'light' | 'dark';
  onConversationChange?: (conversationId: string) => void;
}

export function AdminChat({
  conversationId,
  currentUser,
  theme = 'light',
  onConversationChange
}: AdminChatProps) {
  // State Management
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [currentIntent, setCurrentIntent] = useState<ChatIntent | null>(null);
  
  // Panel States
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [showPrepPanel, setShowPrepPanel] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [pendingApproval, setPendingApproval] = useState<any>(null);

  // Assistant State
  const [assistantThreadId, setAssistantThreadId] = useState<string | null>(null);
  const [assistantRunning, setAssistantRunning] = useState(false);

  // UI Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize conversation
  useEffect(() => {
    initializeConversation();
  }, [conversationId, currentUser]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize conversation and load messages
  const initializeConversation = async () => {
    try {
      if (conversationId) {
        // Load existing conversation
        const convResult = await dataverseRepository.getConversation(conversationId);
        if (convResult.success && convResult.data) {
          setConversation(convResult.data);
          await loadConversationMessages(conversationId);
        }
      } else if (currentUser) {
        // Create new conversation
        const newConvResult = await dataverseRepository.createConversation({
          topic: 'New Admin Chat',
          createdOn: new Date().toISOString(),
          owner: currentUser.id
        });
        
        if (newConvResult.success && newConvResult.data) {
          const newConversationId = newConvResult.data.id;
          setConversation({
            conversationId: newConversationId,
            topic: 'New Admin Chat',
            createdOn: new Date().toISOString(),
            owner: currentUser.id
          });
          onConversationChange?.(newConversationId);
        }
      }

      // Initialize OpenAI Assistant thread
      await initializeAssistantThread();
    } catch (error) {
      console.error('Failed to initialize conversation:', error);
      ErrorServiceClass.showError('Failed to initialize chat', 'INIT_ERROR');
    }
  };

  // Load conversation messages from Dataverse
  const loadConversationMessages = async (convId: string) => {
    try {
      const messagesResult = await dataverseRepository.getMessagesByConversation(convId);
      if (messagesResult.success && messagesResult.data) {
        const chatMessages: ChatMessage[] = messagesResult.data.map(msg => ({
          id: msg.messageId,
          role: msg.role,
          content: msg.content,
          contentHtml: msg.contentHtml,
          citations: msg.citationsJson ? JSON.parse(msg.citationsJson) : undefined,
          timestamp: msg.createdOn,
          tokenCount: msg.tokenCount,
          actionable: msg.role === 'assistant'
        }));
        
        setMessages(chatMessages);
      }
    } catch (error) {
      console.error('Failed to load conversation messages:', error);
      ErrorServiceClass.showError('Failed to load messages', 'LOAD_ERROR');
    }
  };

  // Initialize OpenAI Assistant thread
  const initializeAssistantThread = async () => {
    try {
      const threadResult = await connectorService.createAssistantThread();
      if (threadResult.success && threadResult.data && (threadResult.data as any).threadId) {
        setAssistantThreadId((threadResult.data as any).threadId);
      }
    } catch (error) {
      console.error('Failed to initialize assistant thread:', error);
      // Continue without assistant features
    }
  };

  // Route user intent based on message content
  const routeIntent = (message: string): ChatIntent => {
    const lowerMessage = message.toLowerCase();
    
    // File search intent
    if (lowerMessage.includes('find') || lowerMessage.includes('search') || 
        lowerMessage.includes('document') || lowerMessage.includes('file')) {
      return {
        type: 'file_search',
        confidence: 0.8,
        suggestedActions: ['Open Search Panel', 'Search SharePoint', 'Search OneDrive']
      };
    }
    
    // Calendar prep intent
    if (lowerMessage.includes('meeting') || lowerMessage.includes('calendar') || 
        lowerMessage.includes('agenda') || lowerMessage.includes('prep')) {
      return {
        type: 'calendar_prep',
        confidence: 0.85,
        suggestedActions: ['Open Prep Panel', 'Get Next Meeting', 'Prepare Agenda']
      };
    }
    
    // Email draft intent
    if (lowerMessage.includes('email') || lowerMessage.includes('send') || 
        lowerMessage.includes('reply') || lowerMessage.includes('draft')) {
      return {
        type: 'email_draft',
        confidence: 0.7,
        suggestedActions: ['Draft Email', 'Get Templates', 'Send Email']
      };
    }
    
    // Teams post intent
    if (lowerMessage.includes('teams') || lowerMessage.includes('post') || 
        lowerMessage.includes('channel') || lowerMessage.includes('announce')) {
      return {
        type: 'teams_post',
        confidence: 0.75,
        suggestedActions: ['Post to Teams', 'Get Teams', 'Select Channel']
      };
    }
    
    // Task creation intent
    if (lowerMessage.includes('task') || lowerMessage.includes('todo') || 
        lowerMessage.includes('reminder') || lowerMessage.includes('action')) {
      return {
        type: 'task_creation',
        confidence: 0.8,
        suggestedActions: ['Create Task', 'Add to To Do', 'Set Reminder']
      };
    }
    
    return {
      type: 'general',
      confidence: 0.5,
      suggestedActions: ['Get Help', 'Show Templates']
    };
  };

  // Handle intent-driven panel auto-opening
  const handleIntentActions = (intent: ChatIntent) => {
    setCurrentIntent(intent);
    
    // Auto-open panels based on intent
    if (intent.type === 'file_search' && intent.confidence > 0.7) {
      setShowSearchPanel(true);
    }
    
    if (intent.type === 'calendar_prep' && intent.confidence > 0.7) {
      setShowPrepPanel(true);
    }
  };

  // Send message with assistant integration
  const sendMessage = async () => {
    if (!input.trim() || !conversation) return;
    
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Route intent and handle auto-actions
    const intent = routeIntent(input.trim());
    handleIntentActions(intent);
    
    // Save user message to Dataverse
    await dataverseRepository.createMessage({
      conversationId: conversation.conversationId,
      role: 'user',
      content: input.trim(),
      createdOn: new Date().toISOString()
    });

    const currentInput = input;
    setInput('');
    setLoading(true);
    setAssistantRunning(true);

    try {
      // Send to OpenAI Assistant if available
      if (assistantThreadId) {
        // Add message to thread
        await connectorService.addMessageToThread(
          assistantThreadId,
          'user',
          currentInput
        );

        // Run the thread
        const runResult = await connectorService.runThread(
          assistantThreadId,
          'asst_admin_chat_assistant', // This would be configured
          `You are an admin assistant. The user's intent appears to be: ${intent.type}. Provide helpful, concise responses.`
        );

        if (runResult.success && runResult.data && (runResult.data as any).runId) {
          await pollForAssistantResponse((runResult.data as any).runId);
        } else {
          throw new Error('Failed to start assistant run');
        }
      } else {
        // Fallback to direct response generation
        await generateFallbackResponse(currentInput, intent);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      ErrorServiceClass.showError('Failed to send message', 'SEND_ERROR');
      
      // Add error message
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your message. Please try again.',
        timestamp: new Date().toISOString(),
        actionable: false
      }]);
    } finally {
      setLoading(false);
      setAssistantRunning(false);
    }
  };

  // Poll for assistant response
  const pollForAssistantResponse = async (runId: string) => {
    const maxAttempts = 30; // 30 seconds max
    let attempts = 0;

    const poll = async (): Promise<void> => {
      try {
        const statusResult = await connectorService.getRunStatus(assistantThreadId!, runId);
        
        if (!statusResult.success) {
          throw new Error('Failed to get run status');
        }

        const status = (statusResult.data as any)?.status;
        
        if (status === 'completed') {
          // Get the latest messages
          const messagesResult = await connectorService.listMessages(assistantThreadId!);
          if (messagesResult.success && messagesResult.data) {
            const latestMessage = (messagesResult.data as any).messages?.[0];
            if (latestMessage && latestMessage.role === 'assistant') {
              await handleAssistantResponse(latestMessage.content);
            }
          }
          return;
        }
        
        if (status === 'failed' || status === 'cancelled') {
          throw new Error(`Assistant run ${status}`);
        }
        
        // Continue polling if still running
        if ((status === 'queued' || status === 'in_progress') && attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 1000);
        } else if (attempts >= maxAttempts) {
          throw new Error('Assistant response timeout');
        }
      } catch (error) {
        console.error('Error polling assistant response:', error);
        throw error;
      }
    };

    await poll();
  };

  // Handle assistant response
  const handleAssistantResponse = async (content: string) => {
    const assistantMessage: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content,
      timestamp: new Date().toISOString(),
      actionable: true
    };

    setMessages(prev => [...prev, assistantMessage]);

    // Save assistant message to Dataverse
    if (conversation) {
      await dataverseRepository.createMessage({
        conversationId: conversation.conversationId,
        role: 'assistant',
        content,
        createdOn: new Date().toISOString()
      });
    }
  };

  // Fallback response generation
  const generateFallbackResponse = async (userInput: string, intent: ChatIntent) => {
    let response = '';
    
    switch (intent.type) {
      case 'file_search':
        response = 'I can help you search for files. I\'ve opened the Search panel to get started. What specific documents are you looking for?';
        break;
      case 'calendar_prep':
        response = 'I can help you prepare for upcoming meetings. I\'ve opened the Prep panel. Would you like me to gather information about your next meeting?';
        break;
      case 'email_draft':
        response = 'I can help you draft an email. What would you like the email to say, and who should I send it to?';
        break;
      case 'teams_post':
        response = 'I can help you post a message to Teams. Which team and channel would you like to post to?';
        break;
      case 'task_creation':
        response = 'I can help you create tasks. What task would you like me to add to your To Do list?';
        break;
      default:
        response = 'I\'m here to help with admin tasks like finding files, preparing for meetings, drafting emails, posting to Teams, and managing tasks. How can I assist you today?';
    }

    await handleAssistantResponse(response);
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Render message with appropriate component
  const renderMessage = (message: ChatMessage) => {
    if (message.role === 'assistant' && message.actionable) {
      return (
        <AssistantActionCard
          key={message.id}
          message={message}
          onRegenerate={() => handleRegenerateMessage(message)}
          onEdit={() => handleEditMessage(message)}
          onAddTask={() => handleAddTask(message)}
          onExport={() => handleExport(message)}
          onToneChange={(tone) => handleToneChange(message, tone)}
        />
      );
    }

    return (
      <div
        key={message.id}
        className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
      >
        <div className="message-header">
          <span className="message-role">
            {message.role === 'user' ? 'You' : 'Assistant'}
          </span>
          <span className="message-time">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
        </div>
        <div className="message-content">
          {message.contentHtml ? (
            <div dangerouslySetInnerHTML={{ __html: message.contentHtml }} />
          ) : (
            <p>{message.content}</p>
          )}
        </div>
        {message.citations && message.citations.length > 0 && (
          <div className="message-citations">
            <h5>Sources:</h5>
            {message.citations.map((citation, index) => (
              <a
                key={index}
                href={citation.url}
                target="_blank"
                rel="noopener noreferrer"
                className="citation-link"
              >
                {citation.title}
              </a>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Action handlers
  const handleRegenerateMessage = async (message: ChatMessage) => {
    // TODO: Implement message regeneration
    console.log('Regenerate message:', message.id);
  };

  const handleEditMessage = async (message: ChatMessage) => {
    // TODO: Implement message editing
    console.log('Edit message:', message.id);
  };

  const handleAddTask = async (message: ChatMessage) => {
    // TODO: Implement task creation from message
    console.log('Add task from message:', message.id);
  };

  const handleExport = async (message: ChatMessage) => {
    // TODO: Implement export functionality
    console.log('Export message:', message.id);
  };

  const handleToneChange = async (message: ChatMessage, tone: string) => {
    // TODO: Implement tone adjustment
    console.log('Change tone for message:', message.id, 'to', tone);
  };

  return (
    <div className={`admin-chat ${theme}`}>
      {/* Template Actions Bar */}
      <TemplateActionsBar
        onTemplateSelect={(template) => setInput(template)}
        currentIntent={currentIntent}
      />

      {/* Main Chat Area */}
      <div className="chat-container">
        {/* Side Panels */}
        {showSearchPanel && (
          <SearchPanelEnhanced
            onClose={() => setShowSearchPanel(false)}
            onFileSelect={(file) => console.log('File selected:', file)}
          />
        )}
        
        {showPrepPanel && (
          <PrepPanel
            onClose={() => setShowPrepPanel(false)}
            currentUser={currentUser}
          />
        )}

        {/* Messages Area */}
        <div className="messages-area">
          <div className="messages-container">
            {messages.map(renderMessage)}
            {loading && (
              <div className="loading-message">
                <span>Assistant is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="input-area">
            <div className="input-container">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={loading || assistantRunning}
                className="message-input"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading || assistantRunning}
                className="send-button"
              >
                Send
              </button>
            </div>
            
            {/* Quick Action Buttons */}
            <div className="quick-actions">
              <button
                onClick={() => setShowSearchPanel(!showSearchPanel)}
                className="quick-action-btn"
              >
                Search
              </button>
              <button
                onClick={() => setShowPrepPanel(!showPrepPanel)}
                className="quick-action-btn"
              >
                Prep
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Approval Modal */}
      {showApprovalModal && pendingApproval && (
        <ApprovalModal
          approval={pendingApproval}
          onApprove={() => {
            setShowApprovalModal(false);
            setPendingApproval(null);
          }}
          onDeny={() => {
            setShowApprovalModal(false);
            setPendingApproval(null);
          }}
        />
      )}

      {/* Error Display */}
      <ErrorService />
    </div>
  );
}

export default AdminChat;