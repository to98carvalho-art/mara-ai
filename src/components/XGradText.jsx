import { FED, GRAD_TXT } from '../design/tokens'

export default function XGradText({ children, size = 36, weight = 500 }) {
  return (
    <em style={{
      fontFamily: FED, fontSize: size, fontWeight: weight, fontStyle: 'italic',
      letterSpacing: -1, lineHeight: 1,
      background: GRAD_TXT,
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    }}>{children}</em>
  )
}
