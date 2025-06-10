import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { UserContext } from '../shared/UserContext'
import type { UserContextType } from '../../../shared/types/user'
import COURSES from '../data/courses'
import Card from './ui/card'

export default function CourseOverview() {
  const { user } = useContext(UserContext) as UserContextType
  return (
    <div className="course-grid">
      {COURSES.map((course) => {
        const progress = Math.min(user.points[course.id] ?? 0, 100)
        const content = (
          <Card className="course-card" style={{ padding: '0.75rem' }}>
            {course.meme && (
              <img src={course.meme} alt={`${course.title} meme`} />
            )}
            <h3>{course.title}</h3>
            <p>{course.description}</p>
            <progress value={progress} max={100} style={{ width: '100%', height: '1rem' }} />
          </Card>
        )
        return course.path ? (
          <Link key={course.id} to={course.path} className="course-card-link">
            {content}
          </Link>
        ) : (
          <div key={course.id}>{content}</div>
        )
      })}
    </div>
  )
}
