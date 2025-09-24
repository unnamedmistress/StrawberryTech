/**
 * Dataverse Repository Service
 * Handles all Dataverse entity operations through Power Platform connectors
 * Implements the 6 persistence tables: Conversation, Message, AttachmentLink, MeetingContext, ExportArtifact, AuditLog
 */

import { connectorService, ConnectorResponse } from './CodeAppConnectorService';

// Dataverse Entity Types
export interface Conversation {
  conversationId: string;
  topic: string;
  createdOn: string;
  owner: string;
  lastMessageOn?: string;
  messageCount?: number;
  status?: 'active' | 'archived';
}

export interface Message {
  messageId: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  contentHtml?: string;
  citationsJson?: string;
  createdOn: string;
  tokenCount?: number;
  metadata?: string;
}

export interface AttachmentLink {
  attachmentId: string;
  messageId: string;
  url: string;
  driveItemId?: string;
  fileName: string;
  sizeBytes?: number;
  sha1?: string;
  uploadedOn: string;
  contentType?: string;
}

export interface MeetingContext {
  meetingContextId: string;
  conversationId: string;
  eventId: string;
  attendeesJson: string;
  scheduledTime: string;
  meetingSubject?: string;
  organizerEmail?: string;
  preparationNotes?: string;
}

export interface ExportArtifact {
  artifactId: string;
  conversationId: string;
  artifactType: 'onenote' | 'word' | 'pdf' | 'json';
  targetUrl: string;
  fileName: string;
  createdOn: string;
  fileSize?: number;
  exportedBy?: string;
}

export interface AuditLog {
  auditId: string;
  action: string;
  target: string;
  severity: 'INFO' | 'WARNING' | 'ERROR';
  payloadMasked: string;
  correlationId: string;
  createdOn: string;
  userId?: string;
  sessionId?: string;
}

class DataverseRepository {
  private entityNames = {
    conversation: 'AdminChat_Conversation',
    message: 'AdminChat_Message', 
    attachmentLink: 'AdminChat_AttachmentLink',
    meetingContext: 'AdminChat_MeetingContext',
    exportArtifact: 'AdminChat_ExportArtifact',
    auditLog: 'AdminChat_AuditLog'
  };

