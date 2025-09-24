import { 
  BaseEntity, 
  Conversation, 
  Message, 
  AttachmentLink, 
  MeetingContext, 
  ExportArtifact, 
  AuditLog,
  IConversationRepository,
  IMessageRepository,
  IAttachmentRepository,
  IMeetingRepository,
  IExportRepository,
  IAuditRepository
} from '../types/dataverse';
import { getConnectorService } from './CodeAppConnectorService';

/**
 * Base repository class for common Dataverse operations
 */
abstract class BaseDataverseRepository<T extends BaseEntity> {
  protected connectorService = getConnectorService();
  protected abstract tableName: string;

  async findById(id: string): Promise<T | null> {
    const response = await this.connectorService.makeConnectorCall('dataverse', 'getRecord', {
      tableName: this.tableName,
      id
    });

    return response.success ? (response.data as T) : null;
  }

  async findAll(filters?: Record<string, unknown>): Promise<T[]> {
    const response = await this.connectorService.makeConnectorCall('dataverse', 'getRecords', {
      tableName: this.tableName,
      filters
    });

    return response.success ? (response.data as T[]) : [];
  }

  async create(entity: Omit<T, 'id' | 'createdOn' | 'modifiedOn'>): Promise<T> {
    const now = new Date().toISOString();
    const entityWithMetadata = {
      ...entity,
      id: this.generateId(),
      createdOn: now,
      modifiedOn: now
    };

    const response = await this.connectorService.makeConnectorCall('dataverse', 'createRecord', {
      tableName: this.tableName,
      data: entityWithMetadata
    });

    if (!response.success) {
      throw new Error(`Failed to create ${this.tableName}: ${response.error?.message}`);
    }

    // Log the creation
    await this.logActivity('create', entityWithMetadata.id, entity.createdBy, {
      action: 'create',
      tableName: this.tableName
    });

    return response.data as T;
  }

  async update(id: string, updates: Partial<T>): Promise<T> {
    const updateData = {
      ...updates,
      modifiedOn: new Date().toISOString()
    };

    const response = await this.connectorService.makeConnectorCall('dataverse', 'updateRecord', {
      tableName: this.tableName,
      id,
      data: updateData
    });

    if (!response.success) {
      throw new Error(`Failed to update ${this.tableName}: ${response.error?.message}`);
    }

    // Log the update
    await this.logActivity('update', id, updates.modifiedBy, {
      action: 'update',
      tableName: this.tableName,
      changes: Object.keys(updates)
    });

    return response.data as T;
  }

  async delete(id: string): Promise<boolean> {
    const response = await this.connectorService.makeConnectorCall('dataverse', 'deleteRecord', {
      tableName: this.tableName,
      id
    });

    if (response.success) {
      // Log the deletion
      await this.logActivity('delete', id, undefined, {
        action: 'delete',
        tableName: this.tableName
      });
    }

    return response.success;
  }

  async purgeOlderThan(days: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const response = await this.connectorService.makeConnectorCall('dataverse', 'deleteRecords', {
      tableName: this.tableName,
      filters: {
        createdOn: { lt: cutoffDate.toISOString() }
      }
    });

    const deletedCount = response.success ? (response.data as { count: number }).count : 0;
    
    // Log the purge activity
    await this.logActivity('delete', 'bulk', 'system', {
      action: 'purge',
      tableName: this.tableName,
      deletedCount,
      cutoffDate: cutoffDate.toISOString()
    });

    return deletedCount;
  }

