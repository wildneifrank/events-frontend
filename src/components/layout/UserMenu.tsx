import { ChevronDown } from 'lucide-react'

import { Avatar, Dropdown } from '@/components/ui'
import type { User } from '@/types'

import { useLogout, userMenuItems } from './accountMenu'

export function UserMenu({ user }: { user: User }) {
  const handleLogout = useLogout()

  return (
    <Dropdown
      items={userMenuItems(user, handleLogout)}
      header={
        <div className="flex flex-col">
          <span className="text-small text-ink truncate font-semibold">{user.name}</span>
          <span className="text-caption text-muted truncate">{user.email}</span>
        </div>
      }
      triggerLabel={`Menu da conta de ${user.name}`}
      triggerClassName="focus-ring flex items-center gap-2.5 rounded-full py-1 pr-2 pl-1 transition-colors hover:bg-slate-100"
      trigger={
        <>
          <Avatar name={user.name} size="sm" />
          <span
            className="text-small text-ink hidden max-w-32 truncate font-semibold xl:block"
            aria-hidden="true"
          >
            {user.name.split(' ')[0]}
          </span>
          <ChevronDown className="text-muted size-4" aria-hidden="true" />
        </>
      }
    />
  )
}
