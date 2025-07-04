// Spaced repetition parameters
export const INITIAL_EASE = 2.5
export const MIN_EASE = 1.3
export const FIRST_INTERVAL = 1 // days after first correct answer
export const SECOND_INTERVAL = 6 // days after second correct answer

function load() {
  try {
    return JSON.parse(localStorage.getItem('schedule') || '{}')
  } catch {
    return {}
  }
}

function save(data) {
  localStorage.setItem('schedule', JSON.stringify(data))
}

export function getRecord(id) {
  const schedule = load()
  return (
    schedule[id] || {
      ease: INITIAL_EASE,
      interval: 0,
      next: 0,
      correct: 0,
      total: 0,
    }
  )
}

export function updateRecord(id, correct) {
  const schedule = load()
  const rec =
    schedule[id] ||
    {
      ease: INITIAL_EASE,
      interval: 0,
      next: 0,
      correct: 0,
      total: 0,
    }

  const quality = correct ? 5 : 2
  rec.ease += 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
  if (rec.ease < MIN_EASE) rec.ease = MIN_EASE

  if (correct) {
    rec.correct += 1
    if (rec.interval === 0) {
      rec.interval = FIRST_INTERVAL
    } else if (rec.interval === FIRST_INTERVAL) {
      rec.interval = SECOND_INTERVAL
    } else {
      rec.interval = Math.round(rec.interval * rec.ease)
    }
  } else {
    rec.interval = FIRST_INTERVAL
  }

  rec.total += 1
  rec.next = Date.now() + rec.interval * 24 * 60 * 60 * 1000
  schedule[id] = rec
  save(schedule)
}

export function buildDueQuestions(topics, bank) {
  const schedule = load()
  const now = Date.now()
  const list = []
  Object.values(bank).forEach(section => {
    Object.entries(section).forEach(([topic, qs]) => {
      if (!topics.includes(topic)) return
      qs.forEach((q, i) => {
        const id = `${topic}-${i}`
        const rec = schedule[id]
        if (!rec || rec.next <= now) {
          list.push({ ...q, id })
        }
      })
    })
  })
  return list
}

export function aggregateTopicStats() {
  const schedule = load()
  const result = {}
  Object.entries(schedule).forEach(([id, rec]) => {
    const topic = id.split('-')[0]
    if (!result[topic]) result[topic] = { correct: 0, total: 0 }
    result[topic].correct += rec.correct
    result[topic].total += rec.total
  })
  return result
}
