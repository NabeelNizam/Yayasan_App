export const dynamic = 'force-dynamic'

import Thrower from './Thrower'

export default function WidgetThrowPage() {
  return (
    <div>
      <h1>Widget Boundary Demo</h1>
      <p data-testid="sibling-left">sibling-left-ok</p>
      <Thrower />
      <p data-testid="sibling-right">sibling-right-ok</p>
    </div>
  )
}
