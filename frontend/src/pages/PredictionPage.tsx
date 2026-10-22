import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, RotateCcw, Sparkles } from 'lucide-react'
import { DemoNotice } from '@/components/feedback'
import { Button, Card, CardBody, CardHeader, Field, Input, PageHeader, Select, useToast } from '@/components/ui'
import { sections } from '@/features/predictions/formConfig'
import { predictionInputSchema, type PredictionInput } from '@/schemas/prediction'
import { createPrediction } from '@/services'
import type { ApiError } from '@/types'

export default function PredictionPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [submitError, setSubmitError] = useState<string>()
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PredictionInput>({
    resolver: zodResolver(predictionInputSchema),
    defaultValues: { customerId: '' },
  })

  const onSubmit = async (values: PredictionInput) => {
    setSubmitError(undefined)
    try {
      const result = await createPrediction(values)
      toast.success('Prediction ready')
      navigate(`/prediction/result/${result.predictionId}`)
    } catch (e) {
      setSubmitError((e as ApiError).message)
    }
  }

  return (
    <>
      <PageHeader title="Churn prediction" description="Enter a customer's details. The prediction is produced by the backend model, not by this page." />
      <DemoNotice>Demo mode: submitting returns a fixed sample result, not a prediction calculated from your inputs.</DemoNotice>
      {submitError && (
        <div role="alert" className="mb-4 flex items-start gap-2 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />{submitError}
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        {sections.map((section) => (
          <Card key={section.title}>
            <CardHeader title={section.title} description={section.description} />
            <CardBody className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {section.fields.map((f) => {
                const message = errors[f.name]?.message
                const describedBy = message ? `${f.name}-error` : f.hint ? `${f.name}-hint` : undefined
                return (
                  <Field key={f.name} label={f.label} htmlFor={f.name} hint={f.hint} error={message}>
                    {f.kind === 'select' ? (
                      <Select id={f.name} invalid={!!message} aria-describedby={describedBy} {...register(f.name)}>
                        <option value="">Select…</option>
                        {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                      </Select>
                    ) : (
                      <Input id={f.name} type={f.kind === 'number' ? 'number' : 'text'} inputMode={f.kind === 'number' ? 'decimal' : undefined} step={f.step} invalid={!!message} aria-describedby={describedBy}
                        {...register(f.name, f.kind === 'number' ? { valueAsNumber: true } : undefined)} />
                    )}
                  </Field>
                )
              })}
            </CardBody>
          </Card>
        ))}
        <div className="flex flex-wrap justify-end gap-3">
          <Button variant="secondary" onClick={() => { reset(); setSubmitError(undefined) }} disabled={isSubmitting}><RotateCcw className="h-4 w-4" aria-hidden />Reset form</Button>
          <Button type="submit" loading={isSubmitting}><Sparkles className="h-4 w-4" aria-hidden />{isSubmitting ? 'Predicting…' : 'Predict churn'}</Button>
        </div>
      </form>
    </>
  )
}
