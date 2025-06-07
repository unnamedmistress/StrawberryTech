import type { FC, ReactNode, CSSProperties } from 'react'

export interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  style?: CSSProperties;
}

const Card: FC<CardProps> = ({
  children,
  className = '',
  onClick,
  style,
}) => {
  return (
    <div
      className={`card ${className}`}
      onClick={onClick}
      style={{
        padding: '1rem',
        border: '1px solid #eee',
        borderRadius: '8px',
        background: '#fff',
        color: 'var(--color-text-dark)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export const CardContent: FC<{ children: ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`card-content ${className}`}>{children}</div>
)

export default Card;
