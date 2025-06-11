import React from 'react'

export interface WhyCardProps {
  title: string
  explanation: React.ReactNode
  quote?: React.ReactNode
  tip?: React.ReactNode
  className?: string
  children?: React.ReactNode
  lesson?: React.ReactNode
  examples?: Array<{ good: string; bad: string }>
}

export default function WhyCard({
  title,
  explanation,
  quote,
  tip,
  className,
  children,
  lesson,
  examples,
}: WhyCardProps) {
  return (
    <aside className={`${className} why-card-enhanced`}>
      <h3 className="why-card-title">{title}</h3>
      <div className="why-card-content">
        <p className="why-card-explanation">{explanation}</p>
        
        {lesson && (
          <div className="why-card-lesson">
            <h4>📚 Lesson</h4>
            <div>{lesson}</div>
          </div>
        )}
        
        {examples && examples.length > 0 && (
          <div className="why-card-examples">
            <h4>💡 Examples</h4>
            {examples.map((example, index) => (
              <div key={index} className="example-pair">
                <div className="example-good">
                  <span className="example-label good">✅ Clear:</span>
                  <p>{example.good}</p>
                </div>
                <div className="example-bad">
                  <span className="example-label bad">❌ Vague:</span>
                  <p>{example.bad}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {quote && (
          <blockquote className="sidebar-quote why-card-quote">
            {quote}
          </blockquote>
        )}
        
        {tip && (
          <div className="sidebar-tip why-card-tip">
            <span className="tip-icon">💡</span>
            <span>{tip}</span>
          </div>
        )}
        
        {children}
      </div>
    </aside>
  )
}
