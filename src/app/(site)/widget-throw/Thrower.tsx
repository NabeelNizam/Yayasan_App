'use client'

import WidgetBoundary from '@/components/WidgetBoundary'

function Boom(): React.ReactElement {
  throw new Error('widget boom')
}

export default function Thrower() {
  return (
    <WidgetBoundary fallback={<span data-testid="fallback">Data sedang diperbarui</span>}>
      <Boom />
    </WidgetBoundary>
  )
}
