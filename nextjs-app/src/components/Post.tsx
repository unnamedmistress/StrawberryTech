import Card from './ui/card'

export interface PostData {
  id: number
  /** Name of the author posting the message */
  author: string
  /** Text content of the post */
  content: string
  /** ISO timestamp of when the post was created */
  date: string
  /** Whether a post has been flagged by a user */
  flagged?: boolean
}

export interface PostProps {
  post: PostData
  onFlag: (id: number) => void
}

export default function Post({ post, onFlag }: PostProps) {
  return (
    <Card className="post" style={{ marginBottom: '1rem' }}>
      <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
        {post.author} on {new Date(post.date).toLocaleString()}
      </p>
      <p style={{ whiteSpace: 'pre-wrap' }}>{post.content}</p>
      <div style={{ marginTop: '0.5rem' }}>
        <button onClick={() => onFlag(post.id)} disabled={post.flagged} className="btn-primary">
          {post.flagged ? 'Flagged' : 'Report'}
        </button>
      </div>
    </Card>
  )
}