  protected generateId(): string {
    return `${this.tableName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  protected async logActivity(
    action: AuditLog['action'],
    entityId: string,
    userId?: string,
    details?: Record<string, unknown>
  ): Promise<void> {
    try {
      await this.connectorService.makeConnectorCall('dataverse', 'createRecord', {
        tableName: 'auditlogs',
        data: {
          id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          entityType: this.tableName,
          entityId,
          action,
          userId: userId || 'system',
          details: JSON.stringify(details),
          createdOn: new Date().toISOString(),
          modifiedOn: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Failed to log audit activity:', error);
    }
  }
}

/**
 * Conversation repository implementation
 */
export class ConversationRepository extends BaseDataverseRepository<Conversation> implements IConversationRepository {
  protected tableName = 'conversations';

  async findByParticipant(userId: string): Promise<Conversation[]> {
    return this.findAll({
      participantIds: { contains: userId }
    });
  }

  async findByStatus(status: Conversation['status']): Promise<Conversation[]> {
    return this.findAll({ status });
  }
}

/**
 * Message repository implementation
 */
export class MessageRepository extends BaseDataverseRepository<Message> implements IMessageRepository {
  protected tableName = 'messages';

  async findByConversation(conversationId: string): Promise<Message[]> {
    return this.findAll({ 
      conversationId,
      _orderBy: 'createdOn'
    });
  }

  async findByThread(threadId: string): Promise<Message[]> {
    return this.findAll({ 
      threadId,
      _orderBy: 'createdOn'
    });
  }
}

/**
 * Attachment repository implementation
 */
export class AttachmentRepository extends BaseDataverseRepository<AttachmentLink> implements IAttachmentRepository {
  protected tableName = 'attachmentlinks';

  async findByMessage(messageId: string): Promise<AttachmentLink[]> {
    return this.findAll({ messageId });
  }
}

/**
 * Meeting repository implementation
 */
export class MeetingRepository extends BaseDataverseRepository<MeetingContext> implements IMeetingRepository {
  protected tableName = 'meetingcontexts';

  async findByConversation(conversationId: string): Promise<MeetingContext[]> {
    return this.findAll({ 
      conversationId,
      _orderBy: 'startTime'
    });
  }

  async findUpcoming(): Promise<MeetingContext[]> {
    const now = new Date().toISOString();
    return this.findAll({
      startTime: { gte: now },
      _orderBy: 'startTime'
    });
  }
}

/**
 * Export artifact repository implementation
 */
export class ExportRepository extends BaseDataverseRepository<ExportArtifact> implements IExportRepository {
  protected tableName = 'exportartifacts';

  async findByConversation(conversationId: string): Promise<ExportArtifact[]> {
    return this.findAll({ 
      conversationId,
      _orderBy: 'createdOn desc'
    });
  }

  async findByUser(userId: string): Promise<ExportArtifact[]> {
    return this.findAll({ 
      requestedBy: userId,
      _orderBy: 'createdOn desc'
    });
  }
}

/**
 * Audit log repository implementation
 */
export class AuditRepository extends BaseDataverseRepository<AuditLog> implements IAuditRepository {
  protected tableName = 'auditlogs';

  async findByEntity(entityType: string, entityId: string): Promise<AuditLog[]> {
    return this.findAll({ 
      entityType,
      entityId,
      _orderBy: 'createdOn desc'
    });
  }

  async findByUser(userId: string): Promise<AuditLog[]> {
    return this.findAll({ 
      userId,
      _orderBy: 'createdOn desc'
    });
  }

  async findByAction(action: AuditLog['action']): Promise<AuditLog[]> {
    return this.findAll({ 
      action,
      _orderBy: 'createdOn desc'
    });
  }

  async findByShortCode(shortCode: string): Promise<AuditLog[]> {
    return this.findAll({ shortCode });
  }
}

/**
 * Repository factory for getting repository instances
 */
export class DataverseRepositoryFactory {
  private static conversationRepo: ConversationRepository;
  private static messageRepo: MessageRepository;
  private static attachmentRepo: AttachmentRepository;
  private static meetingRepo: MeetingRepository;
  private static exportRepo: ExportRepository;
  private static auditRepo: AuditRepository;

  static getConversationRepository(): IConversationRepository {
    if (!this.conversationRepo) {
      this.conversationRepo = new ConversationRepository();
    }
    return this.conversationRepo;
  }

  static getMessageRepository(): IMessageRepository {
    if (!this.messageRepo) {
      this.messageRepo = new MessageRepository();
    }
    return this.messageRepo;
  }

  static getAttachmentRepository(): IAttachmentRepository {
    if (!this.attachmentRepo) {
      this.attachmentRepo = new AttachmentRepository();
    }
    return this.attachmentRepo;
  }

  static getMeetingRepository(): IMeetingRepository {
    if (!this.meetingRepo) {
      this.meetingRepo = new MeetingRepository();
    }
    return this.meetingRepo;
  }

  static getExportRepository(): IExportRepository {
    if (!this.exportRepo) {
      this.exportRepo = new ExportRepository();
    }
    return this.exportRepo;
  }

  static getAuditRepository(): IAuditRepository {
    if (!this.auditRepo) {
      this.auditRepo = new AuditRepository();
    }
    return this.auditRepo;
  }
}