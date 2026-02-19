import type { Metadata } from 'next'
import { LoginForm } from './LoginForm'

export const metadata: Metadata = {
  title: 'Env Neo Ltda. — Login',
}

export default function AdminLoginPage() {
  return <LoginForm />
}
