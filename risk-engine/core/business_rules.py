from config.settings import RISK_THRESHOLDS


def get_business_recommendation(probability_high_risk: float) -> str:
    """
    Generate business recommendation based on risk probability.
    
    Args:
        probability_high_risk: Probability of high risk (0-1)
    
    Returns:
        Business recommendation string
    """
    if probability_high_risk > RISK_THRESHOLDS['high']:
        return "Recusa Automática (Risco > 75%)"
    elif probability_high_risk > RISK_THRESHOLDS['medium']:
        return "Análise Manual (Risco > 50%)"
    else:
        return "Aprovação Automática (Risco < 50%)"
