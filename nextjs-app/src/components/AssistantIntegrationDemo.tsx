import React, { useState, useEffect } from 'react';
import { getConnectorService } from '../services/CodeAppConnectorService';
import { getAssistantService } from '../services/AzureOpenAIAssistantService';
import { getApprovalService } from '../services/HumanApprovalService';
import { getExportService } from '../services/ExportService';
import { DataverseRepositoryFactory } from '../services/DataverseRepositories';
import { useToast } from './ui/ToastProvider';
import ApprovalModal from './approval/ApprovalModal';
import SearchPanel from './ui/SearchPanel';
import MessageList from './ui/MessageList';
import QuickActionsBar from './ui/QuickActionsBar';
import MobileFab from './ui/MobileFab';
import { Message, Conversation } from '../types/dataverse';
import { ApprovalRequest, QuickAction, SearchSuggestion } from '../types/microsoft365';

interface AssistantIntegrationDemoProps {
  conversationId?: string;
}

const AssistantIntegrationDemo: React.FC<AssistantIntegrationDemoProps> = ({
  conversationId: initialConversationId
}) => {
  const [conversationId, setConversationId] = useState<string | null>(initialConversationId || null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchMode, setSearchMode] = useState<'sharepoint' | 'microsoft_search'>('sharepoint');
  const [approvalRequest, setApprovalRequest] = useState<ApprovalRequest | null>(null);
  const [input, setInput] = useState('');
  
  const toast = useToast();
  const connectorService = getConnectorService();
  const assistantService = getAssistantService();
  const approvalService = getApprovalService();
  const exportService = getExportService();
  
  const conversationRepo = DataverseRepositoryFactory.getConversationRepository();
  const messageRepo = DataverseRepositoryFactory.getMessageRepository();

  // Initialize conversation
  useEffect(() => {
    initializeConversation();
  }, []);

  const initializeConversation = async () => {
    try {
      // Initialize connector service
      await connectorService.initializeConnectors();
      
      if (conversationId) {
        await loadConversation(conversationId);
      } else {
        await createNewConversation();
      }
    } catch (error) {
      toast.addToast({
        type: 'error',
        title: 'Initialization Failed',
        message: error instanceof Error ? error.message : 'Failed to initialize conversation'
      });
    }
  };

  const loadConversation = async (id: string) => {
    setIsLoading(true);
    try {
      const conv = await conversationRepo.findById(id);
      const msgs = await messageRepo.findByConversation(id);
      
      setConversation(conv);
      setMessages(msgs || []);
    } catch (error) {
      toast.addToast({
        type: 'error',
        title: 'Failed to Load Conversation',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createNewConversation = async () => {
    try {
      const thread = await assistantService.createThread();
      if (!thread.success || !thread.data) {
        throw new Error('Failed to create assistant thread');
      }

      const newConversation = await conversationRepo.create({
        title: 'New Conversation',
        status: 'active',
        participantIds: ['current-user'],
        threadId: thread.data.id,
        createdBy: 'current-user'
      });

      setConversation(newConversation);
      setConversationId(newConversation.id);
    } catch (error) {
      toast.addToast({
        type: 'error',
        title: 'Failed to Create Conversation',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !conversation?.threadId) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      // Create user message
      const userMsg = await messageRepo.create({
        conversationId: conversation.id,
        content: userMessage,
        role: 'user',
        messageType: 'text',
        threadId: conversation.threadId!,
        createdBy: 'current-user'
      });

      setMessages(prev => [...prev, userMsg]);

      // Send to assistant
      await assistantService.createMessage(conversation.threadId!, {
        role: 'user',
        content: userMessage
      });

      // Create and run assistant
      const run = await assistantService.createRun(conversation.threadId!, {
        assistant_id: process.env.NEXT_PUBLIC_AZURE_OPENAI_ASSISTANT_ID || 'default'
      });

      if (run.success && run.data) {
        // Poll for completion (simplified - in real implementation, use WebSocket)
        setTimeout(async () => {
          const runStatus = await assistantService.getRun(conversation.threadId!, run.data!.id);
          if (runStatus.success && runStatus.data?.status === 'completed') {
            // Get assistant messages
            const messagesResponse = await assistantService.listMessages(conversation.threadId!);
            if (messagesResponse.success && messagesResponse.data) {
              const latestMessages = messagesResponse.data.data;
              const assistantMsg = latestMessages.find(m => m.role === 'assistant' && m.run_id === run.data!.id);
              
              if (assistantMsg) {
                const dbMessage = await messageRepo.create({
                  conversationId: conversation.id,
                  content: assistantMsg.content[0]?.text?.value || '',
                  role: 'assistant',
                  messageType: 'text',
                  threadId: conversation.threadId!,
                  runId: assistantMsg.run_id,
                  citations: JSON.stringify(assistantMsg.citations || []),
                  createdBy: 'system'
                });
                
                setMessages(prev => [...prev, dbMessage]);
              }
            }
          }
        }, 3000);
      }

    } catch (error) {
      toast.addToast({
        type: 'error',
        title: 'Failed to Send Message',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessageAction = async (messageId: string, action: string) => {
    switch (action) {
      case 'copy':
        toast.addToast({
          type: 'success',
          title: 'Copied to Clipboard',
          message: 'Message content copied successfully'
        });
        break;
        
      case 'regenerate':
        // Implement regeneration logic
        toast.addToast({
          type: 'info',
          title: 'Regenerating Response',
          message: 'Creating a new response...'
        });
        break;
        
      case 'export':
        if (conversation) {
          setIsLoading(true);
          try {
            const result = await exportService.exportToWord(conversation.id);
            if (result.success) {
              toast.addToast({
                type: 'success',
                title: 'Export Successful',
                message: 'Conversation exported to Word document',
                action: {
                  label: 'Open',
                  onClick: () => window.open(result.url, '_blank')
                }
              });
            } else {
              throw new Error(result.error);
            }
          } catch (error) {
            toast.addToast({
              type: 'error',
              title: 'Export Failed',
              message: error instanceof Error ? error.message : 'Unknown error'
            });
          } finally {
            setIsLoading(false);
          }
        }
        break;
    }
  };

  const handleSearchResult = (result: SearchSuggestion) => {
    setInput(prev => prev + (prev ? ' ' : '') + result.text);
    setShowSearch(false);
    
    toast.addToast({
      type: 'info',
      title: 'Search Result Added',
      message: `Added "${result.text}" to your message`
    });
  };

  const handleEmailAction = async () => {
    if (!conversation) return;

    try {
      const approval = await approvalService.requestEmailApproval(
        `Conversation Summary: ${conversation.title}`,
        `Please find the conversation summary attached.\n\nBest regards`,
        ['manager@company.com'],
        'current-user'
      );

      setApprovalRequest(approval);
      
      toast.addToast({
        type: 'info',
        title: 'Approval Requested',
        message: `Approval code: ${approval.shortCode}`,
        shortCode: approval.shortCode
      });
    } catch (error) {
      toast.addToast({
        type: 'error',
        title: 'Failed to Request Approval',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const handleApprovalDecision = async (approved: boolean, reason?: string) => {
    if (!approvalRequest) return;

    try {
      if (approved) {
        await approvalService.approveRequest(approvalRequest.id, 'current-user', reason);
        
        // Send email via connector
        const result = await connectorService.sendEmail({
          to: approvalRequest.content.recipients || [],
          subject: approvalRequest.content.subject || '',
          body: approvalRequest.content.body || ''
        }, approvalRequest.shortCode);

        if (result.success) {
          toast.addToast({
            type: 'success',
            title: 'Email Sent Successfully',
            shortCode: approvalRequest.shortCode
          });
        } else {
          throw new Error(result.error?.message || 'Failed to send email');
        }
      } else {
        await approvalService.rejectRequest(approvalRequest.id, 'current-user', reason || '');
        
        toast.addToast({
          type: 'info',
          title: 'Email Request Rejected',
          shortCode: approvalRequest.shortCode
        });
      }
    } catch (error) {
      toast.addToast({
        type: 'error',
        title: 'Approval Process Failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setApprovalRequest(null);
    }
  };

  const quickActions: QuickAction[] = [
    {
      id: 'search',
      icon: '🔍',
      label: 'Search',
      action: () => setShowSearch(true)
    },
    {
      id: 'email',
      icon: '📧',
      label: 'Email',
      action: handleEmailAction,
      disabled: !conversation
    },
    {
      id: 'export',
      icon: '💾',
      label: 'Export',
      action: () => handleMessageAction(conversation?.id || '', 'export'),
      disabled: !conversation || messages.length === 0
    }
  ];

  const fabActions = [
    {
      id: 'search',
      icon: '🔍',
      label: 'Search Documents',
      onClick: () => setShowSearch(true)
    },
    {
      id: 'new-conversation',
      icon: '💬',
      label: 'New Conversation',
      onClick: createNewConversation
    }
  ];

  if (!conversation) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">⟳</div>
        <p>Initializing conversation...</p>
      </div>
    );
  }

  return (
    <div className="assistant-integration-demo">
      <div className="demo-header">
        <h1>{conversation.title}</h1>
        <QuickActionsBar actions={quickActions} />
      </div>

      <div className="message-container">
        <MessageList
          messages={messages}
          height={400}
          isLoading={isLoading}
          onMessageAction={handleMessageAction}
        />
      </div>

      <div className="input-container">
        <div className="input-wrapper">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            disabled={isLoading}
          />
          <button 
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? '⟳' : '➤'}
          </button>
        </div>
      </div>

      <MobileFab
        primaryIcon="💬"
        primaryLabel="Assistant Actions"
        actions={fabActions}
      />

      <SearchPanel
        isVisible={showSearch}
        onClose={() => setShowSearch(false)}
        onSelectResult={handleSearchResult}
        searchMode={searchMode}
        onModeChange={setSearchMode}
      />

      {approvalRequest && (
        <ApprovalModal
          request={approvalRequest}
          isVisible={true}
          onApprove={(reason) => handleApprovalDecision(true, reason)}
          onReject={(reason) => handleApprovalDecision(false, reason)}
          onClose={() => setApprovalRequest(null)}
        />
      )}

      <style jsx>{`
        .assistant-integration-demo {
          max-width: 800px;
          margin: 0 auto;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          height: 100vh;
          max-height: 800px;
        }

        .demo-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e9ecef;
        }

        .demo-header h1 {
          margin: 0;
          color: #333;
          font-size: 1.5rem;
        }

        .message-container {
          flex: 1;
          margin-bottom: 1rem;
          min-height: 0;
        }

        .input-container {
          border-top: 1px solid #e9ecef;
          padding-top: 1rem;
        }

        .input-wrapper {
          display: flex;
          gap: 0.5rem;
        }

        .input-wrapper input {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          font-size: 1rem;
        }

        .input-wrapper input:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
        }

        .input-wrapper button {
          padding: 0.75rem 1rem;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          transition: background 0.2s;
        }

        .input-wrapper button:hover:not(:disabled) {
          background: #0056b3;
        }

        .input-wrapper button:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 400px;
          color: #6c757d;
        }

        .loading-spinner {
          font-size: 2rem;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Dark mode */
        :global(.dark) .demo-header {
          border-bottom-color: #4a5568;
        }

        :global(.dark) .demo-header h1 {
          color: #f7fafc;
        }

        :global(.dark) .input-container {
          border-top-color: #4a5568;
        }

        :global(.dark) .input-wrapper input {
          background: #2d3748;
          border-color: #4a5568;
          color: #f7fafc;
        }

        :global(.dark) .loading-container {
          color: #9ca3af;
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          .assistant-integration-demo {
            padding: 0.5rem;
            height: 100vh;
          }

          .demo-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .input-container {
            padding-bottom: calc(1rem + env(safe-area-inset-bottom));
          }
        }
      `}</style>
    </div>
  );
};

export default AssistantIntegrationDemo;