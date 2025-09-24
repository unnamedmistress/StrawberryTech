import { getConnectorService } from './CodeAppConnectorService';
import { DataverseRepositoryFactory } from './DataverseRepositories';
import { ExportFormat } from '../types/microsoft365';
import { Message, Conversation } from '../types/dataverse';

export interface ExportOptions {
  includeTimestamps?: boolean;
  includeCitations?: boolean;
  includeMetadata?: boolean;
  format?: 'markdown' | 'html' | 'plain';
}

export interface ExportResult {
  success: boolean;
  exportId?: string;
  url?: string;
  error?: string;
}

/**
 * Export Service - Handles exporting conversations to OneNote and Word
 */
export class ExportService {
  private connectorService = getConnectorService();
  private exportRepo = DataverseRepositoryFactory.getExportRepository();

  /**
   * Export conversation to OneNote
   */
  async exportToOneNote(
    conversationId: string,
    notebookId?: string,
    sectionId?: string,
    options: ExportOptions = {}
  ): Promise<ExportResult> {
    try {
      // Get conversation and messages
      const { conversation, messages } = await this.getConversationData(conversationId);
      
      // Generate content
      const content = this.formatContent(messages, conversation, options);
      const title = `Conversation: ${conversation.title}`;

      // Create export record
      const exportArtifact = await this.exportRepo.create({
        conversationId,
        exportType: 'onenote',
        title,
        content,
        status: 'pending',
        requestedBy: 'current-user', // TODO: Get from context
        createdBy: 'system'
      });

      // Create OneNote page via connector
      const response = await this.connectorService.createOneNotePage(
        notebookId || 'default',
        sectionId || 'conversations',
        title,
        this.convertToOneNoteHtml(content, options)
      );

      if (response.success && response.data) {
        // Update export record
        await this.exportRepo.update(exportArtifact.id, {
          status: 'completed',
          fileUrl: response.data.webUrl,
          completedAt: new Date().toISOString()
        });

        return {
          success: true,
          exportId: exportArtifact.id,
          url: response.data.webUrl
        };
      } else {
        // Update export record with error
        await this.exportRepo.update(exportArtifact.id, {
          status: 'failed'
        });

        return {
          success: false,
          error: response.error?.message || 'Failed to create OneNote page'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Export failed'
      };
    }
  }

  /**
   * Export conversation to Word document
   */
  async exportToWord(
    conversationId: string,
    fileName?: string,
    siteId?: string,
    folderPath?: string,
    options: ExportOptions = {}
  ): Promise<ExportResult> {
    try {
      // Get conversation and messages
      const { conversation, messages } = await this.getConversationData(conversationId);
      
      // Generate content
      const content = this.formatContent(messages, conversation, options);
      const docFileName = fileName || `${conversation.title.replace(/[^a-zA-Z0-9]/g, '_')}.docx`;

      // Create export record
      const exportArtifact = await this.exportRepo.create({
        conversationId,
        exportType: 'word',
        title: docFileName,
        content,
        status: 'pending',
        requestedBy: 'current-user', // TODO: Get from context
        createdBy: 'system'
      });

      // Create Word document via connector
      const response = await this.connectorService.createWordDocument(
        docFileName,
        this.convertToWordContent(content, options),
        siteId,
        folderPath
      );

      if (response.success && response.data) {
        // Update export record
        await this.exportRepo.update(exportArtifact.id, {
          status: 'completed',
          fileUrl: response.data.webUrl,
          completedAt: new Date().toISOString()
        });

        return {
          success: true,
          exportId: exportArtifact.id,
          url: response.data.webUrl
        };
      } else {
        // Update export record with error
        await this.exportRepo.update(exportArtifact.id, {
          status: 'failed'
        });

        return {
          success: false,
          error: response.error?.message || 'Failed to create Word document'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Export failed'
      };
    }
  }

  /**
   * Get export status
   */
  async getExportStatus(exportId: string) {
    return await this.exportRepo.findById(exportId);
  }

  /**
   * List exports for a conversation
   */
  async getConversationExports(conversationId: string) {
    return await this.exportRepo.findByConversation(conversationId);
  }

  /**
   * List exports for current user
   */
  async getUserExports() {
    return await this.exportRepo.findByUser('current-user'); // TODO: Get from context
  }

  /**
   * Get conversation and messages data
   */
  private async getConversationData(conversationId: string): Promise<{
    conversation: Conversation;
    messages: Message[];
  }> {
    const conversationRepo = DataverseRepositoryFactory.getConversationRepository();
    const messageRepo = DataverseRepositoryFactory.getMessageRepository();

    const conversation = await conversationRepo.findById(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const messages = await messageRepo.findByConversation(conversationId);
    
    return { conversation, messages };
  }

  /**
   * Format content for export
   */
  private formatContent(
    messages: Message[],
    conversation: Conversation,
    options: ExportOptions
  ): string {
    let content = '';

    // Add header
    content += `# ${conversation.title}\n\n`;
    
    if (options.includeMetadata) {
      content += `**Created:** ${new Date(conversation.createdOn).toLocaleString()}\n`;
      content += `**Last Modified:** ${new Date(conversation.modifiedOn).toLocaleString()}\n`;
      content += `**Status:** ${conversation.status}\n\n`;
    }

    content += '---\n\n';

    // Add messages
    messages.forEach((message, index) => {
      const role = message.role === 'user' ? 'User' : 'Assistant';
      
      content += `## ${role}`;
      
      if (options.includeTimestamps) {
        content += ` - ${new Date(message.createdOn).toLocaleString()}`;
      }
      
      content += '\n\n';
      content += message.content;
      content += '\n\n';

      // Add citations if available
      if (options.includeCitations && message.citations) {
        try {
          const citations = JSON.parse(message.citations);
          if (citations.length > 0) {
            content += '### References\n\n';
            citations.forEach((citation: {title: string, webUrl: string, author?: {displayName: string}}, citIndex: number) => {
              content += `${citIndex + 1}. [${citation.title}](${citation.webUrl})`;
              if (citation.author?.displayName) {
                content += ` - By ${citation.author.displayName}`;
              }
              content += '\n';
            });
            content += '\n';
          }
        } catch (error) {
          console.warn('Failed to parse citations:', error);
        }
      }

      if (index < messages.length - 1) {
        content += '---\n\n';
      }
    });

    return content;
  }

  /**
   * Convert markdown content to OneNote-compatible HTML
   */
  private convertToOneNoteHtml(content: string, _options: ExportOptions): string {
    // Simple markdown to HTML conversion for OneNote
    const html = content
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      .replace(/^---$/gm, '<hr/>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br/>');

    return `<html><body><div>${html}</div></body></html>`;
  }

  /**
   * Convert content for Word document
   */
  private convertToWordContent(content: string, _options: ExportOptions): string {
    // For Word documents, we can use the raw markdown content
    // The connector should handle the conversion to Word format
    return content;
  }

  /**
   * Generate export preview
   */
  generatePreview(
    messages: Message[],
    conversation: Conversation,
    options: ExportOptions = {}
  ): ExportFormat {
    const content = this.formatContent(messages, conversation, options);
    
    return {
      type: 'word', // Default to Word for preview
      title: conversation.title,
      content,
      metadata: {
        messageCount: messages.length,
        createdOn: conversation.createdOn,
        lastModified: conversation.modifiedOn,
        options
      }
    };
  }
}

// Singleton instance
let exportServiceInstance: ExportService | null = null;

export const getExportService = (): ExportService => {
  if (!exportServiceInstance) {
    exportServiceInstance = new ExportService();
  }
  return exportServiceInstance;
};