function Textarea({
  label,
  name,
  value,
  onChange,
  placeholder = "",
  rows = 6,
  disabled = false,
  error = "",
}) {
  return (
    <div>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-slate-700"
        >
          {label}
        </label>
      )}

      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={`mt-2 w-full resize-y rounded-lg border bg-white px-4 py-2 text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
          error ? "border-rose-600" : "border-slate-200"
        }`}
      />
      {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
    </div>
  );
}

export default Textarea;
