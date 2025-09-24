import { PowerAppConnector, M365User, SharePointCitation } from '../types/microsoft365';

export interface ConnectorResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface OutlookMailRequest {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  importance?: 'low' | 'normal' | 'high';
  attachments?: Array<{
    name: string;
    contentBytes: string;
    contentType: string;
  }>;
}

export interface MeetingRequest {
  subject: string;
  body?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees: Array<{
    emailAddress: {
      address: string;
      name?: string;
    };
    type?: 'required' | 'optional';
  }>;
  location?: {
    displayName: string;
  };
  onlineMeeting?: boolean;
}

export interface TeamsPostRequest {
  channelId: string;
  message: string;
  importance?: 'normal' | 'high' | 'urgent';
  mentions?: Array<{
    id: string;
    mentionText: string;
    mentioned: {
      user: {
        id: string;
        displayName: string;
      };
    };
  }>;
}

/**
 * CodeAppConnectorService - Handles all Microsoft 365 integrations via Power Apps connectors
 * This replaces direct MSAL/Graph API calls with host-generated connector calls
 */
export class CodeAppConnectorService {
  private connectors: Map<string, PowerAppConnector> = new Map();
  private readonly hostUrl: string;

  constructor(hostUrl: string = '') {
    this.hostUrl = hostUrl || process.env.NEXT_PUBLIC_POWERPLATFORM_HOST_URL || '';
  }

  /**
   * Initialize available connectors from the host environment
   */
  async initializeConnectors(): Promise<void> {
    try {
      const response = await this.makeConnectorCall('system', 'getAvailableConnectors', {});
      if (response.success && response.data) {
        const connectorList = response.data as PowerAppConnector[];
        connectorList.forEach(connector => {
          this.connectors.set(connector.name, connector);
        });
      }
    } catch (error) {
      console.error('Failed to initialize connectors:', error);
    }
  }

  /**
   * Get current user information via Office 365 connector
   */
  async getCurrentUser(): Promise<ConnectorResponse<M365User>> {
    return this.makeConnectorCall('office365', 'getCurrentUser', {});
  }

  /**
   * Send email via Outlook connector (requires approval)
   */
  async sendEmail(request: OutlookMailRequest, approvalCode: string): Promise<ConnectorResponse<{ messageId: string }>> {
    return this.makeConnectorCall('outlook', 'sendEmail', {
      ...request,
      approvalCode
    });
  }

  /**
   * Schedule meeting via Outlook connector (requires approval)
   */
  async scheduleMeeting(request: MeetingRequest, approvalCode: string): Promise<ConnectorResponse<{ eventId: string }>> {
    return this.makeConnectorCall('outlook', 'createEvent', {
      ...request,
      approvalCode
    });
  }

  /**
   * Post to Teams channel (requires approval)
   */
  async postToTeams(request: TeamsPostRequest, approvalCode: string): Promise<ConnectorResponse<{ messageId: string }>> {
    return this.makeConnectorCall('teams', 'postMessage', {
      ...request,
      approvalCode
    });
  }

  /**
   * Search SharePoint for documents
   */
  async searchSharePoint(query: string, siteId?: string): Promise<ConnectorResponse<SharePointCitation[]>> {
    return this.makeConnectorCall('sharepoint', 'search', {
      query,
      siteId,
      includeMetadata: true
    });
  }

  /**
   * Get SharePoint site information
   */
  async getSharePointSite(siteId: string): Promise<ConnectorResponse<{ id: string; displayName: string; webUrl: string }>> {
    return this.makeConnectorCall('sharepoint', 'getSite', { siteId });
  }

  /**
   * List SharePoint sites
   */
  async listSharePointSites(): Promise<ConnectorResponse<Array<{ id: string; displayName: string; webUrl: string }>>> {
    return this.makeConnectorCall('sharepoint', 'listSites', {});
  }

  /**
   * Get SharePoint file content
   */
  async getSharePointFileContent(siteId: string, itemId: string): Promise<ConnectorResponse<{ content: string; contentType: string }>> {
    return this.makeConnectorCall('sharepoint', 'getFileContent', {
      siteId,
      itemId
    });
  }

