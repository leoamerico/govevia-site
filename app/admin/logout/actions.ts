'use server'

import { redirect } from 'next/navigation'

import { deleteAdminSession } from '@/lib/auth/admin'

export async function logoutAction() {
  try {
    deleteAdminSession()
  } finally {
    redirect('/admin/login')
  }
}
