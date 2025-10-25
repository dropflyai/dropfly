// LegalFlow Pro - Electronic Signature Validation Edge Function
// Handles signature creation, validation, and legal compliance
// Created: 2025-08-17

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SignatureRequest {
  action: 'create_request' | 'sign_document' | 'validate_signature' | 'get_status'
  requestId?: string
  documentId: string
  signers: Array<{
    email: string
    name: string
    role?: string
    signatureType: 'electronic' | 'digital' | 'witness'
    isRequired: boolean
    position?: {
      page: number
      x: number
      y: number
    }
  }>
  metadata?: {
    title: string
    message?: string
    expiresIn?: number // hours
    redirectUrl?: string
  }
  signature?: {
    signerEmail: string
    signatureData: string
    ipAddress: string
    userAgent: string
    timestamp: string
  }
}

interface SignatureResponse {
  success: boolean
  error?: string
  data?: {
    requestId?: string
    signatureRequirementId?: string
    status?: string
    signedUrl?: string
    validationResult?: {
      isValid: boolean
      signedAt: string
      signerInfo: any
      certificateChain?: any[]
      tamperEvidence: boolean
    }
    completionStatus?: {
      totalSigners: number
      completedSigners: number
      pendingSigners: Array<{
        email: string
        name: string
        status: string
      }>
    }
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
      .select('law_firm_id, role, first_name, last_name')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      throw new Error('User not found')
    }

    const request: SignatureRequest = await req.json()

