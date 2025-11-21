export const handleApiError = (err) => {
  console.error('API Error:', err);

  if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
    return 'O servidor demorou muito para responder (cold start). Por favor, atualize a página em 30 segundos.';
  }

  if (err.response) {
    return `Erro ${err.response.status}: ${err.response.data?.detail || 'Erro desconhecido'}`;
  }

  return 'Falha ao conectar com a API. Verifique se o backend está rodando.';
};
