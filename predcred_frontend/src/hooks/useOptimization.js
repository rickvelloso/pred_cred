import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { API_URL, COLD_START_WARNING_DELAY, TIMEOUTS } from '../constants';
import { handleApiError } from '../utils/errorHandlers';

export const useOptimization = (initialModelVersion, initialLossFN, initialProfitFP) => {
  const [optimization, setOptimization] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showColdStartWarning, setShowColdStartWarning] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const fetchOptimization = useCallback(async (version, lossFn, profitFp) => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.get(`${API_URL}/optimize`, {
        params: {
          model_version: version,
          loss_per_fn: lossFn,
          profit_per_fp: profitFp,
        },
        timeout: TIMEOUTS.OPTIMIZATION,
      });

      setOptimization(response.data);

      if (isFirstLoad) {
        setIsFirstLoad(false);
        setTimeout(() => setShowColdStartWarning(false), COLD_START_WARNING_DELAY);
      }
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, [isFirstLoad]);

  useEffect(() => {
    fetchOptimization(initialModelVersion, initialLossFN, initialProfitFP);
  }, []);

  return {
    optimization,
    loading,
    error,
    showColdStartWarning,
    setShowColdStartWarning,
    fetchOptimization,
  };
};
