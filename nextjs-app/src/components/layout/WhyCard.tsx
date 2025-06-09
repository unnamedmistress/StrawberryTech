import React from 'react'

export interface WhyCardProps {
  heading: string
  text: string
  quote?: string
  tip?: string
  className?: string
  children?: React.ReactNode
}

export default function WhyCard({ heading, text, quote, tip, className, children }: WhyCardProps) {
  return (
    <aside className={`${className ?? ''} why-card`.trim()}>
      <h3>{heading}</h3>
      <p>{text}</p>
      {quote && <blockquote className="sidebar-quote">{quote}</blockquote>}
      {tip && <p className="sidebar-tip">{tip}</p>}
      {children}
    </aside>
  )
}
