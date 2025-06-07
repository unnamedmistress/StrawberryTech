import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export default function RobotChat() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])

  // Instruction sent with every request so the bot behaves like a teacher
  const systemMsg = {
    role: 'system',
    content:
      'You are a friendly instructor for this lesson. Reply in one short sentence at a 4th grade reading level.',
  }

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
          messages: [systemMsg, ...messages, userMsg],
        }),
      })
      const data = await resp.json()
      const text = data?.choices?.[0]?.message?.content?.trim() ?? ''
      if (text) {
        setMessages(prev => [...prev, { role: 'assistant', content: text }])
      }
    } catch (err) {
      console.error(err)
      toast.error('Unable to reach the API. Check your network or .env key.')
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Failed to get response.' },
      ])
    }
  }

  return (
    <>
      <motion.div
        className="robot-icon"
        onClick={() => setOpen(true)}
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        role="button"
        aria-label="Open practice chat"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setOpen(true)
          }
        }}
      >
        {'\u{1F916}'}
      </motion.div>
      {open && (
        <div className="chat-modal-overlay" onClick={() => setOpen(false)}>
          <div className="chat-modal" onClick={e => e.stopPropagation()}>
            <button className="chat-close" onClick={() => setOpen(false)}>
              X
            </button>
            <h3>Practice</h3>
            <div className="chat-history">
              {messages.map((m, i) => (
                <p key={i} className={`chat-message ${m.role}`}>{
                  m.role === 'user' ? '🧑 ' : '🤖 '
                }{m.content}</p>
              ))}
            </div>
            <form className="chat-input" onSubmit={sendMessage}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Say something..."
                maxLength={100}
              />
              <button
                type="submit"
                className="btn-primary"
                disabled={input.length >= 100}
              >
                Send
              </button>
            </form>
            <p className="char-counter">{input.length} / 100</p>
          </div>
        </div>
      )}
    </>
  )
}
