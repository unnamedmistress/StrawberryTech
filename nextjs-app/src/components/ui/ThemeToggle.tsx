import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'system',
  storageKey = 'strawberrytech-theme'
}) => {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const stored = localStorage.getItem(storageKey) as Theme;
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      setThemeState(stored);
    }
  }, [storageKey]);

  // Update resolved theme based on current theme and system preference
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateResolvedTheme = () => {
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        setResolvedTheme(systemTheme);
      } else {
        setResolvedTheme(theme);
      }
    };

    updateResolvedTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        updateResolvedTheme();
      }
    };

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, [theme]);

  // Apply theme to document
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    // Add current theme class
    root.classList.add(resolvedTheme);
    
    // Update color-scheme for better browser integration
    root.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', size = 'md' }) => {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const getIcon = (currentTheme: Theme, resolved: 'light' | 'dark') => {
    if (currentTheme === 'system') {
      return resolved === 'dark' ? '🌙' : '☀️';
    }
    return currentTheme === 'dark' ? '🌙' : '☀️';
  };

  const getLabel = (currentTheme: Theme) => {
    switch (currentTheme) {
      case 'light':
        return 'Light mode';
      case 'dark':
        return 'Dark mode';
      case 'system':
        return 'System theme';
      default:
        return 'Toggle theme';
    }
  };

  const cycleTheme = () => {
    switch (theme) {
      case 'light':
        setTheme('dark');
        break;
      case 'dark':
        setTheme('system');
        break;
      case 'system':
        setTheme('light');
        break;
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'theme-toggle-sm';
      case 'lg':
        return 'theme-toggle-lg';
      default:
        return 'theme-toggle-md';
    }
  };

  return (
    <button
      className={`theme-toggle ${getSizeClass()} ${className}`}
      onClick={cycleTheme}
      aria-label={getLabel(theme)}
      title={getLabel(theme)}
    >
      <span className="theme-toggle-icon">
        {getIcon(theme, resolvedTheme)}
      </span>
      <span className="theme-toggle-indicator">
        {theme === 'system' && (
          <span className="system-indicator" title="Following system preference">
            AUTO
          </span>
        )}
      </span>

      <style jsx>{`
        .theme-toggle {
          position: relative;
          background: var(--toggle-bg, #f8f9fa);
          border: 1px solid var(--toggle-border, #dee2e6);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .theme-toggle:hover {
          background: var(--toggle-bg-hover, #e9ecef);
          border-color: var(--toggle-border-hover, #adb5bd);
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .theme-toggle:active {
          transform: translateY(0);
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
        }

        .theme-toggle:focus {
          outline: 2px solid var(--focus-color, #007bff);
          outline-offset: 2px;
        }

        .theme-toggle-sm {
          width: 32px;
          height: 32px;
          padding: 0.25rem;
        }

        .theme-toggle-md {
          width: 40px;
          height: 40px;
          padding: 0.5rem;
        }

        .theme-toggle-lg {
          width: 48px;
          height: 48px;
          padding: 0.75rem;
        }

        .theme-toggle-icon {
          font-size: 1.2em;
          line-height: 1;
          transition: transform 0.3s ease;
        }

        .theme-toggle:hover .theme-toggle-icon {
          transform: rotate(20deg);
        }

        .theme-toggle-indicator {
          position: absolute;
          bottom: -2px;
          right: -2px;
          pointer-events: none;
        }

        .system-indicator {
          font-size: 6px;
          font-weight: bold;
          color: var(--indicator-color, #6c757d);
          background: var(--indicator-bg, white);
          padding: 1px 2px;
          border-radius: 2px;
          line-height: 1;
          letter-spacing: 0.5px;
        }

        /* Light theme variables */
        .theme-toggle {
          --toggle-bg: #f8f9fa;
          --toggle-border: #dee2e6;
          --toggle-bg-hover: #e9ecef;
          --toggle-border-hover: #adb5bd;
          --focus-color: #007bff;
          --indicator-color: #6c757d;
          --indicator-bg: white;
        }

        /* Dark theme variables */
        :global(.dark) .theme-toggle {
          --toggle-bg: #374151;
          --toggle-border: #4b5563;
          --toggle-bg-hover: #4b5563;
          --toggle-border-hover: #6b7280;
          --focus-color: #3b82f6;
          --indicator-color: #9ca3af;
          --indicator-bg: #1f2937;
        }

        /* High contrast mode */
        @media (prefers-contrast: high) {
          .theme-toggle {
            border-width: 2px;
          }

          .theme-toggle:focus {
            outline-width: 3px;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .theme-toggle,
          .theme-toggle-icon {
            transition: none;
          }

          .theme-toggle:hover {
            transform: none;
          }

          .theme-toggle:hover .theme-toggle-icon {
            transform: none;
          }

          .theme-toggle:active {
            transform: none;
          }
        }
      `}</style>
    </button>
  );
};

export default ThemeToggle;