import { useCallback, useMemo, useState } from 'react';
import { DEFAULT_FINANCIAL_PARAMS, MODEL_VERSIONS } from '../../constants';
import { useOptimization } from '../../hooks/useOptimization';
import ErrorMessage from '../common/ErrorMessage';
import LoadingIndicator from '../common/LoadingIndicator';
import ModelSelector from '../common/ModelSelector';
import CostChart from './CostChart';
import FinancialInputs from './FinancialInputs';
import MetricsDisplay from './MetricsDisplay';
import OptimizationSummary from './OptimizationSummary';

const SimulatorView = () => {
  const [modelVersion, setModelVersion] = useState(MODEL_VERSIONS.V2);
  const [lossPerFN, setLossPerFN] = useState(DEFAULT_FINANCIAL_PARAMS.LOSS_PER_FN);
  const [profitPerFP, setProfitPerFP] = useState(DEFAULT_FINANCIAL_PARAMS.PROFIT_PER_FP);

  const {
    optimization,
    loading,
    error,
    fetchOptimization,
  } = useOptimization(modelVersion, lossPerFN, profitPerFP);

  const handleModelChange = (version) => {
    setModelVersion(version);
    fetchOptimization(version, lossPerFN, profitPerFP);
  };

  const handleFinancialChange = useCallback(() => {
    fetchOptimization(modelVersion, lossPerFN, profitPerFP);
  }, [modelVersion, lossPerFN, profitPerFP, fetchOptimization]);

  const financialMetrics = useMemo(() => {
    if (!optimization) return null;

    const totalLoss = optimization.fn_at_optimal * lossPerFN;
    const totalOpportunityCost = optimization.fp_at_optimal * profitPerFP;
    const totalErrorCost = totalLoss + totalOpportunityCost;

    return {
      totalLoss,
      totalOpportunityCost,
      totalErrorCost,
      prejuizoCount: optimization.fn_at_optimal,
      atritoCount: optimization.fp_at_optimal,
      totalSamples: optimization.all_points?.[0]?.fn_count + optimization.all_points?.[0]?.fp_count || 76605,
    };
  }, [optimization, lossPerFN, profitPerFP]);

  return (
    <>
      <ModelSelector
        modelVersion={modelVersion}
        onModelChange={handleModelChange}
        disabled={loading}
      />

      <FinancialInputs
        lossPerFN={lossPerFN}
        profitPerFP={profitPerFP}
        onLossChange={setLossPerFN}
        onProfitChange={setProfitPerFP}
        onRecalculate={handleFinancialChange}
        loading={loading}
      />

      {loading && <LoadingIndicator message="Calculando threshold ótimo com 100 simulações..." />}
      <ErrorMessage message={error} />

      {optimization && (
        <>
          <OptimizationSummary optimization={optimization} />
          <CostChart
            data={optimization.all_points}
            optimalThreshold={optimization.optimal_threshold}
            lossPerFN={lossPerFN}
            profitPerFP={profitPerFP}
          />
          <MetricsDisplay financials={financialMetrics} />
        </>
      )}
    </>
  );
};

export default SimulatorView;
