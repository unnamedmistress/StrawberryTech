import Card from './ui/card'

export interface PostData {
  id: number | string
  /** Silly avatar name generated for the author */
  author: string
  /** Text content of the post */
  content: string
  /** Category of the post */
  category?: string
  /** ISO timestamp of when the post was created */
  date: string
  /** Whether a post has been flagged by a user */
  flagged?: boolean
  /** Sentiment score from -1 to 1 */
  sentiment?: number
  /** Approval status */
  status?: 'approved' | 'pending'
  /** Number of likes */
  likes?: number
}

export interface PostProps {
  post: PostData
  onFlag: (id: number | string) => void
}

export default function Post({ post, onFlag }: PostProps) {
  return (
    <Card className="post" style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <div>
          <p style={{ fontWeight: 'bold', margin: 0, color: '#e91e63' }}>
            {post.author}
          </p>
          <p style={{ fontSize: '0.8rem', color: '#666', margin: 0 }}>
            {new Date(post.date).toLocaleDateString()} 
            {post.category && ` • ${post.category}`}
          </p>
        </div>
      </div>
      <p style={{ whiteSpace: 'pre-wrap', margin: '0.5rem 0' }}>{post.content}</p>
      <div style={{ marginTop: '0.5rem' }}>
        <button 
          onClick={() => onFlag(post.id)} 
          disabled={post.flagged} 
          className="btn-primary"
          style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
        >
          {post.flagged ? 'Flagged' : 'Report'}
        </button>
      </div>
    </Card>
  )
}
