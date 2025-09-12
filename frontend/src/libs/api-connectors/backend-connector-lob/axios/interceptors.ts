import { unauthorizedInterceptor } from './unauthorizedInterceptor'

export const activateInterceptors = () => {
  unauthorizedInterceptor()
}
