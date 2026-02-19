// Redireciona raiz → /admin/login (por segurança, não expõe nada)
import { redirect } from 'next/navigation'

export default function RootPage() {
  redirect('/admin/login')
}
