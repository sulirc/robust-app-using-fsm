import { useEffect, useCallback, useRef } from 'react';

// https://zh-hans.reactjs.org/docs/hooks-faq.html
// https://zhuanlan.zhihu.com/p/98554943
// #useEventCallback
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
