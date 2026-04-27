import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSocketURL, setSocketURL, checkSocketConnection } from '../services/socketService'
import { getLLMEndpoint, setLLMEndpoint, getLLMModel, setLLMModel, checkLLMConnection } from '../services/llm'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'

export function Settings() {
  const navigate = useNavigate()
  const [socketUrl, setSocketUrlLocal] = useState(getSocketURL())
  const [llmEndpoint, setLLMEndpointLocal] = useState(getLLMEndpoint())
  const [llmModel, setLLMModelLocal] = useState(getLLMModel())
  const [socketStatus, setSocketStatus] = useState<boolean | null>(null)
  const [llmStatus, setLLMStatus] = useState<boolean | null>(null)
  const [saved, setSaved] = useState(false)

  const handleTestSocket = async () => {
    setSocketStatus(null)
    const result = await checkSocketConnection()
    setSocketStatus(result)
  }

  const handleTestLLM = async () => {
    setLLMStatus(null)
    const result = await checkLLMConnection()
    setLLMStatus(result)
  }

  const handleSave = () => {
    setSocketURL(socketUrl)
    setLLMEndpoint(llmEndpoint)
    setLLMModel(llmModel)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-[#8892b0] text-sm mt-1">Configure API endpoints and connection settings</p>
      </div>

      {/* Socket Configuration */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-bold text-white">Socket API Connection</p>
            <p className="text-xs text-[#8892b0] mt-1">Real-time communication endpoint</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono text-[#8892b0]">
              {socketStatus === null ? '⏳ Testing...' : socketStatus ? '✓ Connected' : '✗ Disconnected'}
            </p>
          </div>
        </div>

        <input
          type="text"
          value={socketUrl}
          onChange={(e) => setSocketUrlLocal(e.target.value)}
          placeholder="http://localhost:3001"
          className="w-full bg-[#1a2a4a] border border-[#2a3a5a] rounded-lg p-3 text-sm text-white placeholder-[#8892b0] focus:outline-none focus:border-[#00d4ff] mb-3"
        />

        <Button onClick={handleTestSocket} variant="secondary" size="sm" fullWidth>
          Test Connection
        </Button>
      </Card>

      {/* LLM Configuration */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-bold text-white">Local LLM (Fallback)</p>
            <p className="text-xs text-[#8892b0] mt-1">Ollama endpoint for offline mode</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono text-[#8892b0]">
              {llmStatus === null ? '⏳ Testing...' : llmStatus ? '✓ Connected' : '✗ Disconnected'}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-[#8892b0] block mb-2">
              Endpoint
            </label>
            <input
              type="text"
              value={llmEndpoint}
              onChange={(e) => setLLMEndpointLocal(e.target.value)}
              placeholder="http://localhost:11434/v1"
              className="w-full bg-[#1a2a4a] border border-[#2a3a5a] rounded-lg p-3 text-sm text-white placeholder-[#8892b0] focus:outline-none focus:border-[#00d4ff]"
            />
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-[#8892b0] block mb-2">
              Model
            </label>
            <input
              type="text"
              value={llmModel}
              onChange={(e) => setLLMModelLocal(e.target.value)}
              placeholder="llama3.2"
              className="w-full bg-[#1a2a4a] border border-[#2a3a5a] rounded-lg p-3 text-sm text-white placeholder-[#8892b0] focus:outline-none focus:border-[#00d4ff]"
            />
          </div>

          <Button onClick={handleTestLLM} variant="secondary" size="sm" fullWidth>
            Test Connection
          </Button>
        </div>
      </Card>

      {/* Info */}
      <Card className="border-[#00d4ff]/30">
        <p className="text-xs font-mono uppercase tracking-wider text-[#00d4ff] mb-2">Connection Priority</p>
        <ol className="space-y-2">
          <li className="text-xs text-[#8892b0]">
            <span className="text-white">1.</span> Socket API (real-time, preferred)
          </li>
          <li className="text-xs text-[#8892b0]">
            <span className="text-white">2.</span> Local LLM via Ollama (fallback)
          </li>
          <li className="text-xs text-[#8892b0]">
            <span className="text-white">3.</span> Scripted dialogue (offline mode)
          </li>
        </ol>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={handleSave} fullWidth>
          {saved ? '✓ Saved' : 'Save Settings'}
        </Button>
        <Button onClick={() => navigate('/')} variant="secondary" fullWidth>
          Back
        </Button>
      </div>
    </div>
  )
}
