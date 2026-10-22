import { Link } from 'react-router-dom'
import { SearchX } from 'lucide-react'
import { buttonStyles, Card, EmptyState, PageHeader } from '@/components/ui'

export default function NotFoundPage() {
  return (
    <>
      <PageHeader title="Page not found" />
      <Card>
        <EmptyState
          icon={SearchX}
          title="This page does not exist"
          description="The link may be broken or the page may have moved."
          action={<Link to="/" className={buttonStyles()}>Go to Overview</Link>}
        />
      </Card>
    </>
  )
}
