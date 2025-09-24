import { PowerAppConnector } from '../types/microsoft365';
import { getConnectorService } from './CodeAppConnectorService';

export interface PowerAppsConnectionConfig {
  connections: Record<string, PowerAppConnector>;
  mockMode?: boolean;
  environment?: 'production' | 'development' | 'mock';
}

declare global {
  interface Window {
    PowerAppsCodeApp?: PowerAppsConnectionConfig;
  }
}

/**
 * PowerApps Bootstrap Service
 * Initializes services only from window.PowerAppsCodeApp.connections,
 * falls back to mock mode per connector with a light banner when missing.
 */
export class PowerAppsBootstrap {
  private static instance: PowerAppsBootstrap | null = null;
  private initialized = false;
  private mockConnectors: Map<string, PowerAppConnector> = new Map();
  private availableConnectors: PowerAppConnector[] = [];
  private mockMode = false;

  private constructor() {
    this.initializeMockConnectors();
  }

  static getInstance(): PowerAppsBootstrap {
    if (!PowerAppsBootstrap.instance) {
      PowerAppsBootstrap.instance = new PowerAppsBootstrap();
    }
    return PowerAppsBootstrap.instance;
  }

  /**
   * Initialize the application with PowerApps connections
   */
  async initialize(): Promise<{ success: boolean; mockMode: boolean; connectors: string[] }> {
    if (this.initialized) {
      return { 
        success: true, 
        mockMode: this.mockMode, 
        connectors: this.availableConnectors.map(c => c.name) 
      };
    }

    try {
      // Check for PowerApps host-provided connections
      const powerAppsConfig = window.PowerAppsCodeApp;
      
      if (powerAppsConfig?.connections && Object.keys(powerAppsConfig.connections).length > 0) {
        // Production mode - use PowerApps connections
        this.availableConnectors = Object.values(powerAppsConfig.connections);
        this.mockMode = false;
        
        // Initialize connector service with PowerApps connections
        const connectorService = getConnectorService();
        for (const connector of this.availableConnectors) {
          await connectorService.initializeConnector(connector);
        }
        
        console.log('✅ PowerApps connections initialized:', this.availableConnectors.map(c => c.name));
      } else {
        // Mock mode - use fallback connectors
        this.availableConnectors = Array.from(this.mockConnectors.values());
        this.mockMode = true;
        
        // Initialize connector service with mock connectors
        const connectorService = getConnectorService();
        for (const connector of this.availableConnectors) {
          await connectorService.initializeConnector(connector);
        }
        
        console.warn('⚠️ PowerApps connections not found, using mock mode');
        this.showMockModeBanner();
      }

      this.initialized = true;
      return { 
        success: true, 
        mockMode: this.mockMode, 
        connectors: this.availableConnectors.map(c => c.name) 
      };
    } catch (error) {
      console.error('❌ Failed to initialize PowerApps bootstrap:', error);
      return { success: false, mockMode: true, connectors: [] };
    }
  }

  /**
   * Check if a specific connector is available
   */
  isConnectorAvailable(connectorName: string): boolean {
    return this.availableConnectors.some(c => c.name === connectorName);
  }

  /**
   * Get available connectors
   */
  getAvailableConnectors(): PowerAppConnector[] {
    return [...this.availableConnectors];
  }

  /**
   * Check if the app is running in mock mode
   */
  isMockMode(): boolean {
    return this.mockMode;
  }

  /**
   * Initialize mock connectors for development/testing
   */
  private initializeMockConnectors(): void {
    const mockConnectors: PowerAppConnector[] = [
      {
        id: 'mock-office365',
        name: 'office365',
        displayName: 'Office 365 (Mock)',
        description: 'Mock Office 365 connector for development',
        connectionId: 'mock-office365-connection'
      },
      {
        id: 'mock-outlook',
        name: 'outlook',
        displayName: 'Outlook (Mock)',
        description: 'Mock Outlook connector for development',
        connectionId: 'mock-outlook-connection'
      },
      {
        id: 'mock-sharepoint',
        name: 'sharepoint',
        displayName: 'SharePoint (Mock)',
        description: 'Mock SharePoint connector for development',
        connectionId: 'mock-sharepoint-connection'
      },
      {
        id: 'mock-onedrive',
        name: 'onedrive',
        displayName: 'OneDrive (Mock)',
        description: 'Mock OneDrive connector for development',
        connectionId: 'mock-onedrive-connection'
      },
      {
        id: 'mock-teams',
        name: 'teams',
        displayName: 'Microsoft Teams (Mock)',
        description: 'Mock Teams connector for development',
        connectionId: 'mock-teams-connection'
      },
      {
        id: 'mock-todo',
        name: 'todo',
        displayName: 'Microsoft To Do (Mock)',
        description: 'Mock To Do connector for development',
        connectionId: 'mock-todo-connection'
      },
      {
        id: 'mock-onenote',
        name: 'onenote',
        displayName: 'OneNote (Mock)',
        description: 'Mock OneNote connector for development',
        connectionId: 'mock-onenote-connection'
      },
      {
        id: 'mock-azureOpenAI',
        name: 'azureOpenAI',
        displayName: 'Azure OpenAI (Mock)',
        description: 'Mock Azure OpenAI connector for development',
        connectionId: 'mock-azureopenai-connection'
      },
      {
        id: 'mock-dataverse',
        name: 'dataverse',
        displayName: 'Dataverse (Mock)',
        description: 'Mock Dataverse connector for development',
        connectionId: 'mock-dataverse-connection'
      }
    ];

    mockConnectors.forEach(connector => {
      this.mockConnectors.set(connector.name, connector);
    });
  }

  /**
   * Show mock mode banner to inform users
   */
  private showMockModeBanner(): void {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      // Remove existing banner if present
      const existingBanner = document.getElementById('mock-mode-banner');
      if (existingBanner) {
        existingBanner.remove();
      }

      // Create mock mode banner
      const banner = document.createElement('div');
      banner.id = 'mock-mode-banner';
      banner.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: linear-gradient(90deg, #fef3c7, #fde68a);
        color: #92400e;
        padding: 8px 16px;
        text-align: center;
        font-size: 14px;
        font-weight: 500;
        z-index: 10000;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        border-bottom: 1px solid #d97706;
      `;
      banner.innerHTML = `
        <span>⚠️ Development Mode: Using mock connectors - No real Microsoft 365 operations will be performed</span>
        <button onclick="this.parentElement.remove()" style="
          background: none;
          border: none;
          color: #92400e;
          font-size: 16px;
          cursor: pointer;
          margin-left: 10px;
          padding: 0 5px;
        ">×</button>
      `;
      
      document.body.appendChild(banner);
    }
  }

  /**
   * Remove mock mode banner
   */
  hideMockModeBanner(): void {
    if (typeof document !== 'undefined') {
      const banner = document.getElementById('mock-mode-banner');
      if (banner) {
        banner.remove();
      }
    }
  }
}

// Singleton instance
export const powerAppsBootstrap = PowerAppsBootstrap.getInstance();