  /**
   * Download SharePoint file
   */
  async downloadSharePointFile(siteId: string, itemId: string): Promise<ConnectorResponse<{ downloadUrl: string; fileName: string }>> {
    return this.makeConnectorCall('sharepoint', 'downloadFile', {
      siteId,
      itemId
    });
  }

  /**
   * Upload file to SharePoint
   */
  async uploadToSharePoint(
    siteId: string,
    fileName: string,
    content: string | ArrayBuffer,
    folderPath?: string
  ): Promise<ConnectorResponse<{ id: string; webUrl: string }>> {
    return this.makeConnectorCall('sharepoint', 'uploadFile', {
      siteId,
      fileName,
      content,
      folderPath: folderPath || '/'
    });
  }

  /**
   * Create SharePoint folder
   */
  async createSharePointFolder(siteId: string, folderName: string, parentPath?: string): Promise<ConnectorResponse<{ id: string; webUrl: string }>> {
    return this.makeConnectorCall('sharepoint', 'createFolder', {
      siteId,
      folderName,
      parentPath: parentPath || '/'
    });
  }

  /**
   * Get SharePoint file metadata
   */
  async getSharePointFileMetadata(siteId: string, itemId: string): Promise<ConnectorResponse<SharePointCitation>> {
    return this.makeConnectorCall('sharepoint', 'getFileMetadata', {
      siteId,
      itemId
    });
  }

  /**
   * Update SharePoint file metadata
   */
  async updateSharePointFileMetadata(
    siteId: string,
    itemId: string,
    metadata: Record<string, unknown>
  ): Promise<ConnectorResponse<{ success: boolean }>> {
    return this.makeConnectorCall('sharepoint', 'updateFileMetadata', {
      siteId,
      itemId,
      metadata
    });
  }

  /**
   * Delete SharePoint file
   */
  async deleteSharePointFile(siteId: string, itemId: string): Promise<ConnectorResponse<{ success: boolean }>> {
    return this.makeConnectorCall('sharepoint', 'deleteFile', {
      siteId,
      itemId
    });
  }

  // OneDrive CRUD Operations

  /**
   * List OneDrive files
   */
  async listOneDriveFiles(folderId?: string, top?: number): Promise<ConnectorResponse<SharePointCitation[]>> {
    return this.makeConnectorCall('onedrive', 'listFiles', {
      folderId: folderId || 'root',
      top: top || 100
    });
  }

  /**
   * Search OneDrive
   */
  async searchOneDrive(query: string): Promise<ConnectorResponse<SharePointCitation[]>> {
    return this.makeConnectorCall('onedrive', 'search', {
      query,
      includeMetadata: true
    });
  }

  /**
   * Get OneDrive file content
   */
  async getOneDriveFileContent(fileId: string): Promise<ConnectorResponse<{ content: string; contentType: string }>> {
    return this.makeConnectorCall('onedrive', 'getFileContent', { fileId });
  }

  /**
   * Download OneDrive file
   */
  async downloadOneDriveFile(fileId: string): Promise<ConnectorResponse<{ downloadUrl: string; fileName: string }>> {
    return this.makeConnectorCall('onedrive', 'downloadFile', { fileId });
  }

  /**
   * Upload file to OneDrive
   */
  async uploadToOneDrive(
    fileName: string,
    content: string | ArrayBuffer,
    folderId?: string
  ): Promise<ConnectorResponse<{ id: string; webUrl: string }>> {
    return this.makeConnectorCall('onedrive', 'uploadFile', {
      fileName,
      content,
      folderId: folderId || 'root'
    });
  }

  /**
   * Create OneDrive folder
   */
  async createOneDriveFolder(folderName: string, parentId?: string): Promise<ConnectorResponse<{ id: string; webUrl: string }>> {
    return this.makeConnectorCall('onedrive', 'createFolder', {
      folderName,
      parentId: parentId || 'root'
    });
  }

  /**
   * Get OneDrive file metadata
   */
  async getOneDriveFileMetadata(fileId: string): Promise<ConnectorResponse<SharePointCitation>> {
    return this.makeConnectorCall('onedrive', 'getFileMetadata', { fileId });
  }

