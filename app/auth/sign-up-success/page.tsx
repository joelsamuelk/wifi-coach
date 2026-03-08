import { SuccessIllustration } from '@/components/wifi/illustrations'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Mail } from 'lucide-react'

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-dvh w-full flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm animate-fade-in-up">
        <div className="flex flex-col items-center text-center">
          <SuccessIllustration className="w-24 h-24 mb-6" />
          
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Check your email
          </h1>
          
          <p className="mt-3 text-sm text-muted-foreground max-w-[280px]">
            We&apos;ve sent you a confirmation link. Please check your email to verify your account.
          </p>

          <div className="mt-8 w-full rounded-2xl bg-card p-6 card-shadow">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">Didn&apos;t receive email?</p>
                <p className="text-xs text-muted-foreground">Check your spam folder</p>
              </div>
            </div>
          </div>

          <Button asChild variant="outline" className="w-full h-12 rounded-xl font-medium mt-6">
            <Link href="/auth/login" className="w-full">
              Back to Sign In
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
