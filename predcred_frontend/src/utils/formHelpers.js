export const getDefaultFormData = () => ({
  Age: 32,
  Income: 65000.0,
  LoanAmount: 200000.0,
  CreditScore: 710,
  MonthsEmployed: 48,
  NumCreditLines: 3,
  InterestRate: 12.5,
  LoanTerm: 36,
  DTIRatio: 0.25,
  Education: "Bachelor's",
  EmploymentType: 'Full-time',
  MaritalStatus: 'Married',
  HasMortgage: 'Yes',
  HasDependents: 'No',
  LoanPurpose: 'Home',
  HasCoSigner: 'No',
  score_bureau: 720,
});

const FLOAT_FIELDS = ['DTIRatio', 'InterestRate', 'Income', 'LoanAmount'];

export const parseFieldValue = (name, value, type) => {
  if (type !== 'number') return value;
  return FLOAT_FIELDS.includes(name) ? parseFloat(value) : parseInt(value, 10);
};

export const preparePayload = (formData, modelVersion) => {
  const payload = { ...formData };
  if (modelVersion === 'v1') {
    delete payload.score_bureau;
  }
  return payload;
};
