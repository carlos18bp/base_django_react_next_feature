import { describe, it, expect } from 'vitest'
import { curriculumBySlug } from '@/app/data/curriculum'

describe('curriculum data', () => {
  const slugs = Object.keys(curriculumBySlug)

  it('exports a non-empty record', () => {
    expect(slugs.length).toBeGreaterThan(0)
  })

  it('every entry has at least one module', () => {
    for (const slug of slugs) {
      const curriculum = curriculumBySlug[slug]
      expect(
        curriculum.modules.length,
        `${slug} has no modules`,
      ).toBeGreaterThan(0)
    }
  })

  it('every module has a name, hours > 0, and valid type', () => {
    for (const slug of slugs) {
      for (const mod of curriculumBySlug[slug].modules) {
        expect(mod.name.length).toBeGreaterThan(0)
        expect(mod.hours).toBeGreaterThan(0)
        expect(['basic', 'technical']).toContain(mod.type)
      }
    }
  })

  it('every entry has positive totalHours and practiceHours', () => {
    for (const slug of slugs) {
      const curriculum = curriculumBySlug[slug]
      expect(curriculum.totalHours).toBeGreaterThan(0)
      expect(curriculum.practiceHours).toBeGreaterThanOrEqual(0)
    }
  })

  it('totalHours is at least sum of module hours', () => {
    for (const slug of slugs) {
      const curriculum = curriculumBySlug[slug]
      const moduleSum = curriculum.modules.reduce((sum, m) => sum + m.hours, 0)
      expect(
        curriculum.totalHours,
        `${slug}: totalHours (${curriculum.totalHours}) < module sum (${moduleSum})`,
      ).toBeGreaterThanOrEqual(moduleSum)
    }
  })
})