  /**
   * Generic create record operation
   */
  private async createRecord<T>(entityName: string, data: Partial<T>): Promise<ConnectorResponse<{ id: string }>> {
    try {
      return await connectorService.callConnector('dataverse', 'createRecord', {
        entityName,
        data
      });
    } catch (error) {
      console.error(`DataverseRepository.createRecord failed for ${entityName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generic get record operation
   */
  private async getRecord<T>(entityName: string, id: string, select?: string[]): Promise<ConnectorResponse<T>> {
    try {
      return await connectorService.callConnector('dataverse', 'getRecord', {
        entityName,
        id,
        select: select?.join(',')
      });
    } catch (error) {
      console.error(`DataverseRepository.getRecord failed for ${entityName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generic query records operation
   */
  private async queryRecords<T>(
    entityName: string, 
    filter?: string, 
    orderBy?: string, 
    top?: number,
    select?: string[]
  ): Promise<ConnectorResponse<T[]>> {
    try {
      return await connectorService.callConnector('dataverse', 'listRecords', {
        entityName,
        filter,
        orderBy,
        top,
        select: select?.join(',')
      });
    } catch (error) {
      console.error(`DataverseRepository.queryRecords failed for ${entityName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generic update record operation
   */
  private async updateRecord<T>(entityName: string, id: string, data: Partial<T>): Promise<ConnectorResponse<void>> {
    try {
      return await connectorService.callConnector('dataverse', 'updateRecord', {
        entityName,
        id,
        data
      });
    } catch (error) {
      console.error(`DataverseRepository.updateRecord failed for ${entityName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generic delete record operation
   */
  private async deleteRecord(entityName: string, id: string): Promise<ConnectorResponse<void>> {
    try {
      return await connectorService.callConnector('dataverse', 'deleteRecord', {
        entityName,
        id
      });
    } catch (error) {
      console.error(`DataverseRepository.deleteRecord failed for ${entityName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Conversation Operations
  async createConversation(conversation: Omit<Conversation, 'conversationId'>): Promise<ConnectorResponse<{ id: string }>> {
    const conversationWithId = {
      ...conversation,
      conversationId: `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    return await this.createRecord<Conversation>(this.entityNames.conversation, conversationWithId);
  }

  async getConversation(conversationId: string): Promise<ConnectorResponse<Conversation>> {
    return await this.getRecord<Conversation>(this.entityNames.conversation, conversationId);
  }

  async getConversationsByOwner(owner: string, limit: number = 50): Promise<ConnectorResponse<Conversation[]>> {
    return await this.queryRecords<Conversation>(
      this.entityNames.conversation,
      `owner eq '${owner}'`,
      'createdOn desc',
      limit
    );
  }

  async updateConversation(conversationId: string, updates: Partial<Conversation>): Promise<ConnectorResponse<void>> {
    return await this.updateRecord<Conversation>(this.entityNames.conversation, conversationId, updates);
  }

  // Message Operations
  async createMessage(message: Omit<Message, 'messageId'>): Promise<ConnectorResponse<{ id: string }>> {
    const messageWithId = {
      ...message,
      messageId: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    return await this.createRecord<Message>(this.entityNames.message, messageWithId);
  }

  async getMessage(messageId: string): Promise<ConnectorResponse<Message>> {
    return await this.getRecord<Message>(this.entityNames.message, messageId);
  }

  async getMessagesByConversation(conversationId: string, limit: number = 100): Promise<ConnectorResponse<Message[]>> {
    return await this.queryRecords<Message>(
      this.entityNames.message,
      `conversationId eq '${conversationId}'`,
      'createdOn asc',
      limit
    );
  }

  // AttachmentLink Operations
  async createAttachmentLink(attachment: Omit<AttachmentLink, 'attachmentId'>): Promise<ConnectorResponse<{ id: string }>> {
    const attachmentWithId = {
      ...attachment,
      attachmentId: `att-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    return await this.createRecord<AttachmentLink>(this.entityNames.attachmentLink, attachmentWithId);
  }

  async getAttachmentsByMessage(messageId: string): Promise<ConnectorResponse<AttachmentLink[]>> {
    return await this.queryRecords<AttachmentLink>(
      this.entityNames.attachmentLink,
      `messageId eq '${messageId}'`,
      'uploadedOn desc'
    );
  }

  async getAttachmentByDriveItemId(driveItemId: string): Promise<ConnectorResponse<AttachmentLink>> {
    const result = await this.queryRecords<AttachmentLink>(
      this.entityNames.attachmentLink,
      `driveItemId eq '${driveItemId}'`,
      undefined,
      1
    );
    
    if (result.success && result.data && result.data.length > 0) {
      return {
        ...result,
        data: result.data[0]
      };
    }
    
    return {
      success: false,
      error: 'Attachment not found'
    };
  }

  // MeetingContext Operations
  async createMeetingContext(context: Omit<MeetingContext, 'meetingContextId'>): Promise<ConnectorResponse<{ id: string }>> {
    const contextWithId = {
      ...context,
      meetingContextId: `mtg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    return await this.createRecord<MeetingContext>(this.entityNames.meetingContext, contextWithId);
  }

  async getMeetingContext(meetingContextId: string): Promise<ConnectorResponse<MeetingContext>> {
    return await this.getRecord<MeetingContext>(this.entityNames.meetingContext, meetingContextId);
  }

  async getMeetingContextByEventId(eventId: string): Promise<ConnectorResponse<MeetingContext>> {
    const result = await this.queryRecords<MeetingContext>(
      this.entityNames.meetingContext,
      `eventId eq '${eventId}'`,
      undefined,
      1
    );
    
    if (result.success && result.data && result.data.length > 0) {
      return {
        ...result,
        data: result.data[0]
      };
    }
    
    return {
      success: false,
      error: 'Meeting context not found'
    };
  }

  // ExportArtifact Operations
  async createExportArtifact(artifact: Omit<ExportArtifact, 'artifactId'>): Promise<ConnectorResponse<{ id: string }>> {
    const artifactWithId = {
      ...artifact,
      artifactId: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    return await this.createRecord<ExportArtifact>(this.entityNames.exportArtifact, artifactWithId);
  }

  async getExportArtifactsByConversation(conversationId: string): Promise<ConnectorResponse<ExportArtifact[]>> {
    return await this.queryRecords<ExportArtifact>(
      this.entityNames.exportArtifact,
      `conversationId eq '${conversationId}'`,
      'createdOn desc'
    );
  }

  async getExportArtifactsByType(artifactType: ExportArtifact['artifactType']): Promise<ConnectorResponse<ExportArtifact[]>> {
    return await this.queryRecords<ExportArtifact>(
      this.entityNames.exportArtifact,
      `artifactType eq '${artifactType}'`,
      'createdOn desc'
    );
  }

  // AuditLog Operations
  async createAuditLog(log: Omit<AuditLog, 'auditId'>): Promise<ConnectorResponse<{ id: string }>> {
    const logWithId = {
      ...log,
      auditId: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    return await this.createRecord<AuditLog>(this.entityNames.auditLog, logWithId);
  }

  async getAuditLogs(
    filter?: string,
    limit: number = 1000,
    orderBy: string = 'createdOn desc'
  ): Promise<ConnectorResponse<AuditLog[]>> {
    return await this.queryRecords<AuditLog>(
      this.entityNames.auditLog,
      filter,
      orderBy,
      limit
    );
  }

  async getAuditLogsByCorrelation(correlationId: string): Promise<ConnectorResponse<AuditLog[]>> {
    return await this.queryRecords<AuditLog>(
      this.entityNames.auditLog,
      `correlationId eq '${correlationId}'`,
      'createdOn asc'
    );
  }

  async getAuditLogsBySeverity(severity: AuditLog['severity'], limit: number = 100): Promise<ConnectorResponse<AuditLog[]>> {
    return await this.queryRecords<AuditLog>(
      this.entityNames.auditLog,
      `severity eq '${severity}'`,
      'createdOn desc',
      limit
    );
  }

  // Audit Log Purge Operations
  async purgeOldAuditLogs(daysToRetain: number = 30): Promise<ConnectorResponse<{ deletedCount: number }>> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToRetain);
      const cutoffIso = cutoffDate.toISOString();

      // Get records to delete
      const oldLogsResult = await this.queryRecords<AuditLog>(
        this.entityNames.auditLog,
        `createdOn lt '${cutoffIso}'`,
        'createdOn asc',
        5000 // Delete in batches of 5000
      );

      if (!oldLogsResult.success || !oldLogsResult.data) {
        return {
          success: false,
          error: 'Failed to query old audit logs'
        };
      }

      let deletedCount = 0;
      const correlationId = `AUDIT-PURGE-30D-${Date.now()}`;

      // Delete each record
      for (const log of oldLogsResult.data) {
        const deleteResult = await this.deleteRecord(this.entityNames.auditLog, log.auditId);
        if (deleteResult.success) {
          deletedCount++;
        }
      }

      // Log the purge operation
      await this.createAuditLog({
        action: 'AUDIT_LOG_PURGE',
        target: `${deletedCount} records`,
        severity: 'INFO',
        payloadMasked: `Purged ${deletedCount} audit log records older than ${daysToRetain} days`,
        correlationId,
        createdOn: new Date().toISOString(),
        userId: 'system',
        sessionId: 'purge-job'
      });

      return {
        success: true,
        data: { deletedCount },
        correlationId
      };

    } catch (error) {
      console.error('DataverseRepository.purgeOldAuditLogs failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Utility Methods
  async getConversationStatistics(conversationId: string): Promise<ConnectorResponse<{
    messageCount: number;
    attachmentCount: number;
    exportCount: number;
    lastActivity: string;
  }>> {
    try {
      // Get message count
      const messagesResult = await this.getMessagesByConversation(conversationId);
      const messageCount = messagesResult.success ? messagesResult.data?.length || 0 : 0;

      // Get attachment count
      const attachmentPromises = messagesResult.data?.map(msg => 
        this.getAttachmentsByMessage(msg.messageId)
      ) || [];
      
      const attachmentResults = await Promise.all(attachmentPromises);
      const attachmentCount = attachmentResults
        .filter(result => result.success)
        .reduce((sum, result) => sum + (result.data?.length || 0), 0);

      // Get export count
      const exportsResult = await this.getExportArtifactsByConversation(conversationId);
      const exportCount = exportsResult.success ? exportsResult.data?.length || 0 : 0;

      // Get last activity
      const lastMessage = messagesResult.data?.[messagesResult.data.length - 1];
      const lastActivity = lastMessage?.createdOn || new Date().toISOString();

      return {
        success: true,
        data: {
          messageCount,
          attachmentCount,
          exportCount,
          lastActivity
        }
      };

    } catch (error) {
      console.error('DataverseRepository.getConversationStatistics failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Export singleton instance
export const dataverseRepository = new DataverseRepository();
export default DataverseRepository;