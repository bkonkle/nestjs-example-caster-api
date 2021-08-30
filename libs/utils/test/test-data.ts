/**
 * TODO: Rip this out - it's too magical and non-obvious
 */
export class TestData<T extends {id: string}> {
  value?: T
  private shouldReset = true

  constructor(
    private readonly create: () => Promise<T>,
    private readonly remove: (id: string) => Promise<T | void>
  ) {
    beforeEach(async () => {
      if (this.shouldReset) {
        this.shouldReset = false
        this.value = await this.create()
      }
    })

    afterAll(async () => {
      try {
        await this.remove(this.id)
      } catch (_err) {
        // pass
      }
    })
  }

  /**
   * Get the id, or throw an error if the value isn't present for some reason.
   */
  get id() {
    if (!this.value) {
      throw new Error('TestData value not found.')
    }

    return this.value.id
  }

  /**
   * Resets the data after this test.
   */
  resetAfter() {
    this.shouldReset = true
  }

  /**
   * Delete the data and reset it after this test.
   */
  async delete() {
    this.resetAfter()
    await this.remove(this.id)
  }
}
