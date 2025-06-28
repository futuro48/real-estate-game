import { describe, it, beforeEach, expect, vi } from 'vitest'
import {
  updateRecord,
  buildDueQuestions,
  getRecord,
  FIRST_INTERVAL,
  SECOND_INTERVAL,
  INITIAL_EASE,
} from './scheduler.js'

const noopQuestion = {
  question: 'Q',
  options: { A: 'a' },
  answer: 'A',
  explanation: 'E',
  topic: 'Topic'
}

describe('scheduler', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-01T00:00:00Z'))
  })

  it('records correct answer with adaptive interval', () => {
    updateRecord('t-0', true)
    const rec = getRecord('t-0')
    expect(rec.interval).toBe(FIRST_INTERVAL)
    expect(rec.correct).toBe(1)
    expect(rec.total).toBe(1)
    expect(rec.ease).toBeCloseTo(INITIAL_EASE + 0.1, 2)
    const expectedNext =
      Date.now() + FIRST_INTERVAL * 24 * 60 * 60 * 1000
    expect(rec.next).toBe(expectedNext)

    // answer correctly again to increase interval
    vi.setSystemTime(Date.now() + 24 * 60 * 60 * 1000)
    updateRecord('t-0', true)
    const rec2 = getRecord('t-0')
    expect(rec2.interval).toBe(SECOND_INTERVAL)
    expect(rec2.correct).toBe(2)
    expect(rec2.total).toBe(2)
    const expectedNext2 =
      Date.now() + SECOND_INTERVAL * 24 * 60 * 60 * 1000
    expect(rec2.next).toBe(expectedNext2)
  })

  it('resets interval on incorrect answer', () => {
    updateRecord('t-1', false)
    const rec = getRecord('t-1')
    expect(rec.interval).toBe(FIRST_INTERVAL)
    expect(rec.correct).toBe(0)
    expect(rec.total).toBe(1)
    expect(rec.ease).toBeLessThan(INITIAL_EASE)
    const expectedNext =
      Date.now() + FIRST_INTERVAL * 24 * 60 * 60 * 1000
    expect(rec.next).toBe(expectedNext)
  })

  it('buildDueQuestions returns only due questions', () => {
    const now = Date.now()
    const future = now + 1000 * 60 * 60 * 24
    const schedule = {
      'Topic-0': { next: future },
      'Topic-1': { next: now - 1000 }
    }
    localStorage.setItem('schedule', JSON.stringify(schedule))

    const bank = {
      Section: {
        Topic: [
          { ...noopQuestion },
          { ...noopQuestion, question: 'Q2' }
        ]
      }
    }

    const due = buildDueQuestions(['Topic'], bank)
    expect(due.map(q => q.question)).toEqual(['Q2'])
    expect(due[0].id).toBe('Topic-1')
  })
})
