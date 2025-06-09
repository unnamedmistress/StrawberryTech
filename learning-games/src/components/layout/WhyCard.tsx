import React from 'react'

export interface WhyCardProps {
  title: string
  explanation: React.ReactNode
  quote?: React.ReactNode
  tip?: React.ReactNode
  className?: string
  children?: React.ReactNode
}

export default function WhyCard({
  title,
  explanation,
  quote,
  tip,
  className,
  children,
}: WhyCardProps) {
  return (
    <aside className={className}>
      <h3>{title}</h3>
      <p>{explanation}</p>
      {quote && <blockquote className="sidebar-quote">{quote}</blockquote>}
      {tip && <p className="sidebar-tip">{tip}</p>}
      {children}
    </aside>
  )
}
