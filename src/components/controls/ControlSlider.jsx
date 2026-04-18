// ControlSlider.jsx — reusable slider component
export default function ControlSlider({
  label, id, value, min, max, step = 0.01, onChange, unit = '', format
}) {
  const display = format ? format(value) : (typeof value === 'number' ? value.toFixed(step >= 1 ? 0 : 2) : value);

  return (
    <div className="control-row">
      <div className="control-row__header">
        <label className="ctrl-label" htmlFor={id}>{label}</label>
        <span className="ctrl-value">{display}{unit}</span>
      </div>
      <input
        id={id}
        type="range"
        className="ctrl-slider"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
      />
    </div>
  );
}
