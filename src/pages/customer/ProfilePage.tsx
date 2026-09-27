import { MapPin, Phone, User as UserIcon } from 'lucide-react'
import { type FormEvent, useState } from 'react'

import { PageHeader } from '@/components/layout/PageHeader'
import { Avatar, Badge, Button, Card, CardContent, Input, useToast } from '@/components/ui'
import { useAuth } from '@/features/authentication/useAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useForm } from '@/hooks/useForm'
import { authService } from '@/services'
import { toErrorMessage } from '@/utils/errors'
import { formatDate } from '@/utils/format'
import { onlyDigits } from '@/utils/validation'

interface ProfileValues extends Record<string, unknown> {
  name: string
  phone: string
  city: string
}

const maskPhone = (value: string) =>
  onlyDigits(value)
    .slice(0, 11)
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2')

const validate = (values: ProfileValues) => ({
  name: values.name.trim().split(/\s+/).length < 2 ? 'Informe nome e sobrenome.' : undefined,
  phone: values.phone && onlyDigits(values.phone).length < 10 ? 'Telefone incompleto.' : undefined,
})

export default function ProfilePage() {
  useDocumentTitle('Meu perfil')
  const { user, updateUser } = useAuth()
  const toast = useToast()
  const [saving, setSaving] = useState(false)
  const form = useForm<ProfileValues>(
    { name: user?.name ?? '', phone: user?.phone ?? '', city: user?.city ?? '' },
    validate,
  )

  if (!user) return null

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!form.submit()) return
    setSaving(true)
    try {
      const updated = await authService.updateProfile(form.values)
      updateUser(updated)
      toast.success('Perfil atualizado com sucesso.')
    } catch (err) {
      toast.error('Não foi possível salvar.', toErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Meu perfil" description="Gerencie seus dados pessoais e preferências." />

      <div className="grid gap-6 lg:grid-cols-[20rem_1fr] lg:items-start">
        <Card>
          <CardContent className="flex flex-col items-center gap-3 text-center">
            <Avatar name={user.name} size="xl" />
            <div>
              <p className="text-h4 text-ink">{user.name}</p>
              <p className="text-small text-muted">{user.email}</p>
            </div>
            <Badge tone={user.role === 'admin' ? 'primary' : 'neutral'}>
              {user.role === 'admin' ? 'Administrador' : 'Cliente'}
            </Badge>
            <p className="text-caption text-muted">Membro desde {formatDate(user.createdAt)}</p>
          </CardContent>
        </Card>

        <Card>
          <form noValidate onSubmit={handleSubmit}>
            <CardContent className="flex flex-col gap-5">
              <h2 className="text-h3 text-ink">Dados pessoais</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Nome completo"
                  leftIcon={<UserIcon />}
                  autoComplete="name"
                  containerClassName="sm:col-span-2"
                  {...form.register('name')}
                />
                <Input
                  label="E-mail"
                  value={user.email}
                  disabled
                  hint="Para alterar o e-mail, fale com o suporte."
                />
                <Input label="CPF" value={user.cpf} disabled />
                <Input
                  label="Telefone"
                  leftIcon={<Phone />}
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="(00) 00000-0000"
                  {...form.register('phone')}
                  onChange={(event) => form.setField('phone', maskPhone(event.target.value))}
                />
                <Input
                  label="Cidade"
                  leftIcon={<MapPin />}
                  autoComplete="address-level2"
                  placeholder="Fortaleza, CE"
                  {...form.register('city')}
                />
              </div>
              <div className="border-border flex justify-end border-t pt-5">
                <Button type="submit" loading={saving}>
                  Salvar alterações
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  )
}
