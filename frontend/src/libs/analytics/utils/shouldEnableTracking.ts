export const shouldEnableTracking = (pathname: string) => {
  return !/^\/(secure|auth)/.test(pathname)
}
