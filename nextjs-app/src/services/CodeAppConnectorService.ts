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
   * Upload file to SharePoint
   */
  async uploadToSharePoint(
    fileName: string,
    content: string | ArrayBuffer,
    siteId: string,
    folderPath?: string
  ): Promise<ConnectorResponse<{ fileId: string; webUrl: string }>> {
    return this.makeConnectorCall('sharepoint', 'uploadFile', {
      fileName,
      content: typeof content === 'string' ? content : Array.from(new Uint8Array(content)),
      siteId,
      folderPath
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