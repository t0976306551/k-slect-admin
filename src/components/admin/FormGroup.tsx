interface FormGroupProps {
  label: string
  children: React.ReactNode
  error?: string
}

export function FormGroup({ label, children, error }: FormGroupProps) {
  return (
    <div className="flex flex-col gap-[6px]">
      <label
        className="text-[13px] font-semibold"
        style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}
      >
        {label}
      </label>
      <div className={error ? 'field-error' : undefined}>
        {children}
      </div>
      {error && (
        <p
          className="text-[12px]"
          style={{ fontFamily: 'var(--font-jakarta)', color: '#D4845E', marginTop: -2 }}
        >
          {error}
        </p>
      )}
    </div>
  )
}
