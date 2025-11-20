export const formatCurrency = (value) => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const formatThreshold = (value) => {
  return value.toFixed(2);
};

export const formatPercentage = (value) => {
  return `${value.toFixed(2)}%`;
};

export const formatNumber = (value) => {
  return value.toLocaleString('pt-BR');
};

export const isApprovedRecommendation = (recommendation) => {
  return recommendation?.includes('Aprovação') || recommendation?.includes('Aprovado');
};

export const getRiskLevel = (percentage) => {
  if (percentage < 30) return 'low';
  if (percentage < 60) return 'medium';
  return 'high';
};

export const getRiskLevelLabel = (percentage) => {
  if (percentage < 30) return 'Risco Baixo';
  if (percentage < 60) return 'Risco Médio';
  return 'Risco Alto';
};
