import { describe, expect, it } from 'vitest'
import { normaliseSave } from './useGameState'
import { LEVELS } from '../levels'

describe('normaliseSave', () => {
  it('starts a new player with motion on', () => {
    expect(normaliseSave({}).settings.reducedMotion).toBe(false)
  })

  it('moves an existing player off the old follow-the-system default', () => {
    const save = normaliseSave({
      levelIndex: 4,
      completed: ['pls-fix'],
      settings: { muted: false, reducedMotion: null, showObjectives: true },
    })
    expect(save.settings.reducedMotion).toBe(false)
    // Migrating motion must not disturb anything else about the save.
    expect(save.levelIndex).toBe(4)
    expect(save.completed).toEqual(['pls-fix'])
  })

  it('leaves a deliberate choice of Reduced alone', () => {
    const save = normaliseSave({
      settings: { muted: false, reducedMotion: true, showObjectives: true },
    })
    expect(save.settings.reducedMotion).toBe(true)
  })

  /*
   * The migration must run once, not on every load — otherwise choosing System
   * would be silently undone the next time the game started.
   */
  it('does not undo System once the save is current', () => {
    const migrated = normaliseSave({})
    const chosenSystem = { ...migrated, settings: { ...migrated.settings, reducedMotion: null } }
    expect(normaliseSave(chosenSystem).settings.reducedMotion).toBeNull()
  })

  it('stamps the current version so the migration is not repeated', () => {
    expect(normaliseSave({}).version).toBe(2)
    expect(normaliseSave({ version: 1, settings: undefined }).version).toBe(2)
  })

  it('still clamps a level index from a corrupted save', () => {
    expect(normaliseSave({ levelIndex: 99 }).levelIndex).toBe(LEVELS.length - 1)
    expect(normaliseSave({ levelIndex: -3 }).levelIndex).toBe(0)
  })

  it('discards non-string entries in the completed list', () => {
    const save = normaliseSave({ completed: ['pls-fix', 7, null] as unknown as string[] })
    expect(save.completed).toEqual(['pls-fix'])
  })
})
