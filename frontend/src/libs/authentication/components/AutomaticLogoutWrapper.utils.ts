export const countdown = (seconds: number, callback: (counter: number) => void) => {
  let counter = seconds
  let interval: NodeJS.Timeout | null = null

  const startInterval = () => {
    if (interval) {
      clearInterval(interval)
    }

    interval = setInterval(() => {
      callback(counter)
      counter--

      if (counter < 0) {
        clearInterval(interval!)
      }
    }, 1000)
  }

  startInterval()

  return () => {
    if (interval) {
      clearInterval(interval)
    }
  }
}
