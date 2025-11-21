from pydantic import BaseModel
from typing import Literal

class ContractFeaturesBase(BaseModel):
    """Base class with features common to all model versions."""
    
    Age: int
    Income: float
    LoanAmount: float
    CreditScore: int
    MonthsEmployed: int
    NumCreditLines: int
    InterestRate: float
    LoanTerm: int
    DTIRatio: float
    Education: str
    EmploymentType: str
    MaritalStatus: str
    HasMortgage: Literal['Yes', 'No']
    HasDependents: Literal['Yes', 'No']
    LoanPurpose: str
    HasCoSigner: Literal['Yes', 'No']


class ContractFeaturesV1(ContractFeaturesBase):
    """V1 Model - Basic features without external data."""
    
    class Config:
        json_schema_extra = {
            "example": {
                "Age": 32,
                "Income": 65000.0,
                "LoanAmount": 200000.0,
                "CreditScore": 710,
                "MonthsEmployed": 48,
                "NumCreditLines": 3,
                "InterestRate": 12.5,
                "LoanTerm": 36,
                "DTIRatio": 0.25,
                "Education": "Bachelor's",
                "EmploymentType": "Full-time",
                "MaritalStatus": "Married",
                "HasMortgage": "Yes",
                "HasDependents": "No",
                "LoanPurpose": "Home",
                "HasCoSigner": "No"
            }
        }


class ContractFeaturesV2(ContractFeaturesBase):
    """V2 Model - Enriched features with credit bureau data."""
    
    score_bureau: int
    
    class Config:
        json_schema_extra = {
            "example": {
                "Age": 32,
                "Income": 65000.0,
                "LoanAmount": 200000.0,
                "CreditScore": 710,
                "MonthsEmployed": 48,
                "NumCreditLines": 3,
                "InterestRate": 12.5,
                "LoanTerm": 36,
                "DTIRatio": 0.25,
                "score_bureau": 720,
                "Education": "Bachelor's",
                "EmploymentType": "Full-time",
                "MaritalStatus": "Married",
                "HasMortgage": "Yes",
                "HasDependents": "No",
                "LoanPurpose": "Home",
                "HasCoSigner": "No"
            }
        }
