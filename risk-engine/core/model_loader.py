import joblib
import pandas as pd
from typing import Dict, Tuple, Optional
from config.settings import MODEL_VERSIONS


class ModelLoader:
    """Handles loading and managing ML models and test data."""
    
    def __init__(self):
        self.models: Dict[str, object] = {}
        self.test_data: Dict[str, Tuple[pd.DataFrame, pd.Series]] = {}
    
    def load_all_models(self) -> None:
        """Load all model versions and their test data."""
        print("\n" + "="*60)
        print("INICIALIZANDO API - CARREGANDO MODELOS")
        print("="*60 + "\n")
        
        for version, paths in MODEL_VERSIONS.items():
            print(f"[{version.upper()}] Carregando artefatos...")
            self._load_model(version, paths['model_path'])
            self._load_test_data(version, paths['x_test_path'], paths['y_test_path'])
            print()
        
        self._print_summary()
    
    def _load_model(self, version: str, model_path: str) -> None:
        """Load a single model version."""
        try:
            model = joblib.load(model_path)
            self.models[version] = model
            print(f"  ✓ Modelo carregado: {model_path}")
        except FileNotFoundError:
            print(f"  ✗ ERRO: Modelo não encontrado: {model_path}")
            self.models[version] = None
        except Exception as e:
            print(f"  ✗ ERRO ao carregar modelo: {e}")
            self.models[version] = None
    
    def _load_test_data(self, version: str, x_path: str, y_path: str) -> None:
        """Load test data for a model version."""
        try:
            X_test = pd.read_csv(x_path)
            y_test_df = pd.read_csv(y_path)
            y_test = y_test_df.squeeze()
            self.test_data[version] = (X_test, y_test)
            print(f"  ✓ Dados de teste carregados: {len(X_test)} amostras")
        except FileNotFoundError:
            print(f"  ✗ ERRO: Dados de teste não encontrados")
            self.test_data[version] = (None, None)
        except Exception as e:
            print(f"  ✗ ERRO ao carregar dados de teste: {e}")
            self.test_data[version] = (None, None)
    
    def _print_summary(self) -> None:
        """Print loading summary."""
        print("="*60)
        models_loaded = sum(1 for m in self.models.values() if m is not None)
        print(f"✅ Modelos carregados: {models_loaded}/{len(MODEL_VERSIONS)}")
        
        if models_loaded == 0:
            print("⚠️  AVISO: Nenhum modelo carregado. Endpoints falharão.")
        elif models_loaded < len(MODEL_VERSIONS):
            print("⚠️  AVISO: Alguns modelos faltando. Funcionalidade parcial.")
        else:
            print("✅ Todos os modelos carregados com sucesso!")
        
        print("="*60 + "\n")
    
    def get_model(self, version: str) -> Optional[object]:
        """Get a model by version."""
        return self.models.get(version)
    
    def get_test_data(self, version: str) -> Tuple[Optional[pd.DataFrame], Optional[pd.Series]]:
        """Get test data by version."""
        return self.test_data.get(version, (None, None))


model_loader = ModelLoader()
