import { describe, expect, it } from 'vitest'
import { ESCALATION_REPLIES, escalationReply } from './notifications'

describe('escalationReply', () => {
  it('walks the ladder in order', () => {
    for (let i = 0; i < ESCALATION_REPLIES.length; i++) {
      expect(escalationReply(i + 1)).toEqual(ESCALATION_REPLIES[i])
    }
  })

  it('never repeats itself, however long the escalation goes on', () => {
    const seen = new Set<string>()
    for (let n = 1; n <= 60; n++) {
      const reply = escalationReply(n)
      const key = `${reply.title}|${reply.body}`
      expect(seen.has(key), `repeated at escalation ${n}: ${key}`).toBe(false)
      seen.add(key)
    }
  })

  it('hands over to the service desk once the cast gives up', () => {
    const first = escalationReply(ESCALATION_REPLIES.length + 1)
    expect(first.title).toBe('Service Desk')
    expect(first.body).toMatch(/^Escalation logged\. Ref: ESC-\d+\.$/)
  })

  it('treats a zeroth escalation as the first rung', () => {
    expect(escalationReply(0)).toEqual(ESCALATION_REPLIES[0])
  })
})
