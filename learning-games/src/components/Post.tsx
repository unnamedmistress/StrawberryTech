import Card from './ui/card'

export interface PostData {
  id: number
  title: string
  image: string
  flagged?: boolean
}

export interface PostProps {
  post: PostData
  onFlag: (id: number) => void
}

export default function Post({ post, onFlag }: PostProps) {
  return (
    <Card className="post" style={{ marginBottom: '1rem' }}>
      <h4>{post.title}</h4>
      <img src={post.image} alt={post.title} style={{ width: '100%', borderRadius: '4px' }} />
      <div style={{ marginTop: '0.5rem' }}>
        <button onClick={() => onFlag(post.id)} disabled={post.flagged}>
          {post.flagged ? 'Flagged' : 'Report'}
        </button>
      </div>
    </Card>
  )
}
