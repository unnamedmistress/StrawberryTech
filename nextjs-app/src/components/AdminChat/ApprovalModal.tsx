/**
 * Approval Modal Component
 * Modal-driven approvals for send email, schedule meeting, and Teams post
 */

import React from 'react';
import { ApprovalRequest } from '../../services/CodeAppConnectorService';

interface ApprovalModalProps {
  approval: ApprovalRequest & {
    id: string;
    title: string;
    description: string;
  };
  onApprove: () => void;
  onDeny: () => void;
}

export function ApprovalModal({
  approval,
  onApprove,
  onDeny
}: ApprovalModalProps) {
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'HIGH': return '#dc3545';
      case 'MEDIUM': return '#fd7e14';  
      case 'LOW': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'HIGH': return '🚨';
      case 'MEDIUM': return '⚠️';
      case 'LOW': return 'ℹ️';
      default: return '❓';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'SEND_EMAIL': return '📧';
      case 'POST_TEAMS': return '💬';
      case 'CREATE_MEETING': return '📅';
      case 'CREATE_TASK': return '✅';
      case 'EXPORT_DATA': return '📋';
      default: return '🔒';
    }
  };

  return (
    <div className="approval-modal-overlay">
      <div className="approval-modal">
        <div className="modal-header">
          <div className="approval-icon">
            {getActionIcon(approval.action)}
          </div>
          <h3 className="modal-title">Approval Required</h3>
          <div 
            className="severity-badge"
            style={{ backgroundColor: getSeverityColor(approval.severity) }}
          >
            {getSeverityIcon(approval.severity)} {approval.severity}
          </div>
        </div>

        <div className="modal-content">
          <div className="approval-details">
            <h4>{approval.title}</h4>
            <p className="approval-description">{approval.description}</p>
            
            <div className="approval-metadata">
              <div className="metadata-item">
                <span className="metadata-label">Action:</span>
                <span className="metadata-value">{approval.action.replace('_', ' ')}</span>
              </div>
              <div className="metadata-item">
                <span className="metadata-label">Target:</span>
                <span className="metadata-value">{approval.target}</span>
              </div>
              <div className="metadata-item">
                <span className="metadata-label">Correlation ID:</span>
                <span className="metadata-value correlation-id">{approval.id}</span>
              </div>
            </div>

            {approval.payload && (
              <div className="payload-preview">
                <h5>Preview:</h5>
                <div className="payload-content">
                  {typeof approval.payload === 'string' ? (
                    <p>{approval.payload}</p>
                  ) : (
                    <pre>{JSON.stringify(approval.payload, null, 2)}</pre>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="modal-actions">
          <button
            onClick={onDeny}
            className="btn-secondary deny-btn"
          >
            <span className="btn-icon">❌</span>
            Deny
          </button>
          
          <button
            onClick={onApprove}
            className="btn-primary approve-btn"
          >
            <span className="btn-icon">✅</span>
            Approve
          </button>
        </div>

        <div className="modal-footer">
          <p className="approval-note">
            This action will be logged for audit purposes. 
            Approval ID: <code>{approval.id}</code>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ApprovalModal;