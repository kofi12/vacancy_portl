import { toast } from '@/hooks/use-toast'

export function handleApiError(e: unknown): void {
  const message = e instanceof Error ? e.message : 'Something went wrong'
  toast({ title: 'Error', description: message, variant: 'destructive' })
}
