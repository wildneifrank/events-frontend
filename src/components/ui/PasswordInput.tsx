import { Eye, EyeOff, Lock } from 'lucide-react'
import { useState } from 'react'

import { Input, type InputProps } from './Input'

export function PasswordInput(props: Omit<InputProps, 'type' | 'rightSlot' | 'leftIcon'>) {
  const [visible, setVisible] = useState(false)
  return (
    <Input
      {...props}
      type={visible ? 'text' : 'password'}
      leftIcon={<Lock />}
      rightSlot={
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
          aria-pressed={visible}
          className="focus-ring text-muted hover:text-ink rounded-lg p-2 transition-colors hover:bg-slate-100"
        >
          {visible ? (
            <EyeOff className="size-[18px]" aria-hidden="true" />
          ) : (
            <Eye className="size-[18px]" aria-hidden="true" />
          )}
        </button>
      }
    />
  )
}
