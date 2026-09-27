import { type ChangeEvent, useCallback, useState } from 'react'

export type FormErrors<T> = Partial<Record<keyof T, string>>

/**
 * Tiny form-state helper: values, per-field errors shown after blur/submit,
 * and live re-validation of touched fields.
 */
export function useForm<T extends Record<string, unknown>>(
  initialValues: T,
  validate: (values: T) => FormErrors<T>,
) {
  const [values, setValues] = useState<T>(initialValues)
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})
  const [submitted, setSubmitted] = useState(false)

  const allErrors = validate(values)
  const errorFor = (field: keyof T) => (submitted || touched[field] ? allErrors[field] : undefined)

  const setField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValues((current) => ({ ...current, [field]: value }))
  }, [])

  /** Props for text-like inputs. */
  const register = (field: keyof T & string) => ({
    name: field,
    value: String(values[field] ?? ''),
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setField(field, event.target.value as T[typeof field]),
    onBlur: () => setTouched((current) => ({ ...current, [field]: true })),
    error: errorFor(field),
  })

  /** Marks the form as submitted; returns true when valid. */
  const submit = () => {
    setSubmitted(true)
    return Object.values(allErrors).every((error) => !error)
  }

  return {
    values,
    setValues,
    setField,
    register,
    errorFor,
    submit,
    isValid: Object.values(allErrors).every((error) => !error),
  }
}
