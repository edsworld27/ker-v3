/**
 * useDesignAwareData — stub hook
 * Wraps the input in a { data } envelope so consumers can destructure
 * `const { data: x = [] } = useDesignAwareData(source, key)`. The optional
 * second arg is a tracking key used only when design-mode logging is on
 * (currently a no-op in this stub).
 */
export function useDesignAwareData<T>(data: T, _key?: string): { data: T } {
  return { data };
}
