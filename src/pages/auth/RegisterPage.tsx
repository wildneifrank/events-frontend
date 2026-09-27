import { IdCard, Mail, User } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import { Alert, Button, Checkbox, Input, PasswordInput, useToast } from '@/components/ui'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/features/authentication/useAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useForm } from '@/hooks/useForm'
import { cn } from '@/utils/cn'
import { toErrorMessage } from '@/utils/errors'
import { isValidCpf, isValidEmail, maskCpf, passwordStrength } from '@/utils/validation'

interface RegisterValues extends Record<string, unknown> {
  name: string
  email: string
  cpf: string
  password: string
  confirmPassword: string
  terms: boolean
}

const validate = (values: RegisterValues) => ({
  name: values.name.trim().split(/\s+/).length < 2 ? 'Informe nome e sobrenome.' : undefined,
  email: !values.email
    ? 'Informe seu e-mail.'
    : !isValidEmail(values.email)
      ? 'E-mail inválido.'
      : undefined,
  cpf: !values.cpf ? 'Informe seu CPF.' : !isValidCpf(values.cpf) ? 'CPF inválido.' : undefined,
  password: values.password.length < 8 ? 'A senha deve ter pelo menos 8 caracteres.' : undefined,
  confirmPassword: !values.confirmPassword
    ? 'Confirme sua senha.'
    : values.confirmPassword !== values.password
      ? 'As senhas não coincidem.'
      : undefined,
  terms: values.terms ? undefined : 'Você precisa aceitar os termos para continuar.',
})

const STRENGTH = [
  { label: 'Muito fraca', color: 'bg-danger' },
  { label: 'Fraca', color: 'bg-warning' },
  { label: 'Boa', color: 'bg-info' },
  { label: 'Forte', color: 'bg-success' },
]

export default function RegisterPage() {
  useDocumentTitle('Criar conta')
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [params] = useSearchParams()
  const redirect = params.get('redirect')

  const form = useForm<RegisterValues>(
    { name: '', email: '', cpf: '', password: '', confirmPassword: '', terms: false },
    validate,
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const strength = passwordStrength(form.values.password)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    if (!form.submit()) return
    setLoading(true)
    try {
      const { name, email, cpf, password } = form.values
      await registerUser({ name, email, cpf, password })
      toast.success('Conta criada com sucesso!', 'Agora é só escolher seu próximo evento.')
      navigate(redirect?.startsWith('/') && !redirect.startsWith('//') ? redirect : ROUTES.events, {
        replace: true,
      })
    } catch (err) {
      setError(toErrorMessage(err))
      setLoading(false)
    }
  }

  const cpfField = form.register('cpf')

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-h1 text-ink">Crie sua conta</h1>
        <p className="text-body text-muted">
          Leva menos de um minuto e seus ingressos ficam sempre à mão.
        </p>
      </div>

      {error && (
        <Alert tone="danger" title="Não foi possível criar a conta">
          {error}
        </Alert>
      )}

      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Input
          label="Nome completo"
          autoComplete="name"
          placeholder="Ana Souza"
          leftIcon={<User />}
          required
          {...form.register('name')}
        />
        <Input
          label="E-mail"
          type="email"
          autoComplete="email"
          placeholder="voce@email.com"
          leftIcon={<Mail />}
          required
          {...form.register('email')}
        />
        <Input
          label="CPF"
          inputMode="numeric"
          placeholder="000.000.000-00"
          leftIcon={<IdCard />}
          required
          {...cpfField}
          onChange={(event) => form.setField('cpf', maskCpf(event.target.value))}
        />
        <div className="flex flex-col gap-2">
          <PasswordInput
            label="Senha"
            autoComplete="new-password"
            hint="Mínimo de 8 caracteres."
            required
            {...form.register('password')}
          />
          {form.values.password && (
            <div className="flex items-center gap-3" aria-live="polite">
              <div className="flex flex-1 gap-1" aria-hidden="true">
                {[0, 1, 2].map((index) => (
                  <span
                    key={index}
                    className={cn(
                      'h-1 flex-1 rounded-full',
                      index < strength ? STRENGTH[strength]?.color : 'bg-slate-200',
                    )}
                  />
                ))}
              </div>
              <span className="text-caption text-muted">Força: {STRENGTH[strength]?.label}</span>
            </div>
          )}
        </div>
        <PasswordInput
          label="Confirmar senha"
          autoComplete="new-password"
          required
          {...form.register('confirmPassword')}
        />
        <Checkbox
          label={
            <>
              Aceito os{' '}
              <a
                href="#termos"
                className="text-primary font-semibold underline-offset-2 hover:underline"
              >
                termos de uso
              </a>{' '}
              e a política de privacidade
            </>
          }
          checked={form.values.terms}
          onChange={(event) => form.setField('terms', event.target.checked)}
          error={form.errorFor('terms')}
        />
        <Button type="submit" size="lg" fullWidth loading={loading}>
          Criar conta
        </Button>
      </form>

      <p className="text-small text-muted text-center">
        Já tem uma conta?{' '}
        <Link
          to={ROUTES.login}
          className="focus-ring text-primary hover:text-primary-dark rounded font-semibold"
        >
          Entrar
        </Link>
      </p>
    </div>
  )
}
