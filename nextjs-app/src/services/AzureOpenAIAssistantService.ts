import { AssistantThread, AssistantMessage, AssistantRun, AssistantFile, SharePointCitation } from '../types/microsoft365';
import { getConnectorService, ConnectorResponse } from './CodeAppConnectorService';

export interface CreateThreadRequest {
  metadata?: Record<string, unknown>;
}

export interface CreateMessageRequest {
  role: 'user' | 'assistant';
  content: string;
  file_ids?: string[];
  metadata?: Record<string, unknown>;
}

export interface CreateRunRequest {
  assistant_id: string;
  instructions?: string;
  additional_instructions?: string;
  tools?: Array<{ type: string }>;
  metadata?: Record<string, unknown>;
}

export interface UploadFileRequest {
  file: File | Blob;
  purpose: 'assistants';
  filename?: string;
}

/**
 * Azure OpenAI Assistant Service with proper ID naming and SharePoint citation support
 * Uses the CodeAppConnectorService for all API calls
 */
export class AzureOpenAIAssistantService {
  private connectorService = getConnectorService();
  private readonly assistantId: string;

  constructor(assistantId: string = process.env.NEXT_PUBLIC_AZURE_OPENAI_ASSISTANT_ID || '') {
    this.assistantId = assistantId;
  }

  /**
   * Create a new conversation thread
   * Uses standardized ID format: thread_{timestamp}_{uuid}
   */
  async createThread(request: CreateThreadRequest = {}): Promise<ConnectorResponse<AssistantThread>> {
    const threadId = this.generateThreadId();
    
    const response = await this.connectorService.makeConnectorCall('azureOpenAI', 'createThread', {
      threadId,
      metadata: {
        ...request.metadata,
        createdAt: new Date().toISOString(),
        source: 'strawberrytech_assistant'
      }
    });

    if (response.success && response.data) {
      // Ensure proper thread object structure
      const thread: AssistantThread = {
        id: threadId,
        object: 'thread',
        created_at: Math.floor(Date.now() / 1000),
        metadata: request.metadata
      };
      return { ...response, data: thread };
    }

    return response as ConnectorResponse<AssistantThread>;
  }

  /**
   * Retrieve a thread by ID
   */
  async getThread(threadId: string): Promise<ConnectorResponse<AssistantThread>> {
    return this.connectorService.makeConnectorCall('azureOpenAI', 'getThread', {
      threadId
    });
  }

  /**
   * Update a thread's metadata
   */
  async updateThread(threadId: string, metadata: Record<string, unknown>): Promise<ConnectorResponse<AssistantThread>> {
    return this.connectorService.makeConnectorCall('azureOpenAI', 'updateThread', {
      threadId,
      metadata: {
        ...metadata,
        updatedAt: new Date().toISOString()
      }
    });
  }

  /**
   * Delete a thread
   */
  async deleteThread(threadId: string): Promise<ConnectorResponse<{ deleted: boolean }>> {
    return this.connectorService.makeConnectorCall('azureOpenAI', 'deleteThread', {
      threadId
    });
  }

  /**
   * Create a message in a thread
   * Uses standardized ID format: msg_{timestamp}_{uuid}
   */
  async createMessage(threadId: string, request: CreateMessageRequest): Promise<ConnectorResponse<AssistantMessage>> {
    const messageId = this.generateMessageId();
    
    const response = await this.connectorService.makeConnectorCall('azureOpenAI', 'createMessage', {
      threadId,
      messageId,
      role: request.role,
      content: request.content,
      file_ids: request.file_ids,
      metadata: {
        ...request.metadata,
        createdAt: new Date().toISOString()
      }
    });

    if (response.success && response.data) {
      // Process citations from SharePoint if the content references files
      const citations = await this.extractSharePointCitations(request.content, request.file_ids);
      
      const message: AssistantMessage = {
        id: messageId,
        object: 'thread.message',
        created_at: Math.floor(Date.now() / 1000),
        thread_id: threadId,
        role: request.role,
        content: [{
          type: 'text',
          text: {
            value: request.content,
            annotations: []
          }
        }],
        metadata: request.metadata,
        citations
      };

      return { ...response, data: message };
    }

    return response;
  }

  /**
   * List messages in a thread
   */
  async listMessages(threadId: string, limit: number = 20): Promise<ConnectorResponse<{ data: AssistantMessage[] }>> {
    const response = await this.connectorService.makeConnectorCall('azureOpenAI', 'listMessages', {
      threadId,
      limit
    });

    if (response.success && response.data) {
      // Enhance messages with SharePoint citations
      const messages = response.data as { data: AssistantMessage[] };
      for (const message of messages.data) {
        if (message.role === 'assistant' && !message.citations) {
          message.citations = await this.extractSharePointCitations(
            message.content[0]?.text?.value || '',
            undefined
          );
        }
      }
    }

    return response;
  }

  /**
   * Get a specific message
   */
  async getMessage(threadId: string, messageId: string): Promise<ConnectorResponse<AssistantMessage>> {
    const response = await this.connectorService.makeConnectorCall('azureOpenAI', 'getMessage', {
      threadId,
      messageId
    });

    if (response.success && response.data) {
      const message = response.data as AssistantMessage;
      if (message.role === 'assistant' && !message.citations) {
        message.citations = await this.extractSharePointCitations(
          message.content[0]?.text?.value || '',
          undefined
        );
      }
    }

    return response;
  }