  /**
   * Update OneDrive file metadata
   */
  async updateOneDriveFileMetadata(
    fileId: string,
    metadata: Record<string, unknown>
  ): Promise<ConnectorResponse<{ success: boolean }>> {
    return this.makeConnectorCall('onedrive', 'updateFileMetadata', {
      fileId,
      metadata
    });
  }

  /**
   * Delete OneDrive file
   */
  async deleteOneDriveFile(fileId: string): Promise<ConnectorResponse<{ success: boolean }>> {
    return this.makeConnectorCall('onedrive', 'deleteFile', { fileId });
  }

  // Outlook CRUD Operations

  /**
   * List Outlook emails
   */
  async listOutlookEmails(folderId?: string, top?: number): Promise<ConnectorResponse<Array<{
    id: string;
    subject: string;
    from: { name: string; address: string };
    receivedDateTime: string;
    importance: string;
    isRead: boolean;
  }>>> {
    return this.makeConnectorCall('outlook', 'listEmails', {
      folderId: folderId || 'inbox',
      top: top || 25
    });
  }

  /**
   * Get Outlook email content
   */
  async getOutlookEmail(messageId: string): Promise<ConnectorResponse<{
    id: string;
    subject: string;
    body: { content: string; contentType: string };
    from: { name: string; address: string };
    toRecipients: Array<{ name: string; address: string }>;
    receivedDateTime: string;
  }>> {
    return this.makeConnectorCall('outlook', 'getEmail', { messageId });
  }

  /**
   * Create Outlook email draft
   */
  async createOutlookDraft(request: OutlookMailRequest): Promise<ConnectorResponse<{ messageId: string }>> {
    return this.makeConnectorCall('outlook', 'createDraft', { ...request });
  }

  /**
   * Update Outlook email draft
   */
  async updateOutlookDraft(messageId: string, updates: Partial<OutlookMailRequest>): Promise<ConnectorResponse<{ success: boolean }>> {
    return this.makeConnectorCall('outlook', 'updateDraft', {
      messageId,
      ...updates
    });
  }

  /**
   * Delete Outlook email
   */
  async deleteOutlookEmail(messageId: string): Promise<ConnectorResponse<{ success: boolean }>> {
    return this.makeConnectorCall('outlook', 'deleteEmail', { messageId });
  }

  /**
   * List Outlook calendar events
   */
  async listOutlookCalendarEvents(
    startTime?: string,
    endTime?: string,
    top?: number
  ): Promise<ConnectorResponse<Array<{
    id: string;
    subject: string;
    start: { dateTime: string; timeZone: string };
    end: { dateTime: string; timeZone: string };
    organizer: { name: string; address: string };
    attendees: Array<{ name: string; address: string; status: string }>;
  }>>> {
    return this.makeConnectorCall('outlook', 'listCalendarEvents', {
      startTime,
      endTime,
      top: top || 50
    });
  }

  /**
   * Get Outlook calendar event
   */
  async getOutlookCalendarEvent(eventId: string): Promise<ConnectorResponse<{
    id: string;
    subject: string;
    body: { content: string; contentType: string };
    start: { dateTime: string; timeZone: string };
    end: { dateTime: string; timeZone: string };
    location: { displayName: string };
    attendees: Array<{ name: string; address: string; status: string }>;
  }>> {
    return this.makeConnectorCall('outlook', 'getCalendarEvent', { eventId });
  }

  /**
   * Create Outlook calendar event
   */
  async createOutlookCalendarEvent(request: MeetingRequest, approvalCode: string): Promise<ConnectorResponse<{ eventId: string }>> {
    return this.makeConnectorCall('outlook', 'createCalendarEvent', {
      ...request,
      approvalCode
    });
  }

  /**
   * Update Outlook calendar event
   */
  async updateOutlookCalendarEvent(
    eventId: string,
    updates: Partial<MeetingRequest>,
    approvalCode: string
  ): Promise<ConnectorResponse<{ success: boolean }>> {
    return this.makeConnectorCall('outlook', 'updateCalendarEvent', {
      eventId,
      ...updates,
      approvalCode
    });
  }

