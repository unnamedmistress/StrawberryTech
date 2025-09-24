import React, { useState, useRef, useEffect } from 'react';

interface FabAction {
  id: string;
  icon: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  color?: string;
}

interface MobileFabProps {
  primaryIcon?: string;
  primaryLabel?: string;
  actions?: FabAction[];
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  onPrimaryClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const MobileFab: React.FC<MobileFabProps> = ({
  primaryIcon = '+',
  primaryLabel = 'Add',
  actions = [],
  position = 'bottom-right',
  onPrimaryClick,
  disabled = false,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const fabRef = useRef<HTMLDivElement>(null);

  // Close FAB when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fabRef.current && !fabRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isExpanded]);

  const handlePrimaryClick = () => {
    if (disabled) return;

    if (actions.length > 0) {
      setIsExpanded(!isExpanded);
    } else if (onPrimaryClick) {
      onPrimaryClick();
    }
  };

  const handleActionClick = (action: FabAction) => {
    if (!action.disabled) {
      action.onClick();
      setIsExpanded(false);
    }
  };

  const getPositionClass = () => {
    switch (position) {
      case 'bottom-left':
        return 'fab-bottom-left';
      case 'bottom-center':
        return 'fab-bottom-center';
      default:
        return 'fab-bottom-right';
    }
  };

  return (
    <div
      ref={fabRef}
      className={`mobile-fab ${getPositionClass()} ${className} ${isExpanded ? 'expanded' : ''}`}
    >
      {/* Secondary actions */}
      {actions.length > 0 && (
        <div className={`fab-actions ${isExpanded ? 'visible' : ''}`}>
          {actions.map((action, index) => (
            <div key={action.id} className="fab-action-container">
              <div className="fab-action-label">{action.label}</div>
              <button
                className={`fab-action ${action.disabled ? 'disabled' : ''}`}
                onClick={() => handleActionClick(action)}
                disabled={action.disabled}
                style={{ 
                  backgroundColor: action.color || '#6c757d',
                  animationDelay: `${index * 50}ms`
                }}
                aria-label={action.label}
              >
                <span className="fab-action-icon">{action.icon}</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Primary FAB button */}
      <button
        className={`fab-primary ${disabled ? 'disabled' : ''}`}
        onClick={handlePrimaryClick}
        disabled={disabled}
        aria-label={primaryLabel}
        aria-expanded={isExpanded}
        aria-haspopup={actions.length > 0}
      >
        <span className={`fab-primary-icon ${isExpanded ? 'rotated' : ''}`}>
          {primaryIcon}
        </span>
      </button>

      <style jsx>{`
        .mobile-fab {
          position: fixed;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .fab-bottom-right {
          bottom: 1rem;
          right: 1rem;
        }

        .fab-bottom-left {
          bottom: 1rem;
          left: 1rem;
        }

        .fab-bottom-center {
          bottom: 1rem;
          left: 50%;
          transform: translateX(-50%);
        }

        .fab-actions {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
          pointer-events: none;
        }

        .fab-actions.visible {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }

        .fab-action-container {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          position: relative;
        }

        .fab-action-label {
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 0.5rem 0.75rem;
          border-radius: 4px;
          font-size: 0.875rem;
          white-space: nowrap;
          opacity: 0;
          transform: translateX(10px);
          transition: all 0.2s ease;
          pointer-events: none;
        }

        .fab-action:hover + .fab-action-label,
        .fab-action:focus + .fab-action-label {
          opacity: 1;
          transform: translateX(0);
        }

        .fab-action {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: none;
          background: #6c757d;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
          transform: scale(0);
          animation: fabActionIn 0.2s ease-out forwards;
        }

        @keyframes fabActionIn {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .fab-action:hover:not(.disabled) {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
        }

        .fab-action:active:not(.disabled) {
          transform: scale(0.95);
        }

        .fab-action.disabled {
          background: #adb5bd;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .fab-action-icon {
          display: block;
          line-height: 1;
        }

        .fab-primary {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          border: none;
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 500;
          box-shadow: 0 6px 20px rgba(0, 123, 255, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .fab-primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .fab-primary:hover:not(.disabled)::before {
          opacity: 1;
        }

        .fab-primary:hover:not(.disabled) {
          transform: scale(1.1);
          box-shadow: 0 8px 25px rgba(0, 123, 255, 0.4);
        }

        .fab-primary:active:not(.disabled) {
          transform: scale(0.95);
        }

        .fab-primary.disabled {
          background: #adb5bd;
          cursor: not-allowed;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .fab-primary-icon {
          display: block;
          line-height: 1;
          transition: transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
        }

        .fab-primary-icon.rotated {
          transform: rotate(45deg);
        }

        /* Backdrop blur effect when expanded */
        .mobile-fab.expanded::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(2px);
          z-index: -1;
          opacity: 0;
          animation: backdropFadeIn 0.3s ease forwards;
        }

        @keyframes backdropFadeIn {
          to {
            opacity: 1;
          }
        }

        /* Bottom input positioning adjustment */
        @media (max-width: 768px) {
          .mobile-fab {
            bottom: calc(1rem + env(safe-area-inset-bottom));
          }

          /* Adjust for virtual keyboard */
          @supports (bottom: env(keyboard-inset-height)) {
            .mobile-fab {
              bottom: calc(1rem + env(keyboard-inset-height) + env(safe-area-inset-bottom));
            }
          }
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .fab-action-label {
            background: rgba(255, 255, 255, 0.9);
            color: #212529;
          }
        }

        /* High contrast mode */
        @media (prefers-contrast: high) {
          .fab-primary, .fab-action {
            border: 2px solid white;
          }

          .fab-action-label {
            border: 1px solid white;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .fab-actions,
          .fab-primary,
          .fab-action,
          .fab-primary-icon,
          .fab-action-label {
            transition: none;
            animation: none;
          }

          .fab-primary:hover:not(.disabled),
          .fab-action:hover:not(.disabled) {
            transform: none;
          }
        }

        /* Hide on desktop by default */
        @media (min-width: 1024px) {
          .mobile-fab {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default MobileFab;