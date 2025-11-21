const FormField = ({ field, value, onChange }) => {
  const { id, label, type, options, ...inputProps } = field;

  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      {type === 'select' ? (
        <select id={id} name={id} value={value} onChange={onChange} required>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input id={id} name={id} type={type} value={value} onChange={onChange} required {...inputProps} />
      )}
    </div>
  );
};

export default FormField;
