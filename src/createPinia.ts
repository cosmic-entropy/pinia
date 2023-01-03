import {
  Pinia,
  PiniaStorePlugin,
  setActivePinia,
  piniaSymbol,
} from './rootStore'
import { ref, App, markRaw, effectScope } from 'vue'
import { registerPiniaDevtools, devtoolsPlugin } from './devtools'
import { IS_CLIENT } from './env'
import { StateTree, StoreGeneric } from './types'

/**
 * Creates a Pinia instance to be used by the application
 */
export function createPinia(): Pinia {
  const scope = effectScope(true)
  // NOTE: here we could check the window object for a state and directly set it
  // if there is anything like it with Vue 3 SSR
  const state = scope.run(() => ref<Record<string, StateTree>>({}))!

  let _p: Pinia['_p'] = []
  // plugins added before calling app.use(pinia)
  const toBeInstalled: PiniaStorePlugin[] = []

  const pinia: Pinia = markRaw({
    install(app: App) {
      pinia._a = app
      app.provide(piniaSymbol, pinia)

      if (app.config.hasOwnProperty('globalProperties')) {
        app.config.globalProperties.$pinia = pinia
      }
      if (IS_CLIENT) {
        // this allows calling useStore() outside of a component setup after
        // installing pinia's plugin
        setActivePinia(pinia)
        if (__DEV__) {
          registerPiniaDevtools(app, pinia)
        }
      }
      toBeInstalled.forEach((plugin) => _p.push(plugin))
    },

    use(plugin) {
      if (!this._a) {
        toBeInstalled.push(plugin)
      } else {
        _p.push(plugin)
      }
      return this
    },

    _p,
    // it's actually undefined here
    // @ts-expect-error
    _a: null,
    _e: scope,
    _s: new Map<string, StoreGeneric>(),
    state,
  })

  // pinia devtools rely on dev only features so they cannot be forced unless
  // the dev build of Vue is used
  if (__DEV__ && IS_CLIENT) {
    pinia.use(devtoolsPlugin)
  }

  return pinia
}
