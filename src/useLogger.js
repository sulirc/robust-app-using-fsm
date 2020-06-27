import { useEffect } from 'react';

export default function useLogger(logTitle = 'Logger', dependencies = []) {
  useEffect(() => {
    console.log(
      logTitle,
      JSON.stringify(
        dependencies,
        null,
        2
      ),
      new Date()
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
}