import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const Card: React.FC<CardProps> = ({
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
        color: '#000',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`card-content ${className}`}>{children}</div>
);

export { Card };
export default Card;
