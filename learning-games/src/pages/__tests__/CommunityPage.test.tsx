import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Post, { PostData } from '../../components/Post'
import CommunityPage from '../CommunityPage'

afterEach(() => cleanup())

describe('Post component', () => {
  it('calls onFlag when report clicked', () => {
    const data: PostData = { id: 1, title: 't', image: 'img' }
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
    const buttons = getAllByRole('button', { name: /report/i })
    fireEvent.click(buttons[0])
    await waitFor(() => {
      expect(getAllByRole('button')[0].textContent).toBe('Flagged')
    })
  })
})
