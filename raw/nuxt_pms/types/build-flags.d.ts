/**
 * True in the admin build, false in the staff build.
 * Substituted at compile time by the Vite `define` in nuxt.config.ts, so a
 * `__PMS_ADMIN__ ? … : …` branch is folded away and its imports dropped.
 */
declare const __PMS_ADMIN__: boolean;
