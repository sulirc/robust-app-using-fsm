import { useEffect, useCallback, useRef } from 'react';

export default function useEventCallback(fn, dependencies = []) {
  const ref = useRef(() => {
    throw new Error('Cannot call an event handler while rendering.');
  });

  useEffect(() => {
    ref.current = fn;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fn, ...dependencies]);

  return useCallback(
    (...args) => {
      const fn = ref.current;
      return fn(...args);
    },
    [ref]
  );
}
