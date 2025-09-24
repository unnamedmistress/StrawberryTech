import React from 'react';
import Head from 'next/head';
import { ThemeProvider } from '../components/ui/ThemeToggle';
import { ToastProvider } from '../components/ui/ToastProvider';
import AssistantIntegrationDemo from '../components/AssistantIntegrationDemo';

const Microsoft365IntegrationPage: React.FC = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <div className="page-container">
          <Head>
            <title>Microsoft 365 Assistant Integration - StrawberryTech</title>
            <meta name="description" content="Complete Microsoft 365 integration with Power Apps connectors, Azure OpenAI, and human approval workflows" />
          </Head>

          <main className="main-content">
            <AssistantIntegrationDemo />
          </main>

          <style jsx>{`
            .page-container {
              min-height: 100vh;
              background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
              transition: all 0.3s ease;
            }

            .main-content {
              padding: 2rem 1rem;
            }

            /* Dark mode styles */
            :global(.dark) .page-container {
              background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
            }

            /* Global dark mode variables */
            :global(.dark) {
              color-scheme: dark;
            }

            :global(.light) {
              color-scheme: light;
            }

            /* Global styles for better integration */
            :global(body) {
              margin: 0;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              transition: background-color 0.3s ease, color 0.3s ease;
            }

            :global(.light) body {
              background-color: #ffffff;
              color: #333333;
            }

            :global(.dark) body {
              background-color: #1a202c;
              color: #f7fafc;
            }

            /* Scrollbar styling */
            :global(*::-webkit-scrollbar) {
              width: 8px;
              height: 8px;
            }

            :global(*::-webkit-scrollbar-track) {
              background: transparent;
            }

            :global(.light *::-webkit-scrollbar-thumb) {
              background: #cbd5e0;
              border-radius: 4px;
            }

            :global(.dark *::-webkit-scrollbar-thumb) {
              background: #4a5568;
              border-radius: 4px;
            }

            :global(*::-webkit-scrollbar-thumb:hover) {
              background: #a0aec0;
            }

            /* Focus styles for accessibility */
            :global(*:focus-visible) {
              outline: 2px solid #3182ce;
              outline-offset: 2px;
            }

            /* Selection styling */
            :global(::selection) {
              background: #bee3f8;
              color: #1a365d;
            }

            :global(.dark ::selection) {
              background: #2b6cb0;
              color: #e2e8f0;
            }

            /* Smooth animations */
            :global(*) {
              transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
            }

            /* Reduced motion support */
            @media (prefers-reduced-motion: reduce) {
              :global(*) {
                transition: none !important;
                animation: none !important;
              }
            }
          `}</style>
        </div>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default Microsoft365IntegrationPage;