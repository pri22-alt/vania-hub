import { redirect } from 'next/navigation'

export default function SignUpPage() {
  // Sign-up disabled - use sign-in only, admins add users manually
  redirect('/sign-in')
}
