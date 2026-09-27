import { Mail, Sparkles } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import { Alert, Button, Checkbox, Input, PasswordInput, useToast } from '@/components/ui'
import { env } from '@/config/env'
import { DEMO_CREDENTIALS } from '@/constants/demo'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/features/authentication/useAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useForm } from '@/hooks/useForm'
import { toErrorMessage } from '@/utils/errors'
import { isValidEmail } from '@/utils/validation'

interface LoginValues extends Record<string, unknown> {
  email: string
  password: string
}

const validate = (values: LoginValues) => ({
  email: !values.email
    ? 'Informe seu e-mail.'
    : !isValidEmail(values.email)
      ? 'E-mail inválido.'
      : undefined,
  password: !values.password ? 'Informe sua senha.' : undefined,
})

function safeRedirect(target: string | null): string | null {
  return target && target.startsWith('/') && !target.startsWith('//') ? target : null
}

export default function LoginPage() {
  useDocumentTitle('Entrar')
  const { login } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [params] = useSearchParams()
  const redirect = safeRedirect(params.get('redirect'))

  const form = useForm<LoginValues>({ email: '', password: '' }, validate)
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    if (!form.submit()) return
    setLoading(true)
    try {
      const user = await login({
        email: form.values.email,
        password: form.values.password,
        remember,
      })
      toast.success(`Bem-vindo(a), ${user.name.split(' ')[0]}!`)
      navigate(redirect ?? (user.role === 'admin' ? ROUTES.admin : ROUTES.home), { replace: true })
    } catch (err) {
      setError(toErrorMessage(err))
      setLoading(false)
    }
  }

  const fillDemo = (kind: keyof typeof DEMO_CREDENTIALS) =>
    form.setValues({ ...DEMO_CREDENTIALS[kind] })

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-h1 text-ink">Bem-vindo de volta</h1>
        <p className="text-body text-muted">
          Entre para acessar seus ingressos e finalizar compras.
        </p>
      </div>

      {redirect?.startsWith('/checkout') && (
        <Alert tone="info">Faça login para concluir a compra dos seus ingressos.</Alert>
      )}
      {error && (
        <Alert tone="danger" title="Não foi possível entrar">
          {error}
        </Alert>
      )}

      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Input
          label="E-mail"
          type="email"
          autoComplete="email"
          placeholder="voce@email.com"
          leftIcon={<Mail />}
          required
          {...form.register('email')}
        />
        <div className="flex flex-col gap-2">
          <PasswordInput
            label="Senha"
            autoComplete="current-password"
            placeholder="••••••••"
            required
            {...form.register('password')}
          />
        </div>
        <div className="flex items-center justify-between gap-4">
          <Checkbox
            label="Lembrar de mim"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
          />
          <button
            type="button"
            onClick={() =>
              toast.info(
                'Recuperação de senha',
                'Em breve você poderá redefinir sua senha por e-mail.',
              )
            }
            className="focus-ring text-small text-primary hover:text-primary-dark rounded font-semibold"
          >
            Esqueci minha senha
          </button>
        </div>
        <Button type="submit" size="lg" fullWidth loading={loading}>
          Entrar
        </Button>
      </form>

      <p className="text-small text-muted text-center">
        Ainda não tem conta?{' '}
        <Link
          to={
            redirect
              ? `${ROUTES.register}?redirect=${encodeURIComponent(redirect)}`
              : ROUTES.register
          }
          className="focus-ring text-primary hover:text-primary-dark rounded font-semibold"
        >
          Criar conta
        </Link>
      </p>

      {(env.isDev || env.useMocks) && (
        <div className="border-border rounded-xl border border-dashed bg-slate-50 p-4">
          <p className="text-caption text-muted flex items-center gap-2 font-semibold tracking-wide uppercase">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Contas de demonstração
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {(Object.keys(DEMO_CREDENTIALS) as (keyof typeof DEMO_CREDENTIALS)[]).map((kind) => (
              <button
                key={kind}
                type="button"
                onClick={() => fillDemo(kind)}
                className="focus-ring border-border bg-surface hover:border-primary flex flex-col items-start rounded-lg border px-3 py-2 text-left transition-colors"
              >
                <span className="text-small text-ink font-semibold">
                  {kind === 'admin' ? 'Administrador' : 'Cliente'}
                </span>
                <span className="text-caption text-muted">{DEMO_CREDENTIALS[kind].email}</span>
                <span className="text-caption text-muted">
                  senha: {DEMO_CREDENTIALS[kind].password}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
