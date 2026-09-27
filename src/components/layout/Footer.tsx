import { Link } from 'react-router-dom'

import { BRAND } from '@/constants/brand'
import { CATEGORIES } from '@/constants/categories'
import { ROUTES } from '@/constants/routes'

import { Logo } from './Logo'

const COLUMNS = [
  {
    title: 'Explorar',
    links: CATEGORIES.slice(0, 4).map((category) => ({
      label: category.label,
      to: `${ROUTES.events}?category=${category.value}`,
    })),
  },
  {
    title: 'Sua conta',
    links: [
      { label: 'Meus ingressos', to: ROUTES.myTickets },
      { label: 'Perfil', to: ROUTES.profile },
      { label: 'Criar conta', to: ROUTES.register },
    ],
  },
  {
    title: 'Organizadores',
    links: [
      { label: 'Painel do produtor', to: ROUTES.admin },
      { label: 'Publicar evento', to: ROUTES.adminEventNew },
    ],
  },
]

export function Footer() {
  return (
    <footer className="bg-night text-slate-300">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="flex max-w-xs flex-col gap-4">
          <Logo inverted />
          <p className="text-small text-slate-400">
            {BRAND.tagline}. Compra segura, ingresso no celular e suporte de verdade.
          </p>
        </div>
        {COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h2 className="text-small font-semibold text-white">{column.title}</h2>
            <ul className="mt-4 flex flex-col gap-2.5">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="focus-ring text-small rounded transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="container-page text-caption flex flex-col gap-2 py-6 text-slate-400 sm:flex-row sm:justify-between">
          <p>
            © {new Date().getFullYear()} {BRAND.name}. Todos os direitos reservados.
          </p>
          <p>
            Suporte:{' '}
            <a
              href={`mailto:${BRAND.supportEmail}`}
              className="focus-ring rounded hover:text-white"
            >
              {BRAND.supportEmail}
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
