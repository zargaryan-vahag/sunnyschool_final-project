import { useState } from 'react';
import { useBottomScrollListener } from 'react-bottom-scroll-listener';

module.exports = (cb) => {
  const [end, setEnd] = useState(false);

  useBottomScrollListener(async () => {
    if (end) return;

    cb((value) => {
      setEnd(value);
    });
  });
}