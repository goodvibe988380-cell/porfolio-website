export type ArchitectureStepId =
  | 'DATA'
  | 'MODEL'
  | 'RAG'
  | 'AGENT'
  | 'TOOLS'
  | 'AUTOMATION'
  | 'DEPLOY'

export interface ArchitectureNodeConfig {
  id: ArchitectureStepId
  stepNumber: number
  label: string
  sublabel: string
  insight: string
  position: [number, number, number]
  geometryType: 'box' | 'cylinder' | 'octahedron' | 'icosahedron'
  color: string
  activeColor: string
  connectionsTo: ArchitectureStepId[]
}

export const ARCHITECTURE_STEPS: ArchitectureNodeConfig[] = [
  {
    id: 'DATA',
    stepNumber: 1,
    label: 'DATA',
    sublabel: 'Vector & Structured Store',
    insight: 'Every intelligent system starts with useful data.',
    position: [-6.2, -0.6, 0.3],
    geometryType: 'cylinder',
    color: '#d97706',
    activeColor: '#fbbf24',
    connectionsTo: ['MODEL'],
  },
  {
    id: 'MODEL',
    stepNumber: 2,
    label: 'MODEL',
    sublabel: 'Foundation LLM / Multi-modal',
    insight: 'Turn information into intelligence.',
    position: [-4.2, 1.3, 0.4],
    geometryType: 'octahedron',
    color: '#0284c7',
    activeColor: '#00f0ff',
    connectionsTo: ['RAG'],
  },
  {
    id: 'RAG',
    stepNumber: 3,
    label: 'RAG',
    sublabel: 'Contextual Retrieval',
    insight: 'Give intelligence access to knowledge.',
    position: [-2.2, -1.2, 0.5],
    geometryType: 'icosahedron',
    color: '#0d9488',
    activeColor: '#2dd4bf',
    connectionsTo: ['AGENT'],
  },
  {
    id: 'AGENT',
    stepNumber: 4,
    label: 'AGENT',
    sublabel: 'Cognitive Reasoning Engine',
    insight: 'Give intelligence the ability to act.',
    position: [0, 2.1, 0.6],
    geometryType: 'octahedron',
    color: '#9333ea',
    activeColor: '#e879f9',
    connectionsTo: ['TOOLS'],
  },
  {
    id: 'TOOLS',
    stepNumber: 5,
    label: 'TOOLS',
    sublabel: 'API & Function Calling',
    insight: 'Connect intelligence to the real world.',
    position: [2.2, -1.2, 0.5],
    geometryType: 'box',
    color: '#ea580c',
    activeColor: '#fb923c',
    connectionsTo: ['AUTOMATION'],
  },
  {
    id: 'AUTOMATION',
    stepNumber: 6,
    label: 'AUTOMATION',
    sublabel: 'Pipelines & Workflows',
    insight: 'Make the system work for you.',
    position: [4.2, 1.3, 0.4],
    geometryType: 'cylinder',
    color: '#ca8a04',
    activeColor: '#fde047',
    connectionsTo: ['DEPLOY'],
  },
  {
    id: 'DEPLOY',
    stepNumber: 7,
    label: 'DEPLOY',
    sublabel: 'Production Edge & Scale',
    insight: 'An idea becomes valuable when people can use it.',
    position: [6.2, -0.6, 0.3],
    geometryType: 'icosahedron',
    color: '#059669',
    activeColor: '#34d399',
    connectionsTo: [],
  },
]
