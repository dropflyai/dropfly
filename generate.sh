#!/bin/bash
# Generate boilerplate code instantly
# Usage: ./generate.sh [type] [name]
#        ./generate.sh component Button
#        ./generate.sh page dashboard
#        ./generate.sh api auth/login

TYPE=$1
NAME=$2

if [ -z "$TYPE" ] || [ -z "$NAME" ]; then
  echo "❌ Usage: ./generate.sh [type] [name]"
  echo ""
  echo "Types available:"
  echo "  component [name]  - React component with state"
  echo "  page [name]       - Next.js page with metadata"
  echo "  api [name]        - API route with GET/POST"
  echo "  hook [name]       - Custom React hook"
  echo "  context [name]    - React context provider"
  echo "  store [name]      - Zustand store"
  exit 1
fi

# Convert PascalCase/kebab-case to appropriate format
PASCAL_NAME=$(echo "$NAME" | sed -r 's/(^|-)([a-z])/\U\2/g')
KEBAB_NAME=$(echo "$NAME" | sed -r 's/([A-Z])/-\L\1/g' | sed 's/^-//')
CAMEL_NAME=$(echo "$PASCAL_NAME" | sed 's/^./\L&/')

case "$TYPE" in
  "component")
    mkdir -p src/components
    cat > "src/components/${PASCAL_NAME}.tsx" << EOF
'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface ${PASCAL_NAME}Props {
  className?: string
  children?: React.ReactNode
}

export function ${PASCAL_NAME}({ className, children }: ${PASCAL_NAME}Props) {
  const [isActive, setIsActive] = useState(false)
  
  return (
    <div className={cn(
      "rounded-lg border p-4",
      isActive && "bg-primary/10",
      className
    )}>
      {children}
    </div>
  )
}
EOF
    echo "✅ Component created: src/components/${PASCAL_NAME}.tsx"
    echo "📝 Import with: import { ${PASCAL_NAME} } from '@/components/${PASCAL_NAME}'"
    ;;
    
  "page")
    mkdir -p "src/app/${KEBAB_NAME}"
    cat > "src/app/${KEBAB_NAME}/page.tsx" << EOF
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '${PASCAL_NAME} | Your App',
  description: '${PASCAL_NAME} page description',
}

export default function ${PASCAL_NAME}Page() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">${PASCAL_NAME}</h1>
      
      <div className="grid gap-6">
        {/* Page content here */}
      </div>
    </div>
  )
}
EOF
    echo "✅ Page created: src/app/${KEBAB_NAME}/page.tsx"
    echo "🌐 Access at: http://localhost:3000/${KEBAB_NAME}"
    ;;
    
  "api")
    mkdir -p "src/app/api/${KEBAB_NAME}"
    cat > "src/app/api/${KEBAB_NAME}/route.ts" << EOF
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get query params
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    // Your logic here
    const data = {
      message: 'Success',
      timestamp: new Date().toISOString(),
      id
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('GET /${KEBAB_NAME} error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    if (!body.name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }
    
    // Your logic here
    const result = {
      id: crypto.randomUUID(),
      ...body,
      createdAt: new Date().toISOString()
    }
    
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('POST /${KEBAB_NAME} error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
EOF
    echo "✅ API route created: src/app/api/${KEBAB_NAME}/route.ts"
    echo "🔗 Endpoint: http://localhost:3000/api/${KEBAB_NAME}"
    ;;
    
  "hook")
    mkdir -p src/hooks
    cat > "src/hooks/use${PASCAL_NAME}.ts" << EOF
'use client'

import { useState, useEffect, useCallback } from 'react'

interface Use${PASCAL_NAME}Options {
  initialValue?: any
  onUpdate?: (value: any) => void
}

export function use${PASCAL_NAME}(options: Use${PASCAL_NAME}Options = {}) {
  const { initialValue = null, onUpdate } = options
  const [value, setValue] = useState(initialValue)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  const update = useCallback(async (newValue: any) => {
    try {
      setLoading(true)
      setError(null)
      
      // Your async logic here
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setValue(newValue)
      onUpdate?.(newValue)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [onUpdate])
  
  useEffect(() => {
    // Cleanup or subscriptions here
    return () => {
      // Cleanup
    }
  }, [])
  
  return {
    value,
    loading,
    error,
    update,
    reset: () => setValue(initialValue)
  }
}
EOF
    echo "✅ Hook created: src/hooks/use${PASCAL_NAME}.ts"
    echo "📝 Import with: import { use${PASCAL_NAME} } from '@/hooks/use${PASCAL_NAME}'"
    ;;
    
  "context")
    mkdir -p src/contexts
    cat > "src/contexts/${PASCAL_NAME}Context.tsx" << EOF
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface ${PASCAL_NAME}ContextType {
  value: any
  setValue: (value: any) => void
  loading: boolean
}

const ${PASCAL_NAME}Context = createContext<${PASCAL_NAME}ContextType | undefined>(undefined)

export function ${PASCAL_NAME}Provider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // Initialize context
    const init = async () => {
      try {
        // Load initial data
        setLoading(false)
      } catch (error) {
        console.error('${PASCAL_NAME}Context init error:', error)
        setLoading(false)
      }
    }
    
    init()
  }, [])
  
  return (
    <${PASCAL_NAME}Context.Provider value={{ value, setValue, loading }}>
      {children}
    </${PASCAL_NAME}Context.Provider>
  )
}

export function use${PASCAL_NAME}() {
  const context = useContext(${PASCAL_NAME}Context)
  if (!context) {
    throw new Error('use${PASCAL_NAME} must be used within ${PASCAL_NAME}Provider')
  }
  return context
}
EOF
    echo "✅ Context created: src/contexts/${PASCAL_NAME}Context.tsx"
    echo "📝 Wrap app with: <${PASCAL_NAME}Provider>{children}</${PASCAL_NAME}Provider>"
    echo "📝 Use with: const { value, setValue } = use${PASCAL_NAME}()"
    ;;
    
  "store")
    mkdir -p src/stores
    cat > "src/stores/${CAMEL_NAME}Store.ts" << EOF
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ${PASCAL_NAME}State {
  // State
  items: any[]
  selectedItem: any | null
  isLoading: boolean
  error: string | null
  
  // Actions
  setItems: (items: any[]) => void
  addItem: (item: any) => void
  removeItem: (id: string) => void
  selectItem: (item: any | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

const initialState = {
  items: [],
  selectedItem: null,
  isLoading: false,
  error: null,
}

export const use${PASCAL_NAME}Store = create<${PASCAL_NAME}State>()(
  persist(
    (set) => ({
      ...initialState,
      
      setItems: (items) => set({ items }),
      
      addItem: (item) => set((state) => ({
        items: [...state.items, item]
      })),
      
      removeItem: (id) => set((state) => ({
        items: state.items.filter(item => item.id !== id)
      })),
      
      selectItem: (item) => set({ selectedItem: item }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
      
      reset: () => set(initialState),
    }),
    {
      name: '${KEBAB_NAME}-storage',
    }
  )
)
EOF
    echo "✅ Store created: src/stores/${CAMEL_NAME}Store.ts"
    echo "📝 Use with: const { items, addItem } = use${PASCAL_NAME}Store()"
    ;;
    
  *)
    echo "❌ Unknown type: $TYPE"
    echo "Available types: component, page, api, hook, context, store"
    exit 1
    ;;
esac

echo ""
echo "💡 Next steps:"
echo "  1. Check the generated file and customize as needed"
echo "  2. Import and use in your application"
echo "  3. Run: npm run dev (if not already running)"