import { useState } from 'react'
import { AlertTriangle, MessageSquareText, Send, Sparkles } from 'lucide-react'
import { Button, Card, CardBody, CardHeader, Input } from '@/components/ui'
import { explainInWords } from '@/services'
import type { ApiError } from '@/types'

interface Turn { question?: string; text: string }

/** Plain-language explanation and follow-up questions. The AI call happens on the backend; no key is stored here. */
export function NarrativePanel({ predictionId }: { predictionId: string }) {
  const [turns, setTurns] = useState<Turn[]>([])
  const [question, setQuestion] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string>()
  const [note, setNote] = useState<string>()

  const ask = async (q?: string) => {
    setBusy(true); setError(undefined)
    try {
      const r = await explainInWords(predictionId, q)
      setTurns((t) => [...t, { question: q, text: r.text }]); setNote(r.disclaimer); setQuestion('')
    } catch (e) { setError((e as ApiError).message) } finally { setBusy(false) }
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader title="Plain-language explanation" description="An AI assistant restates the model's SHAP results in words. It sees only this prediction's saved results." />
      <CardBody className="space-y-4">
        {turns.length === 0 && <Button onClick={() => ask()} loading={busy}><Sparkles className="h-4 w-4" aria-hidden />Explain in plain language</Button>}
        <div aria-live="polite" className="space-y-3">
          {turns.map((t, i) => (
            <div key={i} className="space-y-1.5">
              {t.question && <p className="flex items-start gap-2 text-sm font-medium text-ink"><MessageSquareText className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden />{t.question}</p>}
              <p className="rounded-lg bg-canvas px-4 py-3 text-sm leading-relaxed text-ink">{t.text}</p>
            </div>
          ))}
        </div>
        {error && <p role="alert" className="flex items-start gap-2 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />{error}</p>}
        {turns.length > 0 && (
          <div className="flex gap-2">
            <label htmlFor="follow" className="sr-only">Ask a follow-up question</label>
            <Input id="follow" value={question} maxLength={300} placeholder="Ask a follow-up, e.g. Which factor matters most?" onChange={(e) => setQuestion(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && question.trim() && !busy) ask(question.trim()) }} />
            <Button onClick={() => ask(question.trim())} loading={busy} disabled={!question.trim()}><Send className="h-4 w-4" aria-hidden />Ask</Button>
          </div>
        )}
        {note && <p className="text-xs text-muted">{note}</p>}
      </CardBody>
    </Card>
  )
}