    // Route to appropriate handler based on action
    switch (request.action) {
      case 'create_request':
        return await handleCreateSignatureRequest(supabaseClient, userData, request)
      
      case 'sign_document':
        return await handleSignDocument(supabaseClient, userData, request)
      
      case 'validate_signature':
        return await handleValidateSignature(supabaseClient, userData, request)
      
      case 'get_status':
        return await handleGetStatus(supabaseClient, userData, request)
      
      default:
        throw new Error('Invalid action specified')
    }

  } catch (error) {
    console.error('Signature processing error:', error)
    
    const response: SignatureResponse = {
      success: false,
      error: error.message
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

async function handleCreateSignatureRequest(
  supabaseClient: any,
  userData: any,
  request: SignatureRequest
): Promise<Response> {
  // Verify document exists and user has access
  const { data: documentData, error: docError } = await supabaseClient
    .from('documents')
    .select('*')
    .eq('id', request.documentId)
    .eq('law_firm_id', userData.law_firm_id)
    .single()

  if (docError || !documentData) {
    throw new Error('Document not found or access denied')
  }

  // Create signature request
  const requestId = crypto.randomUUID()
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + (request.metadata?.expiresIn || 72))

  const { data: signatureRequestData, error: requestError } = await supabaseClient
    .from('signature_requests')
    .insert({
      id: requestId,
      law_firm_id: userData.law_firm_id,
      document_id: request.documentId,
      case_id: documentData.case_id,
      client_id: documentData.client_id,
      title: request.metadata?.title || `Signature Request for ${documentData.title}`,
      message: request.metadata?.message,
      status: 'pending',
      expires_at: expiresAt.toISOString(),
      completion_redirect_url: request.metadata?.redirectUrl,
      created_by: userData.id
    })
    .select()
    .single()

  if (requestError) {
    throw new Error(`Failed to create signature request: ${requestError.message}`)
  }

  // Create signature requirements for each signer
  const requirementPromises = request.signers.map(async (signer, index) => {
    return await supabaseClient
      .from('signature_requirements')
      .insert({
        law_firm_id: userData.law_firm_id,
        signature_request_id: requestId,
        signer_email: signer.email,
        signer_name: signer.name,
        signer_role: signer.role,
        signature_type: signer.signatureType,
        page_number: signer.position?.page,
        x_position: signer.position?.x,
        y_position: signer.position?.y,
        is_required: signer.isRequired
      })
  })

  await Promise.all(requirementPromises)

  // Generate secure signing URLs for each signer
  const signingUrls = await generateSigningUrls(requestId, request.signers)

  // Send signature request emails (in production, integrate with email service)
  await sendSignatureRequestEmails(request.signers, signingUrls, {
    title: request.metadata?.title || documentData.title,
    message: request.metadata?.message,
    requester: `${userData.first_name} ${userData.last_name}`
  })

  // Log the activity
  await supabaseClient
    .from('audit_log')
    .insert({
      law_firm_id: userData.law_firm_id,
      user_id: userData.id,
      entity_type: 'signature_requests',
      entity_id: requestId,
      action: 'create',
      new_values: { signers: request.signers.map(s => s.email) }
    })

  const response: SignatureResponse = {
    success: true,
    data: {
      requestId,
      status: 'pending'
    }
  }

  return new Response(
    JSON.stringify(response),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  )
}

async function handleSignDocument(
  supabaseClient: any,
  userData: any,
  request: SignatureRequest
): Promise<Response> {
  if (!request.signature || !request.requestId) {
    throw new Error('Missing signature data or request ID')
  }

  // Find the signature requirement
  const { data: requirement, error: reqError } = await supabaseClient
    .from('signature_requirements')
    .select('*, signature_requests(*)')
    .eq('signature_request_id', request.requestId)
    .eq('signer_email', request.signature.signerEmail)
    .single()

  if (reqError || !requirement) {
    throw new Error('Signature requirement not found')
  }

  // Verify signature request is still valid
  if (requirement.signature_requests.status !== 'pending') {
    throw new Error('Signature request is no longer active')
  }

  if (new Date(requirement.signature_requests.expires_at) < new Date()) {
    throw new Error('Signature request has expired')
  }

  // Validate signature data and create digital certificate
  const signatureValidation = await validateAndCertifySignature(
    request.signature.signatureData,
    {
      signerEmail: request.signature.signerEmail,
      documentId: request.documentId,
      requestId: request.requestId,
      timestamp: request.signature.timestamp,
      ipAddress: request.signature.ipAddress,
      userAgent: request.signature.userAgent
    }
  )

  if (!signatureValidation.isValid) {
    throw new Error('Invalid signature data')
  }

  // Update signature requirement with signature data
  const { error: updateError } = await supabaseClient
    .from('signature_requirements')
    .update({
      signed_at: new Date().toISOString(),
      signature_data: {
        signatureData: request.signature.signatureData,
        timestamp: request.signature.timestamp,
        ipAddress: request.signature.ipAddress,
        userAgent: request.signature.userAgent,
        certificate: signatureValidation.certificate,
        validationHash: signatureValidation.hash
      },
      ip_address: request.signature.ipAddress
    })
    .eq('id', requirement.id)

  if (updateError) {
    throw new Error(`Failed to record signature: ${updateError.message}`)
  }

  // Check if all required signatures are complete
  const { data: allRequirements, error: allReqError } = await supabaseClient
    .from('signature_requirements')
    .select('*')
    .eq('signature_request_id', request.requestId)

  if (allReqError) {
    throw new Error('Failed to check completion status')
  }

  const requiredSignatures = allRequirements.filter(req => req.is_required)
  const completedRequired = requiredSignatures.filter(req => req.signed_at)

  let requestStatus = 'in_progress'
  if (completedRequired.length === requiredSignatures.length) {
    requestStatus = 'completed'
    
    // Update signature request status
    await supabaseClient
      .from('signature_requests')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', request.requestId)

    // Generate final signed document
    await generateFinalSignedDocument(request.requestId, request.documentId)
  }

  // Log the signature
  await supabaseClient
    .from('audit_log')
    .insert({
      law_firm_id: userData.law_firm_id,
      entity_type: 'signature_requirements',
      entity_id: requirement.id,
      action: 'sign',
      new_values: {
        signerEmail: request.signature.signerEmail,
        signedAt: new Date().toISOString()
      }
    })

  const response: SignatureResponse = {
    success: true,
    data: {
      signatureRequirementId: requirement.id,
      status: requestStatus
    }
  }

  return new Response(
    JSON.stringify(response),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  )
}

async function handleValidateSignature(
  supabaseClient: any,
  userData: any,
  request: SignatureRequest
): Promise<Response> {
  // Get signature requirement data
  const { data: requirement, error: reqError } = await supabaseClient
    .from('signature_requirements')
    .select('*, signature_requests(*)')
    .eq('id', request.requestId)
    .single()

  if (reqError || !requirement) {
    throw new Error('Signature not found')
  }

  if (!requirement.signature_data) {
    throw new Error('No signature data to validate')
  }

  // Perform signature validation
  const validationResult = await performSignatureValidation(
    requirement.signature_data,
    requirement.signature_requests.document_id
  )

  const response: SignatureResponse = {
    success: true,
    data: {
      validationResult
    }
  }

  return new Response(
    JSON.stringify(response),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  )
}

async function handleGetStatus(
  supabaseClient: any,
  userData: any,
  request: SignatureRequest
): Promise<Response> {
  // Get signature request and all requirements
  const { data: signatureRequest, error: reqError } = await supabaseClient
    .from('signature_requests')
    .select(`
      *,
      signature_requirements (*)
    `)
    .eq('id', request.requestId)
    .eq('law_firm_id', userData.law_firm_id)
    .single()

  if (reqError || !signatureRequest) {
    throw new Error('Signature request not found')
  }

  const completionStatus = {
    totalSigners: signatureRequest.signature_requirements.length,
    completedSigners: signatureRequest.signature_requirements.filter(req => req.signed_at).length,
    pendingSigners: signatureRequest.signature_requirements
      .filter(req => !req.signed_at)
      .map(req => ({
        email: req.signer_email,
        name: req.signer_name,
        status: 'pending'
      }))
  }

  const response: SignatureResponse = {
    success: true,
    data: {
      requestId: request.requestId,
      status: signatureRequest.status,
      completionStatus
    }
  }

  return new Response(
    JSON.stringify(response),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  )
}

// Helper Functions

async function generateSigningUrls(requestId: string, signers: any[]): Promise<string[]> {
  // In production, generate secure, time-limited URLs
  // For demo purposes, return simulated URLs
  return signers.map((signer, index) => 
    `https://signatures.legalflow.com/sign/${requestId}?signer=${encodeURIComponent(signer.email)}&token=${crypto.randomUUID()}`
  )
}

async function sendSignatureRequestEmails(
  signers: any[],
  signingUrls: string[],
  context: { title: string; message?: string; requester: string }
): Promise<void> {
  // In production, integrate with email service (SendGrid, AWS SES, etc.)
  console.log('Sending signature request emails:', {
    signers: signers.map(s => s.email),
    context
  })
  
  // Simulate email sending
  for (let i = 0; i < signers.length; i++) {
    console.log(`Email sent to ${signers[i].email}: ${signingUrls[i]}`)
  }
}

async function validateAndCertifySignature(
  signatureData: string,
  context: {
    signerEmail: string
    documentId: string
    requestId: string
    timestamp: string
    ipAddress: string
    userAgent: string
  }
): Promise<{
  isValid: boolean
  certificate: any
  hash: string
}> {
  // In production, implement proper digital signature validation
  // This would involve PKI, certificate authorities, etc.
  
  // Create validation hash
  const dataToHash = JSON.stringify({
    signature: signatureData,
    ...context
  })
  
  const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(dataToHash))
  const hash = Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  // Generate mock certificate
  const certificate = {
    version: "1.0",
    serialNumber: crypto.randomUUID(),
    issuer: "LegalFlow Pro CA",
    subject: context.signerEmail,
    validFrom: new Date().toISOString(),
    validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    publicKey: "mock-public-key",
    algorithm: "SHA256withRSA",
    fingerprint: hash.substring(0, 40)
  }

  return {
    isValid: true,
    certificate,
    hash
  }
}

async function performSignatureValidation(
  signatureData: any,
  documentId: string
): Promise<{
  isValid: boolean
  signedAt: string
  signerInfo: any
  certificateChain?: any[]
  tamperEvidence: boolean
}> {
  // In production, perform comprehensive signature validation
  // including certificate chain validation, timestamp verification, etc.
  
  return {
    isValid: true,
    signedAt: signatureData.timestamp,
    signerInfo: {
      email: signatureData.certificate?.subject,
      ipAddress: signatureData.ipAddress,
      userAgent: signatureData.userAgent
    },
    certificateChain: [signatureData.certificate],
    tamperEvidence: false
  }
}

async function generateFinalSignedDocument(
  requestId: string,
  documentId: string
): Promise<void> {
  // In production, generate the final signed PDF with all signatures embedded
  console.log(`Generating final signed document for request ${requestId}, document ${documentId}`)
  
  // This would involve:
  // 1. Loading the original document
  // 2. Embedding all signature images/data
  // 3. Adding signature certificates
  // 4. Creating a tamper-evident final document
  // 5. Storing the signed version
}