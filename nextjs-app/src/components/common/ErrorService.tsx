/**
 * Error Service Component
 * Unified error handling with short codes and auto dismiss timers
 */

import React, { useState, useEffect } from 'react';

interface ErrorMessage {
  id: string;
  message: string;
  code: string;
  type: 'error' | 'warning' | 'info';
  timestamp: Date;
  autoDismiss: boolean;
  dismissAfter?: number; // milliseconds
}

class ErrorServiceClass {
  private listeners: Set<(errors: ErrorMessage[]) => void> = new Set();
  private errors: ErrorMessage[] = [];
  private nextId = 1;

  subscribe(callback: (errors: ErrorMessage[]) => void) {
    this.listeners.add(callback);
    callback(this.errors); // Send current errors
    
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(callback => callback([...this.errors]));
  }

  showError(message: string, code: string = 'UNKNOWN_ERROR', autoDismiss: boolean = true) {
    this.addError(message, code, 'error', autoDismiss);
  }

  showWarning(message: string, code: string = 'WARNING', autoDismiss: boolean = true) {
    this.addError(message, code, 'warning', autoDismiss);
  }

  showInfo(message: string, code: string = 'INFO', autoDismiss: boolean = true) {
    this.addError(message, code, 'info', autoDismiss);
  }

  private addError(message: string, code: string, type: ErrorMessage['type'], autoDismiss: boolean) {
    const error: ErrorMessage = {
      id: `error-${this.nextId++}`,
      message,
      code,
      type,
      timestamp: new Date(),
      autoDismiss,
      dismissAfter: autoDismiss ? this.getDismissTimeout(type) : undefined
    };

    this.errors.push(error);
    this.notifyListeners();

    // Auto-dismiss if configured
    if (autoDismiss && error.dismissAfter) {
      setTimeout(() => {
        this.dismissError(error.id);
      }, error.dismissAfter);
    }
  }

  private getDismissTimeout(type: ErrorMessage['type']): number {
    switch (type) {
      case 'error': return 10000; // 10 seconds
      case 'warning': return 7000; // 7 seconds
      case 'info': return 5000; // 5 seconds
      default: return 7000;
    }
  }

  dismissError(id: string) {
    this.errors = this.errors.filter(error => error.id !== id);
    this.notifyListeners();
  }

  clearAll() {
    this.errors = [];
    this.notifyListeners();
  }
}

// Create singleton instance
const ErrorServiceInstance = new ErrorServiceClass();

// Export service for use in other components
export { ErrorServiceInstance as ErrorServiceClass };

// Error display component
export function ErrorService() {
  const [errors, setErrors] = useState<ErrorMessage[]>([]);

  useEffect(() => {
    const unsubscribe = ErrorServiceInstance.subscribe(setErrors);
    return unsubscribe;
  }, []);

  if (errors.length === 0) {
    return null;
  }

  const getErrorIcon = (type: ErrorMessage['type']) => {
    switch (type) {
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '❓';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="error-service-container">
      {errors.map((error) => (
        <div
          key={error.id}
          className={`error-message ${error.type}`}
        >
          <div className="error-content">
            <div className="error-header">
              <span className="error-icon">{getErrorIcon(error.type)}</span>
              <span className="error-code">[{error.code}]</span>
              <span className="error-timestamp">{formatTimestamp(error.timestamp)}</span>
            </div>
            
            <div className="error-text">
              {error.message}
            </div>

            {error.autoDismiss && error.dismissAfter && (
              <div className="error-progress">
                <div 
                  className="progress-bar"
                  style={{
                    animationDuration: `${error.dismissAfter}ms`
                  }}
                />
              </div>
            )}
          </div>

          <button
            onClick={() => ErrorServiceInstance.dismissError(error.id)}
            className="error-dismiss"
            title="Dismiss"
          >
            ×
          </button>
        </div>
      ))}

      {errors.length > 1 && (
        <div className="error-controls">
          <button
            onClick={() => ErrorServiceInstance.clearAll()}
            className="clear-all-btn"
          >
            Clear All ({errors.length})
          </button>
        </div>
      )}
    </div>
  );
}

// Common error codes for the application
export const ERROR_CODES = {
  // Connection errors
  CONNECTION_FAILED: 'CONN_001',
  TIMEOUT: 'CONN_002',
  UNAUTHORIZED: 'CONN_003',
  
  // Connector errors
  CONNECTOR_UNAVAILABLE: 'CONN_101',
  CONNECTOR_ERROR: 'CONN_102',
  APPROVAL_DENIED: 'CONN_103',
  
  // Dataverse errors
  DATAVERSE_WRITE_FAILED: 'DV_001',
  DATAVERSE_READ_FAILED: 'DV_002',
  SCHEMA_VALIDATION_FAILED: 'DV_003',
  
  // Assistant errors
  ASSISTANT_UNAVAILABLE: 'ASST_001',
  ASSISTANT_TIMEOUT: 'ASST_002',
  THREAD_CREATION_FAILED: 'ASST_003',
  
  // UI errors
  INVALID_INPUT: 'UI_001',
  FILE_UPLOAD_FAILED: 'UI_002',
  EXPORT_FAILED: 'UI_003',
  
  // General errors
  UNKNOWN_ERROR: 'GEN_001',
  FEATURE_UNAVAILABLE: 'GEN_002',
  RATE_LIMIT_EXCEEDED: 'GEN_003'
} as const;

// Convenience functions for common error scenarios
export const showConnectorError = (operation: string, details?: string) => {
  ErrorServiceInstance.showError(
    `Failed to execute ${operation}${details ? `: ${details}` : ''}`,
    ERROR_CODES.CONNECTOR_ERROR
  );
};

export const showDataverseError = (operation: string, entityType?: string) => {
  ErrorServiceInstance.showError(
    `Failed to ${operation}${entityType ? ` ${entityType}` : ''} in Dataverse`,
    operation.includes('read') ? ERROR_CODES.DATAVERSE_READ_FAILED : ERROR_CODES.DATAVERSE_WRITE_FAILED
  );
};

export const showAssistantError = (details?: string) => {
  ErrorServiceInstance.showError(
    `Assistant service error${details ? `: ${details}` : ''}`,
    ERROR_CODES.ASSISTANT_UNAVAILABLE
  );
};

export default ErrorService;