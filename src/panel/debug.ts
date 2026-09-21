import { env } from '../config/env';

export function debugPanel(...args: unknown[]) {
  if (env.DEBUG_PANEL) {
    console.log('[PANEL_DEBUG]', ...args);
  }
}