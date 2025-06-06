import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { UserContext } from '../context/UserContext'
import COURSES from '../data/courses'
import Card from './ui/card'

export default function CourseOverview() {
  const { user } = useContext(UserContext)
  return (
    <div className="course-grid">
      {COURSES.map((course) => {
        const progress = Math.min(user.scores[course.id] ?? 0, 100)
        const content = (
          <Card className="course-card">
            {course.meme && (
              <img
                src={course.meme}
                alt={`${course.title} meme`}
                style={{ width: '100%', borderRadius: '4px' }}
              />
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
