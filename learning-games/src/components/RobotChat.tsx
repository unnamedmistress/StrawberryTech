import { useState } from 'react'
import { motion } from 'framer-motion'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export default function RobotChat() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return

    const userMsg: ChatMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')

    try {
      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [...messages, userMsg],
        }),
      })
      const data = await resp.json()
      const text = data?.choices?.[0]?.message?.content?.trim() ?? ''
      if (text) {
        setMessages(prev => [...prev, { role: 'assistant', content: text }])
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Failed to get response.' }])
    }
  }

  return (
    <>
      <motion.div
        className="robot-icon"
        onClick={() => setOpen(true)}
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        {'\u{1F916}'}
      </motion.div>
      {open && (
        <div className="chat-modal-overlay" onClick={() => setOpen(false)}>
          <div className="chat-modal" onClick={e => e.stopPropagation()}>
            <h3>practice</h3>
            <div className="chat-history">
              {messages.map((m, i) => (
                <p key={i} className={m.role}>{m.content}</p>
              ))}
            </div>
            <form className="chat-input" onSubmit={sendMessage}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Say something..."
              />
              <button type="submit">Send</button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
