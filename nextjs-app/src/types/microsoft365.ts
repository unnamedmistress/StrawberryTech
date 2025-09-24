// Microsoft 365 Integration Types
export interface PowerAppConnector {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  connectionId: string;
}

export interface M365User {
  id: string;
  displayName: string;
  mail: string;
  userPrincipalName: string;
}

export interface SharePointCitation {
  id: string;
  title: string;
  url: string;
  webUrl: string;
  siteId: string;
  listId?: string;
  itemId?: string;
  lastModifiedDateTime: string;
  author?: M365User;
}

// Azure OpenAI Assistant Types
export interface AssistantThread {
  id: string;
  object: 'thread';
  created_at: number;
  metadata?: Record<string, unknown>;
}

export interface AssistantMessage {
  id: string;
  object: 'thread.message';
  created_at: number;
  thread_id: string;
  role: 'user' | 'assistant';
  content: Array<{
    type: 'text';
    text: {
      value: string;
      annotations: Array<{
        type: 'file_citation' | 'file_path';
        text: string;
        start_index: number;
        end_index: number;
        file_citation?: {
          file_id: string;
          quote?: string;
        };
      }>;
    };
  }>;
  assistant_id?: string;
  run_id?: string;
  metadata?: Record<string, unknown>;
  citations?: SharePointCitation[];
}

export interface AssistantRun {
  id: string;
  object: 'thread.run';
  created_at: number;
  assistant_id: string;
  thread_id: string;
  status: 'queued' | 'in_progress' | 'requires_action' | 'cancelling' | 'cancelled' | 'failed' | 'completed' | 'expired';
  started_at?: number;
  expires_at?: number;
  cancelled_at?: number;
  failed_at?: number;
  completed_at?: number;
  last_error?: {
    code: string;
    message: string;
  };
  model: string;
  instructions?: string;
  tools: Array<{
    type: string;
  }>;
  metadata?: Record<string, unknown>;
}

export interface AssistantFile {
  id: string;
  object: 'assistant.file';
  created_at: number;
  assistant_id: string;
}

// Human Approval Types
export interface ApprovalRequest {
  id: string;
  type: 'outlook_mail' | 'meeting_schedule' | 'teams_post';
  requestedBy: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  shortCode: string;
  content: {
    subject?: string;
    body?: string;
    recipients?: string[];
    startTime?: string;
    endTime?: string;
    location?: string;
    channel?: string;
  };
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  reason?: string;
}

// UX Types
export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: () => void;
  disabled?: boolean;
}

export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'sharepoint' | 'microsoft_search';
  metadata?: Record<string, unknown>;
}

export interface ExportFormat {
  type: 'onenote' | 'word';
  title: string;
  content: string;
  metadata?: Record<string, unknown>;
}