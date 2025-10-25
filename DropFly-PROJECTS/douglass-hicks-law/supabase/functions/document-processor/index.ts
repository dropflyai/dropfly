// LegalFlow Pro - Document Processing Edge Function
// Handles document upload, encryption, OCR, and privilege analysis
// Created: 2025-08-17

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DocumentProcessingRequest {
  file: {
    name: string
    content: string // Base64 encoded
    mimeType: string
    size: number
  }
  metadata: {
    caseId?: string
    clientId?: string
    categoryId?: string
    title: string
    description?: string
    documentType: string
    isPrivileged: boolean
    accessLevel: 'public' | 'internal' | 'confidential' | 'restricted'
  }
  processingOptions: {
    performOCR: boolean
    detectPrivilege: boolean
    extractMetadata: boolean
    generatePreview: boolean
  }
}

interface DocumentProcessingResponse {
  success: boolean
  documentId?: string
  error?: string
  processingResults: {
    ocrText?: string
    privilegeAnalysis?: {
      containsPrivilegedContent: boolean
      confidenceScore: number
      detectedPrivilegeTypes: string[]
    }
    extractedMetadata?: {
      pageCount?: number
      wordCount?: number
      language?: string
      keywords?: string[]
    }
    previewUrl?: string
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify authentication
    const authorization = req.headers.get('Authorization')
    if (!authorization) {
      throw new Error('No authorization header')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authorization },
        },
      }
    )

    // Get current user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      throw new Error('Authentication failed')
    }

    // Get user's law firm
    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .select('law_firm_id, role')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      throw new Error('User not found')
    }

    const request: DocumentProcessingRequest = await req.json()

    // Validate request
    if (!request.file || !request.metadata || !request.processingOptions) {
      throw new Error('Invalid request format')
    }

    // Verify access to case/client if specified
    if (request.metadata.caseId) {
      const { data: caseData, error: caseError } = await supabaseClient
        .from('cases')
        .select('id')
        .eq('id', request.metadata.caseId)
        .eq('law_firm_id', userData.law_firm_id)
        .single()

      if (caseError || !caseData) {
        throw new Error('Access denied: Case not found or no permission')
      }
    }

    if (request.metadata.clientId) {
      const { data: clientData, error: clientError } = await supabaseClient
        .from('clients')
        .select('id')
        .eq('id', request.metadata.clientId)
        .eq('law_firm_id', userData.law_firm_id)
        .single()

      if (clientError || !clientData) {
        throw new Error('Access denied: Client not found or no permission')
      }
    }

    // Generate secure file path
    const fileExtension = request.file.name.split('.').pop()
    const documentId = crypto.randomUUID()
    const encryptedFileName = `${documentId}.${fileExtension}`
    const filePath = `${userData.law_firm_id}/documents/${request.metadata.caseId || 'general'}/${encryptedFileName}`

    // Decode base64 content
    const fileContent = Uint8Array.from(atob(request.file.content), c => c.charCodeAt(0))

    // Calculate file hash for integrity
    const hashBuffer = await crypto.subtle.digest('SHA-256', fileContent)
    const fileHash = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    // Store file in Supabase Storage with encryption
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('legal-documents')
      .upload(filePath, fileContent, {
        contentType: request.file.mimeType,
        metadata: {
          documentId,
          lawFirmId: userData.law_firm_id,
          uploadedBy: user.id,
          isPrivileged: request.metadata.isPrivileged.toString(),
          accessLevel: request.metadata.accessLevel
        }
      })

    if (uploadError) {
      throw new Error(`File upload failed: ${uploadError.message}`)
    }

    // Initialize processing results
    const processingResults: DocumentProcessingResponse['processingResults'] = {}

    // Perform OCR if requested and file type supports it
    if (request.processingOptions.performOCR && isPDFOrImage(request.file.mimeType)) {
      try {
        processingResults.ocrText = await performOCR(fileContent, request.file.mimeType)
      } catch (ocrError) {
        console.error('OCR failed:', ocrError)
        // Continue processing even if OCR fails
      }
    }

    // Analyze for privileged content if requested
    if (request.processingOptions.detectPrivilege && processingResults.ocrText) {
      processingResults.privilegeAnalysis = await analyzePrivilegedContent(processingResults.ocrText)
      
      // Update privilege flag based on analysis
      if (processingResults.privilegeAnalysis.containsPrivilegedContent && 
          processingResults.privilegeAnalysis.confidenceScore > 0.7) {
        request.metadata.isPrivileged = true
      }
    }

    // Extract document metadata if requested
    if (request.processingOptions.extractMetadata) {
      processingResults.extractedMetadata = await extractDocumentMetadata(
        fileContent, 
        request.file.mimeType,
        processingResults.ocrText
      )
    }

    // Generate preview if requested
    if (request.processingOptions.generatePreview) {
      processingResults.previewUrl = await generateDocumentPreview(
        documentId,
        fileContent,
        request.file.mimeType
      )
    }

    // Create document record in database
    const { data: documentData, error: documentError } = await supabaseClient
      .from('documents')
      .insert({
        id: documentId,
        law_firm_id: userData.law_firm_id,
        case_id: request.metadata.caseId || null,
        client_id: request.metadata.clientId || null,
        category_id: request.metadata.categoryId || null,
        title: request.metadata.title,
        description: request.metadata.description || null,
        file_name: request.file.name,
        file_path: filePath,
        file_size: request.file.size,
        mime_type: request.file.mimeType,
        file_hash: fileHash,
        document_type: request.metadata.documentType,
        is_privileged: request.metadata.isPrivileged,
        access_level: request.metadata.accessLevel,
        created_by: user.id,
        search_content: processingResults.ocrText || null,
        encryption_key_id: 'default', // In production, use proper key management
      })
      .select()
      .single()

    if (documentError) {
      // Clean up uploaded file if database insert fails
      await supabaseClient.storage
        .from('legal-documents')
        .remove([filePath])
      
      throw new Error(`Database insert failed: ${documentError.message}`)
    }

    // Log document access
    await supabaseClient
      .from('document_access_log')
      .insert({
        law_firm_id: userData.law_firm_id,
        document_id: documentId,
        user_id: user.id,
        action: 'upload',
        notes: 'Document uploaded and processed'
      })

    const response: DocumentProcessingResponse = {
      success: true,
      documentId,
      processingResults
    }

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Document processing error:', error)
    
    const response: DocumentProcessingResponse = {
      success: false,
      error: error.message,
      processingResults: {}
    }

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

