'use client';

import { useFormStatus } from 'react-dom';
import { logoutAction } from '@/app/actions/auth';

function LogoutSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full text-left px-4 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
    >
      {pending ? 'Saindo...' : 'Sair'}
    </button>
  );
}

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <LogoutSubmitButton />
    </form>
  );
}