  /**
   * Create a run to execute the assistant
   * Uses standardized ID format: run_{timestamp}_{uuid}
   */
  async createRun(threadId: string, request: CreateRunRequest): Promise<ConnectorResponse<AssistantRun>> {
    const runId = this.generateRunId();
    
    return this.connectorService.makeConnectorCall('azureOpenAI', 'createRun', {
      threadId,
      runId,
      assistant_id: request.assistant_id || this.assistantId,
      instructions: request.instructions,
      additional_instructions: request.additional_instructions,
      tools: request.tools,
      metadata: {
        ...request.metadata,
        createdAt: new Date().toISOString()
      }
    });
  }

  /**
   * Get a run's status
   */
  async getRun(threadId: string, runId: string): Promise<ConnectorResponse<AssistantRun>> {
    return this.connectorService.makeConnectorCall('azureOpenAI', 'getRun', {
      threadId,
      runId
    });
  }

  /**
   * Cancel a run
   */
  async cancelRun(threadId: string, runId: string): Promise<ConnectorResponse<AssistantRun>> {
    return this.connectorService.makeConnectorCall('azureOpenAI', 'cancelRun', {
      threadId,
      runId
    });
  }

  /**
   * Upload a file for use with assistants
   * Uses standardized ID format: file_{timestamp}_{uuid}
   */
  async uploadFile(request: UploadFileRequest): Promise<ConnectorResponse<AssistantFile>> {
    const fileId = this.generateFileId();
    
    // Convert file to base64 for connector transmission
    const arrayBuffer = await request.file.arrayBuffer();
    const base64Content = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    
    return this.connectorService.makeConnectorCall('azureOpenAI', 'uploadFile', {
      fileId,
      filename: request.filename || (request.file as File).name || 'upload',
      content: base64Content,
      contentType: request.file.type,
      purpose: request.purpose
    });
  }

  /**
   * Get file information
   */
  async getFile(fileId: string): Promise<ConnectorResponse<AssistantFile>> {
    return this.connectorService.makeConnectorCall('azureOpenAI', 'getFile', {
      fileId
    });
  }

  /**
   * Delete a file
   */
  async deleteFile(fileId: string): Promise<ConnectorResponse<{ deleted: boolean }>> {
    return this.connectorService.makeConnectorCall('azureOpenAI', 'deleteFile', {
      fileId
    });
  }

  /**
   * Extract SharePoint citations from assistant response content
   */
  private async extractSharePointCitations(content: string, fileIds?: string[]): Promise<SharePointCitation[]> {
    const citations: SharePointCitation[] = [];
    
    try {
      // Extract citation patterns from content (e.g., [doc1], 【source.pdf】, etc.)
      const citationPatterns = content.match(/\[([^\]]+)\]|【([^】]+)】/g) || [];
      
      for (const pattern of citationPatterns) {
        const citationText = pattern.replace(/[\[\]【】]/g, '');
        
        // Search SharePoint for documents matching the citation
        const searchResponse = await this.connectorService.searchSharePoint(citationText);
        
        if (searchResponse.success && searchResponse.data) {
          const sharePointResults = searchResponse.data as SharePointCitation[];
          citations.push(...sharePointResults.slice(0, 1)); // Take the first result
        }
      }
      
      // If file IDs are provided, get their SharePoint metadata
      if (fileIds && fileIds.length > 0) {
        for (const fileId of fileIds) {
          try {
            const fileResponse = await this.connectorService.getSharePointFile(fileId);
            if (fileResponse.success && fileResponse.data?.metadata) {
              citations.push(fileResponse.data.metadata);
            }
          } catch (error) {
            console.warn(`Failed to get SharePoint metadata for file ${fileId}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error extracting SharePoint citations:', error);
    }
    
    return citations;
  }

  /**
   * Generate standardized thread ID
   */
  private generateThreadId(): string {
    const timestamp = Date.now();
    const uuid = this.generateUUID();
    return `thread_${timestamp}_${uuid}`;
  }

  /**
   * Generate standardized message ID
   */
  private generateMessageId(): string {
    const timestamp = Date.now();
    const uuid = this.generateUUID();
    return `msg_${timestamp}_${uuid}`;
  }

  /**
   * Generate standardized run ID
   */
  private generateRunId(): string {
    const timestamp = Date.now();
    const uuid = this.generateUUID();
    return `run_${timestamp}_${uuid}`;
  }

  /**
   * Generate standardized file ID
   */
  private generateFileId(): string {
    const timestamp = Date.now();
    const uuid = this.generateUUID();
    return `file_${timestamp}_${uuid}`;
  }

  /**
   * Generate UUID v4
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

// Singleton instance
let assistantServiceInstance: AzureOpenAIAssistantService | null = null;

export const getAssistantService = (assistantId?: string): AzureOpenAIAssistantService => {
  if (!assistantServiceInstance) {
    assistantServiceInstance = new AzureOpenAIAssistantService(assistantId);
  }
  return assistantServiceInstance;
};