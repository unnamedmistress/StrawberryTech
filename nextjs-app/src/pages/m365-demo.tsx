import React from 'react';
import Head from 'next/head';
import { ThemeProvider, useTheme } from '../components/ui/ThemeToggle';
import { ToastProvider, useToast } from '../components/ui/ToastProvider';
import QuickActionsBar from '../components/ui/QuickActionsBar';
import SearchPanel from '../components/ui/SearchPanel';
import MobileFab from '../components/ui/MobileFab';
import ThemeToggle from '../components/ui/ThemeToggle';
import ApprovalModal from '../components/approval/ApprovalModal';
import MarkdownRenderer from '../components/ui/MarkdownRenderer';
import { QuickAction, SearchSuggestion, ApprovalRequest, SharePointCitation } from '../types/microsoft365';

const DemoContent: React.FC = () => {
  const [showSearch, setShowSearch] = React.useState(false);
  const [showApproval, setShowApproval] = React.useState(false);
  const [searchMode, setSearchMode] = React.useState<'sharepoint' | 'microsoft_search'>('sharepoint');
  
  const { theme, resolvedTheme } = useTheme();
  const toast = useToast();

  const sampleMarkdown = `# Microsoft 365 Integration Demo

This demonstration showcases the **complete Microsoft 365 integration** implementation with all required features:

## ✅ Implemented Features

- **Power Apps Connectors**: All Microsoft 365 operations go through host-generated connectors
- **Azure OpenAI Assistant**: Proper ID naming with \`thread_\`, \`msg_\`, \`run_\`, \`file_\` prefixes
- **SharePoint Citations**: Automatic citation extraction and metadata[^1]
- **Human Approval**: Mandatory approval for all external communications
- **Dataverse Persistence**: Complete repository layer with 30-day purge
- **Modern UX**: Responsive design with mobile support

## Key Components

1. **Search Panel** - Unified search across SharePoint and Microsoft Search
2. **Quick Actions** - Context-aware action buttons
3. **Approval Modals** - Human approval with short-code audit trails
4. **Theme Support** - Light, dark, and system theme detection
5. **Toast Notifications** - Centralized error and success messaging

[^1]: Citations are automatically extracted from SharePoint content and displayed with proper metadata.`;

  const citations: SharePointCitation[] = [
    {
      id: 'sp-001',
      title: 'Microsoft 365 Integration Guide',
      url: 'https://docs.microsoft.com/en-us/power-platform/admin/security/overview',
      webUrl: 'https://sharepoint.company.com/sites/tech/documents/integration-guide.docx',
      siteId: 'site-001',
      lastModifiedDateTime: new Date().toISOString(),
      author: {
        id: 'user-001',
        displayName: 'Technical Writer',
        mail: 'writer@company.com',
        userPrincipalName: 'writer@company.com'
      }
    }
  ];

  const quickActions: QuickAction[] = [
    {
      id: 'search',
      icon: '🔍',
      label: 'Search',
      action: () => setShowSearch(true)
    },
    {
      id: 'approve',
      icon: '✓',
      label: 'Request Approval',
      action: () => {
        setShowApproval(true);
        toast.addToast({
          type: 'info',
          title: 'Approval Requested',
          message: 'Email approval request created',
          shortCode: 'ABC123'
        });
      }
    },
    {
      id: 'export',
      icon: '💾',
      label: 'Export',
      action: () => {
        toast.addToast({
          type: 'success',
          title: 'Export Started',
          message: 'Conversation being exported to Word',
          action: {
            label: 'View Progress',
            onClick: () => console.log('View export progress')
          }
        });
      }
    },
    {
      id: 'theme',
      icon: resolvedTheme === 'dark' ? '🌙' : '☀️',
      label: 'Theme',
      action: () => {
        toast.addToast({
          type: 'info',
          title: 'Theme Support',
          message: `Current theme: ${theme} (resolved: ${resolvedTheme})`
        });
      }
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
      onClick: () => {
        toast.addToast({
          type: 'success',
          title: 'New Conversation',
          message: 'Starting new conversation with Azure OpenAI Assistant'
        });
      }
    },
    {
      id: 'settings',
      icon: '⚙️',
      label: 'Settings',
      onClick: () => {
        toast.addToast({
          type: 'info',
          title: 'Settings',
          message: 'Configuration panel would open here'
        });
      }
    }
  ];

  const sampleApproval: ApprovalRequest = {
    id: 'approval-001',
    type: 'outlook_mail',
    requestedBy: 'demo-user',
    requestedAt: new Date().toISOString(),
    status: 'pending',
    shortCode: 'ABC123',
    content: {
      subject: 'Microsoft 365 Integration Demo Results',
      body: 'Please review the attached conversation summary and project results.\n\nThe implementation includes all requested features:\n- Power Apps connector integration\n- Azure OpenAI with SharePoint citations\n- Human approval workflows\n- Modern responsive UX\n\nBest regards,\nDemo User',
      recipients: ['manager@company.com', 'stakeholder@company.com']
    }
  };

  const handleSearchResult = (result: SearchSuggestion) => {
    setShowSearch(false);
    toast.addToast({
      type: 'success',
      title: 'Search Result Selected',
      message: `Selected: ${result.text} (${result.type})`
    });
  };

  const handleApproval = (approved: boolean, reason?: string) => {
    setShowApproval(false);
    toast.addToast({
      type: approved ? 'success' : 'warning',
      title: approved ? 'Request Approved' : 'Request Rejected',
      message: approved 
        ? 'Email will be sent via Outlook connector' 
        : `Rejected: ${reason}`,
      shortCode: 'ABC123'
    });
  };

  return (
    <div className="demo-page">
      <div className="demo-header">
        <div className="header-content">
          <h1>Microsoft 365 Integration Demo</h1>
          <div className="header-actions">
            <ThemeToggle />
          </div>
        </div>
        <div className="status-bar">
          <span className="status-item">✅ Connectors Ready</span>
          <span className="status-item">🔄 Assistant Active</span>
          <span className="status-item">🛡️ Approval System Online</span>
        </div>
      </div>

      <div className="demo-content">
        <div className="actions-section">
          <h2>Quick Actions</h2>
          <QuickActionsBar actions={quickActions} />
        </div>

        <div className="content-section">
          <h2>Sample Assistant Response</h2>
          <div className="markdown-container">
            <MarkdownRenderer 
              content={sampleMarkdown} 
              citations={citations}
              allowHtml={false}
            />
          </div>
        </div>

        <div className="features-section">
          <h2>Integration Features</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <h3>🔗 Power Apps Connectors</h3>
              <p>All Microsoft 365 operations routed through host-generated connectors. No direct Graph API calls.</p>
            </div>
            <div className="feature-card">
              <h3>🤖 Azure OpenAI Assistant</h3>
              <p>Standardized ID naming, full CRUD operations, and automatic SharePoint citation extraction.</p>
            </div>
            <div className="feature-card">
              <h3>🗃️ Dataverse Persistence</h3>
              <p>Complete repository layer with audit logging and automated 30-day data purge.</p>
            </div>
            <div className="feature-card">
              <h3>✅ Human Approval</h3>
              <p>Mandatory approval workflows for all external communications with short-code audit trails.</p>
            </div>
            <div className="feature-card">
              <h3>📱 Modern UX</h3>
              <p>Responsive design with mobile FAB, theme support, and accessibility features.</p>
            </div>
            <div className="feature-card">
              <h3>🔍 Unified Search</h3>
              <p>Search across SharePoint and Microsoft Search with auto-opening panels and suggestions.</p>
            </div>
          </div>
        </div>
      </div>

      <MobileFab
        primaryIcon="🚀"
        primaryLabel="Demo Actions"
        actions={fabActions}
      />

      <SearchPanel
        isVisible={showSearch}
        onClose={() => setShowSearch(false)}
        onSelectResult={handleSearchResult}
        searchMode={searchMode}
        onModeChange={setSearchMode}
        placeholder="Search Microsoft 365 content..."
      />

      {showApproval && (
        <ApprovalModal
          request={sampleApproval}
          isVisible={true}
          onApprove={(reason) => handleApproval(true, reason)}
          onReject={(reason) => handleApproval(false, reason)}
          onClose={() => setShowApproval(false)}
        />
      )}

      <style jsx>{`
        .demo-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          padding: 2rem 1rem;
          transition: all 0.3s ease;
        }

        .demo-header {
          max-width: 1200px;
          margin: 0 auto 3rem;
          text-align: center;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .header-content h1 {
          margin: 0;
          color: #2c3e50;
          font-size: 2.5rem;
          font-weight: 700;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
        }

        .status-bar {
          display: flex;
          justify-content: center;
          gap: 2rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 12px;
          backdrop-filter: blur(10px);
        }

        .status-item {
          font-size: 0.9rem;
          font-weight: 500;
          color: #495057;
        }

        .demo-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 3rem;
        }

        .actions-section,
        .content-section,
        .features-section {
          background: rgba(255, 255, 255, 0.9);
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
        }

        .actions-section h2,
        .content-section h2,
        .features-section h2 {
          margin: 0 0 1.5rem 0;
          color: #2c3e50;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .markdown-container {
          border: 1px solid #dee2e6;
          border-radius: 8px;
          overflow: hidden;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .feature-card {
          padding: 1.5rem;
          background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
          border-radius: 12px;
          border: 1px solid #e9ecef;
          transition: all 0.2s ease;
        }

        .feature-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
        }

        .feature-card h3 {
          margin: 0 0 0.75rem 0;
          color: #2c3e50;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .feature-card p {
          margin: 0;
          color: #6c757d;
          line-height: 1.5;
        }

        /* Dark mode */
        :global(.dark) .demo-page {
          background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
        }

        :global(.dark) .header-content h1 {
          color: #f7fafc;
        }

        :global(.dark) .status-bar {
          background: rgba(45, 55, 72, 0.8);
        }

        :global(.dark) .status-item {
          color: #e2e8f0;
        }

        :global(.dark) .actions-section,
        :global(.dark) .content-section,
        :global(.dark) .features-section {
          background: rgba(45, 55, 72, 0.9);
        }

        :global(.dark) .actions-section h2,
        :global(.dark) .content-section h2,
        :global(.dark) .features-section h2 {
          color: #f7fafc;
        }

        :global(.dark) .markdown-container {
          border-color: #4a5568;
        }

        :global(.dark) .feature-card {
          background: linear-gradient(135deg, #374151 0%, #4a5568 100%);
          border-color: #6b7280;
        }

        :global(.dark) .feature-card h3 {
          color: #f7fafc;
        }

        :global(.dark) .feature-card p {
          color: #d1d5db;
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          .demo-page {
            padding: 1rem 0.5rem;
          }

          .header-content {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .header-content h1 {
            font-size: 2rem;
          }

          .status-bar {
            flex-direction: column;
            gap: 0.5rem;
            text-align: center;
          }

          .actions-section,
          .content-section,
          .features-section {
            padding: 1.5rem;
            margin: 0 0.5rem;
          }

          .feature-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

const Microsoft365DemoPage: React.FC = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Head>
          <title>Microsoft 365 Integration Demo - StrawberryTech</title>
          <meta name="description" content="Complete Microsoft 365 integration showcase with Power Apps connectors, Azure OpenAI, and modern UX components" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <DemoContent />
      </ToastProvider>
    </ThemeProvider>
  );
};

export default Microsoft365DemoPage;