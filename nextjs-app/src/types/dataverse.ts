// Dataverse Entity Types
export interface BaseEntity {
  id: string;
  createdOn: string;
  modifiedOn: string;
  createdBy?: string;
  modifiedBy?: string;
}

export interface Conversation extends BaseEntity {
  title: string;
  status: 'active' | 'archived' | 'completed';
  participantIds: string[];
  threadId?: string;
  assistantId?: string;
  metadata?: Record<string, unknown>;
  lastMessageAt?: string;
}

export interface Message extends BaseEntity {
  conversationId: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  messageType: 'text' | 'file' | 'action';
  parentMessageId?: string;
  threadId?: string;
  runId?: string;
  citations?: string; // JSON stringified array of SharePointCitation
  metadata?: Record<string, unknown>;
  tokens?: number;
}

export interface AttachmentLink extends BaseEntity {
  messageId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  sharePointId?: string;
  downloadUrl?: string;
  thumbnailUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface MeetingContext extends BaseEntity {
  conversationId: string;
  meetingId?: string;
  subject: string;
  organizer: string;
  attendees: string; // JSON stringified array of attendee emails
  startTime: string;
  endTime: string;
  location?: string;
  joinUrl?: string;
  recordingUrl?: string;
  transcriptUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface ExportArtifact extends BaseEntity {
  conversationId: string;
  exportType: 'onenote' | 'word' | 'pdf' | 'json';
  title: string;
  content: string;
  fileUrl?: string;
  status: 'pending' | 'completed' | 'failed';
  requestedBy: string;
  completedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface AuditLog extends BaseEntity {
  entityType: string;
  entityId: string;
  action: 'create' | 'update' | 'delete' | 'view' | 'export' | 'approve' | 'reject';
  userId: string;
  details?: string; // JSON stringified details
  ipAddress?: string;
  userAgent?: string;
  shortCode?: string; // For human approval tracking
  metadata?: Record<string, unknown>;
}

// Repository interfaces
export interface IRepository<T extends BaseEntity> {
  findById(id: string): Promise<T | null>;
  findAll(filters?: Record<string, unknown>): Promise<T[]>;
  create(entity: Omit<T, 'id' | 'createdOn' | 'modifiedOn'>): Promise<T>;
  update(id: string, updates: Partial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
  purgeOlderThan(days: number): Promise<number>;
}

export interface IConversationRepository extends IRepository<Conversation> {
  findByParticipant(userId: string): Promise<Conversation[]>;
  findByStatus(status: Conversation['status']): Promise<Conversation[]>;
}

export interface IMessageRepository extends IRepository<Message> {
  findByConversation(conversationId: string): Promise<Message[]>;
  findByThread(threadId: string): Promise<Message[]>;
}

export interface IAttachmentRepository extends IRepository<AttachmentLink> {
  findByMessage(messageId: string): Promise<AttachmentLink[]>;
}

export interface IMeetingRepository extends IRepository<MeetingContext> {
  findByConversation(conversationId: string): Promise<MeetingContext[]>;
  findUpcoming(): Promise<MeetingContext[]>;
}

export interface IExportRepository extends IRepository<ExportArtifact> {
  findByConversation(conversationId: string): Promise<ExportArtifact[]>;
  findByUser(userId: string): Promise<ExportArtifact[]>;
}

export interface IAuditRepository extends IRepository<AuditLog> {
  findByEntity(entityType: string, entityId: string): Promise<AuditLog[]>;
  findByUser(userId: string): Promise<AuditLog[]>;
  findByAction(action: AuditLog['action']): Promise<AuditLog[]>;
  findByShortCode(shortCode: string): Promise<AuditLog[]>;
}