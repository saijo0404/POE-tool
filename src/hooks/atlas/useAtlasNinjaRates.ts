import { useState, useEffect } from 'react';
import { poeApi } from '../../services/api';

export function useAtlasNinjaRates(league: string) {
  const [ninjaRates, setNinjaRates] = useState<Record<string, number>>({});
  const [isRatesLoading, setIsRatesLoading] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const fetchRates = async () => {
      try {
        setIsRatesLoading(true);
        const res = await poeApi.getNinjaPrices(league);
        if (isMounted && res && res.rates) {
          setNinjaRates(res.rates);
        }
      } catch {
        // silent fallback to default db rates
      } finally {
        if (isMounted) setIsRatesLoading(false);
      }
    };
    fetchRates();
    return () => {
      isMounted = false;
    };
  }, [league]);

  return { ninjaRates, isRatesLoading };
}
