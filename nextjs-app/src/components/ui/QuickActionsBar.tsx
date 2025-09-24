import React from 'react';
import { QuickAction } from '../../types/microsoft365';

interface QuickActionsBarProps {
  actions: QuickAction[];
  className?: string;
}

const QuickActionsBar: React.FC<QuickActionsBarProps> = ({ actions, className = '' }) => {
  return (
    <div className={`quick-actions-bar ${className}`}>
      {actions.map((action) => (
        <button
          key={action.id}
          className={`quick-action ${action.disabled ? 'disabled' : ''}`}
          onClick={action.action}
          disabled={action.disabled}
          title={action.label}
        >
          <span className="action-icon">{action.icon}</span>
          <span className="action-label">{action.label}</span>
        </button>
      ))}

      <style jsx>{`
        .quick-actions-bar {
          display: flex;
          gap: 0.5rem;
          padding: 0.75rem;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          overflow-x: auto;
          scrollbar-width: thin;
          scrollbar-color: #ccc transparent;
        }

        .quick-actions-bar::-webkit-scrollbar {
          height: 4px;
        }

        .quick-actions-bar::-webkit-scrollbar-track {
          background: transparent;
        }

        .quick-actions-bar::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 2px;
        }

        .quick-action {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: white;
          border: 1px solid #dee2e6;
          border-radius: 6px;
          color: #495057;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          min-width: fit-content;
        }

        .quick-action:hover:not(.disabled) {
          background: #f8f9fa;
          border-color: #007bff;
          color: #007bff;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 123, 255, 0.2);
        }

        .quick-action:active:not(.disabled) {
          transform: translateY(0);
          box-shadow: 0 1px 4px rgba(0, 123, 255, 0.2);
        }

        .quick-action.disabled {
          background: #f8f9fa;
          color: #6c757d;
          border-color: #e9ecef;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .action-icon {
          font-size: 1rem;
          line-height: 1;
        }

        .action-label {
          font-size: 0.85rem;
          line-height: 1.2;
        }

        /* Mobile-friendly layout */
        @media (max-width: 768px) {
          .quick-actions-bar {
            padding: 0.5rem;
            gap: 0.25rem;
          }

          .quick-action {
            padding: 0.4rem 0.8rem;
            font-size: 0.8rem;
          }

          .action-icon {
            font-size: 0.9rem;
          }

          .action-label {
            font-size: 0.75rem;
          }

          /* Stack actions on very small screens */
          @media (max-width: 480px) {
            .quick-actions-bar {
              flex-wrap: wrap;
            }

            .quick-action {
              flex: 1;
              min-width: calc(50% - 0.125rem);
              justify-content: center;
            }
          }
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .quick-actions-bar {
            background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
          }

          .quick-action {
            background: #4a5568;
            border-color: #718096;
            color: #e2e8f0;
          }

          .quick-action:hover:not(.disabled) {
            background: #5a6578;
            border-color: #63b3ed;
            color: #63b3ed;
            box-shadow: 0 2px 8px rgba(99, 179, 237, 0.2);
          }

          .quick-action.disabled {
            background: #2d3748;
            color: #a0aec0;
            border-color: #4a5568;
          }
        }

        /* High contrast mode */
        @media (prefers-contrast: high) {
          .quick-action {
            border-width: 2px;
          }

          .quick-action:hover:not(.disabled) {
            border-width: 2px;
            box-shadow: none;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .quick-action {
            transition: none;
          }

          .quick-action:hover:not(.disabled) {
            transform: none;
          }

          .quick-action:active:not(.disabled) {
            transform: none;
          }
        }
      `}</style>
    </div>
  );
};

export default QuickActionsBar;