import { Button } from '@/components/ui/button'
import { WifiSignalIllustration } from '@/components/wifi/illustrations'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-dvh w-full flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm animate-fade-in-up">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-6">
            <WifiSignalIllustration className="w-20 h-20 opacity-30" />
            <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-destructive">
              <AlertCircle className="h-5 w-5 text-white" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Something went wrong
          </h1>
          
          <p className="mt-3 text-sm text-muted-foreground max-w-[280px]">
            We encountered an error during authentication. Please try again.
          </p>

          {params?.error && (
            <div className="mt-4 w-full rounded-xl bg-destructive/10 p-4">
              <p className="text-sm text-destructive font-medium">
                Error: {params.error}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3 w-full mt-8">
            <Button asChild className="w-full h-12 rounded-xl font-semibold">
              <Link href="/auth/login" className="w-full">
                Try Again
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full h-12 rounded-xl font-medium">
              <Link href="/" className="w-full">
                Go Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
