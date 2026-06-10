import { isDemoMode } from '@/lib/broker/demo-mode'
import AiAssistantClient from './AiAssistantClient'

export default function AiAssistantPage() {
  const demoMode = isDemoMode()
  return <AiAssistantClient demoMode={demoMode} />
}
