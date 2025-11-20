import axios from 'axios';
import { useState } from 'react';
import { API_URL, MODEL_VERSIONS, TIMEOUTS } from '../constants';
import { handleApiError } from '../utils/errorHandlers';
import { getDefaultFormData, parseFieldValue, preparePayload } from '../utils/formHelpers';

export const useScoring = () => {
  const [modelVersion, setModelVersion] = useState(MODEL_VERSIONS.V2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState(getDefaultFormData());

  const handleFieldChange = (e) => {
    const { name, value, type } = e.target;
    const processedValue = parseFieldValue(name, value, type);

    setFormData(prev => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  const handleModelChange = (version) => {
    setModelVersion(version);
    setResult(null);
  };

  const submitScore = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError('');

    try {
      const endpoint = modelVersion === MODEL_VERSIONS.V1 ? '/score/v1' : '/score/v2';
      const payload = preparePayload(formData, modelVersion);

      const response = await axios.post(`${API_URL}${endpoint}`, payload, {
        timeout: TIMEOUTS.SCORING,
      });

      setResult(response.data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return {
    modelVersion,
    loading,
    error,
    result,
    formData,
    handleFieldChange,
    handleModelChange,
    submitScore,
  };
};