// Helper Functions

function isPDFOrImage(mimeType: string): boolean {
  return mimeType === 'application/pdf' || 
         mimeType.startsWith('image/')
}

async function performOCR(fileContent: Uint8Array, mimeType: string): Promise<string> {
  // In production, integrate with services like AWS Textract, Google Vision API, or Azure Computer Vision
  // For demo purposes, return simulated OCR text
  
  if (mimeType === 'application/pdf') {
    // Simulate PDF OCR processing
    return "This is simulated OCR text from a PDF document. In production, this would contain the actual extracted text from the PDF using advanced OCR services."
  } else if (mimeType.startsWith('image/')) {
    // Simulate image OCR processing
    return "This is simulated OCR text from an image document. In production, this would contain the actual extracted text from the image using optical character recognition."
  }
  
  return ""
}

async function analyzePrivilegedContent(text: string): Promise<{
  containsPrivilegedContent: boolean
  confidenceScore: number
  detectedPrivilegeTypes: string[]
}> {
  // Legal privilege detection keywords and patterns
  const privilegeKeywords = [
    'attorney-client privilege',
    'confidential',
    'privileged and confidential',
    'work product',
    'attorney work product',
    'legal advice',
    'in confidence',
    'private and confidential',
    'settlement discussions',
    'plea negotiations',
    'mediation',
    'arbitration proceedings'
  ]

  const workProductKeywords = [
    'legal strategy',
    'case strategy',
    'trial preparation',
    'witness preparation',
    'expert analysis',
    'internal memo',
    'legal research',
    'case analysis'
  ]

  const lowerText = text.toLowerCase()
  const detectedPrivilegeTypes: string[] = []
  let confidenceScore = 0

  // Check for attorney-client privilege indicators
  for (const keyword of privilegeKeywords) {
    if (lowerText.includes(keyword)) {
      detectedPrivilegeTypes.push('attorney-client')
      confidenceScore += 0.3
    }
  }

  // Check for work product indicators
  for (const keyword of workProductKeywords) {
    if (lowerText.includes(keyword)) {
      detectedPrivilegeTypes.push('work-product')
      confidenceScore += 0.2
    }
  }

  // Check for communication patterns indicating privilege
  const privilegePatterns = [
    /from:.*@.*\.law/i,
    /to:.*counsel/i,
    /subject:.*\b(re|regarding):.*legal/i,
    /dear (attorney|counsel)/i
  ]

  for (const pattern of privilegePatterns) {
    if (pattern.test(text)) {
      detectedPrivilegeTypes.push('communication-pattern')
      confidenceScore += 0.15
    }
  }

  // Normalize confidence score
  confidenceScore = Math.min(confidenceScore, 1.0)

  return {
    containsPrivilegedContent: confidenceScore > 0.3,
    confidenceScore,
    detectedPrivilegeTypes: [...new Set(detectedPrivilegeTypes)]
  }
}

async function extractDocumentMetadata(
  fileContent: Uint8Array, 
  mimeType: string,
  ocrText?: string
): Promise<{
  pageCount?: number
  wordCount?: number
  language?: string
  keywords?: string[]
}> {
  const metadata: any = {}

  // Extract word count from OCR text
  if (ocrText) {
    metadata.wordCount = ocrText.split(/\s+/).length
    
    // Extract keywords (simple implementation)
    const words = ocrText.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 4)
    
    const wordFreq: { [key: string]: number } = {}
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1
    })
    
    metadata.keywords = Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word)
  }

  // Detect language (simple implementation)
  if (ocrText) {
    const englishWords = ['the', 'and', 'of', 'to', 'a', 'in', 'is', 'it', 'you', 'that']
    const spanishWords = ['el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'es', 'se']
    
    const lowerText = ocrText.toLowerCase()
    const englishCount = englishWords.filter(word => lowerText.includes(word)).length
    const spanishCount = spanishWords.filter(word => lowerText.includes(word)).length
    
    metadata.language = englishCount > spanishCount ? 'en' : 'es'
  }

  // For PDF files, estimate page count based on file size (rough estimate)
  if (mimeType === 'application/pdf') {
    // Very rough estimate: 50KB per page
    metadata.pageCount = Math.max(1, Math.round(fileContent.length / (50 * 1024)))
  }

  return metadata
}

async function generateDocumentPreview(
  documentId: string,
  fileContent: Uint8Array,
  mimeType: string
): Promise<string> {
  // In production, generate thumbnail/preview images
  // For demo purposes, return a placeholder URL
  return `https://placeholder.com/600x800/cccccc/666666?text=Document+Preview+${documentId}`
}