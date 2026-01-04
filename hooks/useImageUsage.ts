
import { useState } from 'react';

export const useImageUsage = (isSubscribed: boolean) => {
  const [usage, setUsage] = useState(0);
  const limit = isSubscribed ? 100 : 5;

  const checkImageLimit = () => usage < limit;
  const incrementImageUsage = () => setUsage(u => u + 1);

  return { checkImageLimit, incrementImageUsage };
};
