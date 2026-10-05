import { ImagePlus, RefreshCw, Trash2 } from 'lucide-react'
import { type ChangeEvent, type DragEvent, useId, useRef, useState } from 'react'

import { Button } from '@/components/ui'
import { cn } from '@/utils/cn'

const MAX_SIZE_MB = 2
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']

interface BannerUploadProps {
  value: string
  onChange: (value: string) => void
  error?: string
}

export function BannerUpload({ value, onChange, error }: BannerUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const id = useId()
  const [dragging, setDragging] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const shownError = localError ?? error

  const readFile = (file: File | undefined) => {
    if (!file) return
    if (!ACCEPTED.includes(file.type)) return setLocalError('Use uma imagem JPG, PNG ou WEBP.')
    if (file.size > MAX_SIZE_MB * 1024 * 1024)
      return setLocalError(`A imagem deve ter no máximo ${MAX_SIZE_MB} MB.`)
    setLocalError(null)
    const reader = new FileReader()
    reader.onload = () => typeof reader.result === 'string' && onChange(reader.result)
    reader.readAsDataURL(file)
  }

  const onDrop = (event: DragEvent) => {
    event.preventDefault()
    setDragging(false)
    readFile(event.dataTransfer.files[0])
  }

  const input = (
    <input
      ref={inputRef}
      id={id}
      type="file"
      accept={ACCEPTED.join(',')}
      className="sr-only"
      onChange={(event: ChangeEvent<HTMLInputElement>) => {
        readFile(event.target.files?.[0])
        event.target.value = ''
      }}
      aria-describedby={shownError ? `${id}-error` : `${id}-hint`}
    />
  )

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-small text-ink font-medium">Banner</span>
      {value ? (
        <div className="border-border relative overflow-hidden rounded-xl border">
          <img
            src={value}
            alt="Pré-visualização do banner"
            className="aspect-[21/9] w-full object-cover"
          />
          <div className="absolute right-3 bottom-3 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => inputRef.current?.click()}
              leftIcon={<RefreshCw className="size-4" aria-hidden="true" />}
            >
              Trocar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onChange('')}
              aria-label="Remover banner"
            >
              <Trash2 className="text-danger size-4" aria-hidden="true" />
            </Button>
          </div>
          {input}
        </div>
      ) : (
        <label
          htmlFor={id}
          onDragOver={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            'flex aspect-[21/9] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors',
            'has-[:focus-visible]:ring-primary/20 has-[:focus-visible]:ring-4',
            dragging
              ? 'border-primary bg-primary-50'
              : 'border-border hover:border-primary-light bg-slate-50',
            shownError && 'border-danger',
          )}
        >
          {input}
          <span
            className="bg-surface text-primary shadow-card flex size-12 items-center justify-center rounded-xl"
            aria-hidden="true"
          >
            <ImagePlus className="size-6" />
          </span>
          <span className="text-small text-ink font-semibold">
            Arraste uma imagem ou <span className="text-primary">clique para enviar</span>
          </span>
          <span id={`${id}-hint`} className="text-caption text-muted">
            JPG, PNG ou WEBP · até {MAX_SIZE_MB} MB · recomendado 1600×680
          </span>
        </label>
      )}
      {shownError && (
        <p id={`${id}-error`} role="alert" className="text-small text-danger">
          {shownError}
        </p>
      )}
    </div>
  )
}