  /**
   * Delete Outlook calendar event
   */
  async deleteOutlookCalendarEvent(eventId: string, approvalCode: string): Promise<ConnectorResponse<{ success: boolean }>> {
    return this.makeConnectorCall('outlook', 'deleteCalendarEvent', {
      eventId,
      approvalCode
    });
  }

  // Teams CRUD Operations

  /**
   * List Teams
   */
  async listTeams(): Promise<ConnectorResponse<Array<{
    id: string;
    displayName: string;
    description?: string;
  }>>> {
    return this.makeConnectorCall('teams', 'listTeams', {});
  }

  /**
   * List Teams channels
   */
  async listTeamsChannels(teamId: string): Promise<ConnectorResponse<Array<{
    id: string;
    displayName: string;
    description?: string;
    membershipType: string;
  }>>> {
    return this.makeConnectorCall('teams', 'listChannels', { teamId });
  }

  /**
   * Post message to Teams channel
   */
  async postToTeamsChannel(request: TeamsPostRequest, approvalCode: string): Promise<ConnectorResponse<{ messageId: string }>> {
    return this.makeConnectorCall('teams', 'postMessage', {
      ...request,
      approvalCode
    });
  }

  /**
   * Reply to Teams message
   */
  async replyToTeamsMessage(
    teamId: string,
    channelId: string,
    messageId: string,
    reply: string,
    approvalCode: string
  ): Promise<ConnectorResponse<{ replyId: string }>> {
    return this.makeConnectorCall('teams', 'replyToMessage', {
      teamId,
      channelId,
      messageId,
      reply,
      approvalCode
    });
  }

  /**
   * Get Teams channel messages
   */
  async getTeamsChannelMessages(
    teamId: string,
    channelId: string,
    top?: number
  ): Promise<ConnectorResponse<Array<{
    id: string;
    body: { content: string; contentType: string };
    from: { user: { displayName: string; id: string } };
    createdDateTime: string;
  }>>> {
    return this.makeConnectorCall('teams', 'getChannelMessages', {
      teamId,
      channelId,
      top: top || 50
    });
  }

  // Microsoft To Do CRUD Operations

  /**
   * List To Do task lists
   */
  async listToDoTaskLists(): Promise<ConnectorResponse<Array<{
    id: string;
    displayName: string;
    isOwner: boolean;
    isShared: boolean;
  }>>> {
    return this.makeConnectorCall('todo', 'listTaskLists', {});
  }

  /**
   * List tasks in To Do list
   */
  async listToDoTasks(listId: string, completed?: boolean): Promise<ConnectorResponse<Array<{
    id: string;
    title: string;
    status: string;
    body?: { content: string; contentType: string };
    dueDateTime?: { dateTime: string; timeZone: string };
    completedDateTime?: { dateTime: string; timeZone: string };
    importance: string;
  }>>> {
    return this.makeConnectorCall('todo', 'listTasks', {
      listId,
      completed
    });
  }

  /**
   * Create To Do task
   */
  async createToDoTask(
    listId: string,
    title: string,
    body?: string,
    dueDateTime?: string,
    importance?: 'low' | 'normal' | 'high'
  ): Promise<ConnectorResponse<{ taskId: string }>> {
    return this.makeConnectorCall('todo', 'createTask', {
      listId,
      title,
      body,
      dueDateTime,
      importance: importance || 'normal'
    });
  }

  /**
   * Update To Do task
   */
  async updateToDoTask(
    listId: string,
    taskId: string,
    updates: {
      title?: string;
      body?: string;
      status?: 'notStarted' | 'inProgress' | 'completed';
      dueDateTime?: string;
      importance?: 'low' | 'normal' | 'high';
    }
  ): Promise<ConnectorResponse<{ success: boolean }>> {
    return this.makeConnectorCall('todo', 'updateTask', {
      listId,
      taskId,
      ...updates
    });
  }

