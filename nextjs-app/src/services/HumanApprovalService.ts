import { ApprovalRequest } from '../types/microsoft365';
import { getConnectorService } from './CodeAppConnectorService';
import { DataverseRepositoryFactory } from './DataverseRepositories';

export interface ApprovalModalProps {
  request: ApprovalRequest;
  onApprove: (reason?: string) => void;
  onReject: (reason: string) => void;
  onClose: () => void;
}

export interface ApprovalResult {
  approved: boolean;
  shortCode: string;
  reason?: string;
  timestamp: string;
}

/**
 * Human Approval Service - Manages approval workflows for Microsoft 365 actions
 * Enforces human approval before sending emails, scheduling meetings, or posting to Teams
 */
export class HumanApprovalService {
  private connectorService = getConnectorService();
  private auditRepo = DataverseRepositoryFactory.getAuditRepository();
  private pendingRequests = new Map<string, ApprovalRequest>();

  /**
   * Request approval for sending an Outlook email
   */
  async requestEmailApproval(
    subject: string,
    body: string,
    recipients: string[],
    requestedBy: string
  ): Promise<ApprovalRequest> {
    const request: ApprovalRequest = {
      id: this.generateRequestId(),
      type: 'outlook_mail',
      requestedBy,
      requestedAt: new Date().toISOString(),
      status: 'pending',
      shortCode: this.generateShortCode(),
      content: {
        subject,
        body,
        recipients
      }
    };

    this.pendingRequests.set(request.id, request);
    await this.logApprovalRequest(request);
    
    return request;
  }

  /**
   * Request approval for scheduling a meeting
   */
  async requestMeetingApproval(
    subject: string,
    startTime: string,
    endTime: string,
    location: string,
    recipients: string[],
    requestedBy: string
  ): Promise<ApprovalRequest> {
    const request: ApprovalRequest = {
      id: this.generateRequestId(),
      type: 'meeting_schedule',
      requestedBy,
      requestedAt: new Date().toISOString(),
      status: 'pending',
      shortCode: this.generateShortCode(),
      content: {
        subject,
        startTime,
        endTime,
        location,
        recipients
      }
    };

    this.pendingRequests.set(request.id, request);
    await this.logApprovalRequest(request);
    
    return request;
  }

  /**
   * Request approval for posting to Teams
   */
  async requestTeamsPostApproval(
    message: string,
    channel: string,
    requestedBy: string
  ): Promise<ApprovalRequest> {
    const request: ApprovalRequest = {
      id: this.generateRequestId(),
      type: 'teams_post',
      requestedBy,
      requestedAt: new Date().toISOString(),
      status: 'pending',
      shortCode: this.generateShortCode(),
      content: {
        body: message,
        channel
      }
    };

    this.pendingRequests.set(request.id, request);
    await this.logApprovalRequest(request);
    
    return request;
  }

  /**
   * Approve a pending request
   */
  async approveRequest(requestId: string, approvedBy: string, reason?: string): Promise<ApprovalResult> {
    const request = this.pendingRequests.get(requestId);
    if (!request) {
      throw new Error(`Approval request ${requestId} not found`);
    }

    if (request.status !== 'pending') {
      throw new Error(`Request ${requestId} is already ${request.status}`);
    }

    const now = new Date().toISOString();
    request.status = 'approved';
    request.approvedBy = approvedBy;
    request.approvedAt = now;
    request.reason = reason;

    this.pendingRequests.set(requestId, request);

    const result: ApprovalResult = {
      approved: true,
      shortCode: request.shortCode,
      reason,
      timestamp: now
    };

    await this.logApprovalDecision(request, 'approved', approvedBy, reason);
    
    return result;
  }

  /**
   * Reject a pending request
   */
  async rejectRequest(requestId: string, rejectedBy: string, reason: string): Promise<ApprovalResult> {
    const request = this.pendingRequests.get(requestId);
    if (!request) {
      throw new Error(`Approval request ${requestId} not found`);
    }

    if (request.status !== 'pending') {
      throw new Error(`Request ${requestId} is already ${request.status}`);
    }

    const now = new Date().toISOString();
    request.status = 'rejected';
    request.rejectedBy = rejectedBy;
    request.rejectedAt = now;
    request.reason = reason;

    this.pendingRequests.set(requestId, request);

    const result: ApprovalResult = {
      approved: false,
      shortCode: request.shortCode,
      reason,
      timestamp: now
    };

    await this.logApprovalDecision(request, 'rejected', rejectedBy, reason);
    
    return result;
  }

  /**
   * Get a pending approval request by ID
   */
  getPendingRequest(requestId: string): ApprovalRequest | null {
    return this.pendingRequests.get(requestId) || null;
  }

  /**
   * Get a request by short code
   */
  getRequestByShortCode(shortCode: string): ApprovalRequest | null {
    for (const request of this.pendingRequests.values()) {
      if (request.shortCode === shortCode) {
        return request;
      }
    }
    return null;
  }

  /**
   * Get all pending requests for a user
   */
  getPendingRequestsForUser(userId: string): ApprovalRequest[] {
    return Array.from(this.pendingRequests.values())
      .filter(req => req.requestedBy === userId && req.status === 'pending');
  }

  /**
   * Get all pending requests
   */
  getAllPendingRequests(): ApprovalRequest[] {
    return Array.from(this.pendingRequests.values())
      .filter(req => req.status === 'pending');
  }

  /**
   * Clean up completed requests older than specified hours
   */
  cleanupCompletedRequests(olderThanHours: number = 24): void {
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - olderThanHours);

    for (const [id, request] of this.pendingRequests.entries()) {
      if (request.status !== 'pending') {
        const completedAt = request.approvedAt || request.rejectedAt;
        if (completedAt && new Date(completedAt) < cutoff) {
          this.pendingRequests.delete(id);
        }
      }
    }
  }

  /**
   * Validate approval code for executing actions
   */
  async validateApprovalCode(shortCode: string): Promise<boolean> {
    const request = this.getRequestByShortCode(shortCode);
    return request !== null && request.status === 'approved';
  }

  private generateRequestId(): string {
    return `approval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateShortCode(): string {
    // Generate a 6-character alphanumeric code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private async logApprovalRequest(request: ApprovalRequest): Promise<void> {
    try {
      await this.auditRepo.create({
        entityType: 'approval_request',
        entityId: request.id,
        action: 'create',
        userId: request.requestedBy,
        shortCode: request.shortCode,
        details: JSON.stringify({
          type: request.type,
          content: request.content,
          requestedAt: request.requestedAt
        }),
        createdBy: 'system'
      });
    } catch (error) {
      console.error('Failed to log approval request:', error);
    }
  }

  private async logApprovalDecision(
    request: ApprovalRequest,
    decision: 'approved' | 'rejected',
    decidedBy: string,
    reason?: string
  ): Promise<void> {
    try {
      await this.auditRepo.create({
        entityType: 'approval_request',
        entityId: request.id,
        action: decision === 'approved' ? 'approve' : 'reject',
        userId: decidedBy,
        shortCode: request.shortCode,
        details: JSON.stringify({
          decision,
          reason,
          originalRequest: {
            type: request.type,
            requestedBy: request.requestedBy,
            requestedAt: request.requestedAt
          }
        }),
        createdBy: 'system'
      });
    } catch (error) {
      console.error('Failed to log approval decision:', error);
    }
  }
}

// Singleton instance
let approvalServiceInstance: HumanApprovalService | null = null;

export const getApprovalService = (): HumanApprovalService => {
  if (!approvalServiceInstance) {
    approvalServiceInstance = new HumanApprovalService();
  }
  return approvalServiceInstance;
};