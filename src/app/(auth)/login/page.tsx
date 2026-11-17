import { redirect } from 'next/navigation'

/**
 * /login era una página de plantilla vacía (SaaS Factory). Mientras no exista de verdad, lleva a Tu panel (/panel),
 * que es la puerta de todo. Si algún día se arma login de verdad, se reemplaza este archivo.
 */
export default function LoginPage() {
  redirect('/panel')
}