  /**
   * Complete To Do task
   */
  async completeToDoTask(listId: string, taskId: string): Promise<ConnectorResponse<{ success: boolean }>> {
    return this.makeConnectorCall('todo', 'completeTask', {
      listId,
      taskId
    });
  }

  /**
   * Delete To Do task
   */
  async deleteToDoTask(listId: string, taskId: string): Promise<ConnectorResponse<{ success: boolean }>> {
    return this.makeConnectorCall('todo', 'deleteTask', {
      listId,
      taskId
    });
  }

  /**
   * Get file from SharePoint
   */
  async getSharePointFile(fileId: string): Promise<ConnectorResponse<{ content: string; metadata: SharePointCitation }>> {
    return this.makeConnectorCall('sharepoint', 'getFile', {
      fileId,
      includeContent: true
    });
  }

  /**
   * Search using Microsoft Search API
   */
  async searchMicrosoft(query: string, entityTypes?: string[]): Promise<ConnectorResponse<unknown[]>> {
    return this.makeConnectorCall('microsoftSearch', 'search', {
      query,
      entityTypes: entityTypes || ['driveItem', 'message', 'event', 'person']
    });
  }

  /**
   * Get user's calendar events
   */
  async getCalendarEvents(startTime: string, endTime: string): Promise<ConnectorResponse<unknown[]>> {
    return this.makeConnectorCall('outlook', 'getCalendarEvents', {
      startTime,
      endTime
    });
  }

  /**
   * Create OneNote page
   */
  async createOneNotePage(
    notebookId: string,
    sectionId: string,
    title: string,
    content: string
  ): Promise<ConnectorResponse<{ pageId: string; webUrl: string }>> {
    return this.makeConnectorCall('onenote', 'createPage', {
      notebookId,
      sectionId,
      title,
      content
    });
  }

  /**
   * Create Word document
   */
  async createWordDocument(
    fileName: string,
    content: string,
    siteId?: string,
    folderPath?: string
  ): Promise<ConnectorResponse<{ fileId: string; webUrl: string }>> {
    return this.makeConnectorCall('word', 'createDocument', {
      fileName,
      content,
      siteId,
      folderPath
    });
  }

  /**
   * Check connector health
   */
  async checkConnectorHealth(): Promise<ConnectorResponse<{ connectors: Array<{ name: string; status: string; lastChecked: string }> }>> {
    return this.makeConnectorCall('system', 'healthCheck', {});
  }

  /**
   * Generic method to make connector calls via the Power Platform host
   */
  async makeConnectorCall<T = unknown>(
    connectorName: string,
    action: string,
    parameters: Record<string, unknown>
  ): Promise<ConnectorResponse<T>> {
    try {
      const connector = this.connectors.get(connectorName);
      if (!connector && connectorName !== 'system') {
        return {
          success: false,
          error: {
            code: 'CONNECTOR_NOT_FOUND',
            message: `Connector ${connectorName} not found or not initialized`
          }
        };
      }

      const requestBody = {
        connectorId: connector?.id || connectorName,
        action,
        parameters,
        timestamp: new Date().toISOString()
      };

      const response = await fetch(`${this.hostUrl}/api/connectors/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result as ConnectorResponse<T>;
    } catch (error) {
      console.error(`Connector call failed (${connectorName}.${action}):`, error);
      return {
        success: false,
        error: {
          code: 'CONNECTOR_CALL_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
          details: error
        }
      };
    }
  }

  /**
   * Initialize a single connector
   */
  async initializeConnector(connector: PowerAppConnector): Promise<void> {
    this.connectors.set(connector.name, connector);
  }

  /**
   * Get available connectors
   */
  getAvailableConnectors(): PowerAppConnector[] {
    return Array.from(this.connectors.values());
  }

  /**
   * Check if a specific connector is available
   */
  isConnectorAvailable(connectorName: string): boolean {
    return this.connectors.has(connectorName);
  }
}

// Singleton instance
let connectorServiceInstance: CodeAppConnectorService | null = null;

export const getConnectorService = (): CodeAppConnectorService => {
  if (!connectorServiceInstance) {
    connectorServiceInstance = new CodeAppConnectorService();
  }
  return connectorServiceInstance;
};