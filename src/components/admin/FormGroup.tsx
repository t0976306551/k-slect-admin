interface FormGroupProps {
  label: string
  children: React.ReactNode
}

export function FormGroup({ label, children }: FormGroupProps) {
  return (
    <div className="flex flex-col gap-[6px]">
      <label
        className="text-[13px] font-semibold"
        style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}
      >
        {label}
      </label>
      {children}
    </div>
  )
}
