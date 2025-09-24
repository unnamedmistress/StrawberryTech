import React, { useState } from 'react';
import { ApprovalRequest } from '../../types/microsoft365';

interface ApprovalModalProps {
  request: ApprovalRequest;
  onApprove: (reason?: string) => void;
  onReject: (reason: string) => void;
  onClose: () => void;
  isVisible: boolean;
}

const ApprovalModal: React.FC<ApprovalModalProps> = ({
  request,
  onApprove,
  onReject,
  onClose,
  isVisible
}) => {
  const [reason, setReason] = useState('');
  const [decision, setDecision] = useState<'approve' | 'reject' | null>(null);

  if (!isVisible) return null;

  const handleSubmit = () => {
    if (decision === 'approve') {
      onApprove(reason || undefined);
    } else if (decision === 'reject') {
      onReject(reason || 'No reason provided');
    }
    setReason('');
    setDecision(null);
  };

  const getActionTitle = () => {
    switch (request.type) {
      case 'outlook_mail':
        return 'Send Email';
      case 'meeting_schedule':
        return 'Schedule Meeting';
      case 'teams_post':
        return 'Post to Teams';
      default:
        return 'Perform Action';
    }
  };

  const renderContent = () => {
    switch (request.type) {
      case 'outlook_mail':
        return (
          <div className="approval-content">
            <div className="field">
              <strong>To:</strong> {request.content.recipients?.join(', ')}
            </div>
            <div className="field">
              <strong>Subject:</strong> {request.content.subject}
            </div>
            <div className="field">
              <strong>Body:</strong>
              <div className="email-body">{request.content.body}</div>
            </div>
          </div>
        );
      case 'meeting_schedule':
        return (
          <div className="approval-content">
            <div className="field">
              <strong>Subject:</strong> {request.content.subject}
            </div>
            <div className="field">
              <strong>Start:</strong> {new Date(request.content.startTime || '').toLocaleString()}
            </div>
            <div className="field">
              <strong>End:</strong> {new Date(request.content.endTime || '').toLocaleString()}
            </div>
            <div className="field">
              <strong>Location:</strong> {request.content.location}
            </div>
            <div className="field">
              <strong>Attendees:</strong> {request.content.recipients?.join(', ')}
            </div>
          </div>
        );
      case 'teams_post':
        return (
          <div className="approval-content">
            <div className="field">
              <strong>Channel:</strong> {request.content.channel}
            </div>
            <div className="field">
              <strong>Message:</strong>
              <div className="teams-message">{request.content.body}</div>
            </div>
          </div>
        );
      default:
        return <div>No content to display</div>;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="approval-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Approval Required</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="modal-body">
          <div className="request-info">
            <div className="request-header">
              <h3>{getActionTitle()}</h3>
              <div className="request-meta">
                <span className="short-code">Code: {request.shortCode}</span>
                <span className="requested-by">By: {request.requestedBy}</span>
                <span className="requested-at">
                  At: {new Date(request.requestedAt).toLocaleString()}
                </span>
              </div>
            </div>
            
            {renderContent()}
          </div>

          <div className="decision-section">
            <div className="decision-buttons">
              <button
                className={`decision-btn approve ${decision === 'approve' ? 'selected' : ''}`}
                onClick={() => setDecision('approve')}
              >
                ✓ Approve
              </button>
              <button
                className={`decision-btn reject ${decision === 'reject' ? 'selected' : ''}`}
                onClick={() => setDecision('reject')}
              >
                ✗ Reject
              </button>
            </div>

            {decision && (
              <div className="reason-section">
                <label htmlFor="reason">
                  {decision === 'approve' ? 'Approval Note (Optional):' : 'Rejection Reason (Required):'}
                </label>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={
                    decision === 'approve' 
                      ? 'Optional note about the approval...'
                      : 'Please provide a reason for rejection...'
                  }
                  required={decision === 'reject'}
                />
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={!decision || (decision === 'reject' && !reason.trim())}
          >
            Submit {decision === 'approve' ? 'Approval' : 'Rejection'}
          </button>
        </div>

        <style jsx>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
          }

          .approval-modal {
            background: white;
            border-radius: 8px;
            max-width: 600px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem;
            border-bottom: 1px solid #e1e5e9;
          }

          .modal-header h2 {
            margin: 0;
            color: #333;
          }

          .close-button {
            background: none;
            border: none;
            font-size: 1.5rem;
            color: #666;
            cursor: pointer;
            padding: 0.25rem;
          }

          .close-button:hover {
            color: #000;
          }

          .modal-body {
            padding: 1.5rem;
          }

          .request-header h3 {
            margin: 0 0 1rem 0;
            color: #333;
          }

          .request-meta {
            display: flex;
            gap: 1rem;
            margin-bottom: 1.5rem;
            font-size: 0.9rem;
            color: #666;
          }

          .short-code {
            background: #e3f2fd;
            color: #1976d2;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-family: monospace;
            font-weight: bold;
          }

          .approval-content {
            background: #f8f9fa;
            border-radius: 6px;
            padding: 1rem;
            margin-bottom: 2rem;
          }

          .field {
            margin-bottom: 1rem;
          }

          .field:last-child {
            margin-bottom: 0;
          }

          .field strong {
            display: block;
            margin-bottom: 0.25rem;
            color: #555;
          }

          .email-body, .teams-message {
            background: white;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 0.75rem;
            max-height: 200px;
            overflow-y: auto;
            white-space: pre-wrap;
            font-family: inherit;
          }

          .decision-section {
            border-top: 1px solid #e1e5e9;
            padding-top: 1.5rem;
          }

          .decision-buttons {
            display: flex;
            gap: 1rem;
            margin-bottom: 1rem;
          }

          .decision-btn {
            flex: 1;
            padding: 0.75rem 1rem;
            border: 2px solid transparent;
            border-radius: 6px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }

          .decision-btn.approve {
            background: #e8f5e8;
            color: #2e7d32;
            border-color: #c8e6c9;
          }

          .decision-btn.approve:hover, 
          .decision-btn.approve.selected {
            background: #4caf50;
            color: white;
            border-color: #4caf50;
          }

          .decision-btn.reject {
            background: #fce4ec;
            color: #c62828;
            border-color: #f8bbd9;
          }

          .decision-btn.reject:hover,
          .decision-btn.reject.selected {
            background: #f44336;
            color: white;
            border-color: #f44336;
          }

          .reason-section {
            margin-top: 1rem;
          }

          .reason-section label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: #333;
          }

          .reason-section textarea {
            width: 100%;
            min-height: 80px;
            padding: 0.75rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-family: inherit;
            resize: vertical;
          }

          .reason-section textarea:focus {
            outline: none;
            border-color: #1976d2;
            box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
          }

          .modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 1rem;
            padding: 1.5rem;
            border-top: 1px solid #e1e5e9;
            background: #f8f9fa;
          }

          .btn-secondary, .btn-primary {
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 4px;
            font-size: 0.9rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }

          .btn-secondary {
            background: #e0e0e0;
            color: #333;
          }

          .btn-secondary:hover {
            background: #d0d0d0;
          }

          .btn-primary {
            background: #1976d2;
            color: white;
          }

          .btn-primary:hover:not(:disabled) {
            background: #1565c0;
          }

          .btn-primary:disabled {
            background: #ccc;
            cursor: not-allowed;
          }

          @media (max-width: 640px) {
            .approval-modal {
              width: 95%;
              margin: 0.5rem;
            }

            .modal-header, .modal-body, .modal-footer {
              padding: 1rem;
            }

            .request-meta {
              flex-direction: column;
              gap: 0.5rem;
            }

            .decision-buttons {
              flex-direction: column;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default ApprovalModal;