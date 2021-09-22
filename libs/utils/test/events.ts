import range from 'lodash/range'

const delay = async (timeout: number) =>
  new Promise((resolve) => setTimeout(resolve, timeout))

export const retry = async <T>(
  check: () => Promise<T | undefined>,
  retries: number,
  wait = 100
) => {
  for (const _ of range(retries)) {
    await delay(wait)

    const result = await check()
    if (result) {
      return result
    }
  }
}
