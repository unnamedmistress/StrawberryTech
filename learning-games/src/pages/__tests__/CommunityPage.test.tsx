import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  render,
  fireEvent,
  waitFor,
  cleanup,
} from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Post, { PostData } from '../../components/Post'
import CommunityPage from '../CommunityPage'

afterEach(() => {
  cleanup()
  localStorage.clear()
})

describe('Post component', () => {
  it('calls onFlag when report clicked', () => {
    const data: PostData = {
      id: 1,
      author: 'Tester',
      content: 'hello',
      date: '2025-01-01T00:00:00Z',
    }
    const onFlag = vi.fn()
    const { getByRole } = render(<Post post={data} onFlag={onFlag} />)
    fireEvent.click(getByRole('button'))
    expect(onFlag).toHaveBeenCalledWith(1)
  })
})

describe('CommunityPage', () => {
  it('flags a post on report', async () => {
    const { getAllByRole } = render(
      <MemoryRouter>
        <CommunityPage />
      </MemoryRouter>
    )
    const reportButtons = getAllByRole('button', { name: /report/i })
    fireEvent.click(reportButtons[0])
    await waitFor(() => {
      expect(
        getAllByRole('button', { name: /flagged/i })[0].textContent
      ).toBe('Flagged')
    })
  })

  it('adds a post via the form', async () => {
    const { getByLabelText, getByRole, getAllByText } = render(
      <MemoryRouter>
        <CommunityPage />
      </MemoryRouter>
    )
    fireEvent.change(getByLabelText(/share your thoughts/i), {
      target: { value: 'New message' },
    })
    fireEvent.click(getByRole('button', { name: /post/i }))
    await waitFor(() => {
      expect(getAllByText('New message').length).toBe(1)
    })
  })
})
