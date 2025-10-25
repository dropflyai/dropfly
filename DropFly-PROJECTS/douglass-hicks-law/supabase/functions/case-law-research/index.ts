// LegalFlow Pro - Case Law Research Edge Function
// Automated legal research with AI-powered case law analysis
// Created: 2025-08-17

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ResearchRequest {
  action: 'search' | 'analyze' | 'generate_brief' | 'find_precedents'
  query: {
    researchQuestion: string
    jurisdiction?: string
    practiceArea?: string
    caseId?: string
    dateRange?: {
      start: string
      end: string
    }
    courtLevel?: 'supreme' | 'appellate' | 'trial' | 'all'
    relevanceThreshold?: number
  }
  options: {
    maxResults?: number
    includeStatutes?: boolean
    includeRegulations?: boolean
    generateSummary?: boolean
    exportFormat?: 'json' | 'pdf' | 'docx'
  }
}

interface ResearchResponse {
  success: boolean
  error?: string
  data?: {
    researchId?: string
    results?: CaseLawResult[]
    summary?: string
    totalResults?: number
    searchTime?: number
    recommendations?: string[]
    briefGenerated?: boolean
    briefUrl?: string
  }
}

interface CaseLawResult {
  id: string
  citation: string
  caseName: string
  court: string
  decisionDate: string
  jurisdiction: string
  legalIssue: string
  holding: string
  relevanceScore: number
  keyQuotes: string[]
  distinguishingFactors?: string[]
  supportingEvidence?: string[]
  headnotes?: string[]
  courtLevel: string
  judgeNames?: string[]
  caseHistory?: string
  treatmentByOtherCases?: Array<{
    citingCase: string
    treatment: 'followed' | 'distinguished' | 'overruled' | 'criticized'
  }>
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

    // Get user's law firm and role
    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .select('law_firm_id, role, first_name, last_name')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      throw new Error('User not found')
    }

    // Verify user has research permissions
    const allowedRoles = ['firm_admin', 'partner', 'senior_associate', 'associate', 'paralegal']
    if (!allowedRoles.includes(userData.role)) {
      throw new Error('Insufficient permissions for legal research')
    }

    const request: ResearchRequest = await req.json()
    const startTime = Date.now()

    // Route to appropriate handler
    switch (request.action) {
      case 'search':
        return await handleCaseLawSearch(supabaseClient, userData, request, startTime)
      
      case 'analyze':
        return await handleCaseAnalysis(supabaseClient, userData, request, startTime)
      
      case 'generate_brief':
        return await handleBriefGeneration(supabaseClient, userData, request, startTime)
      
      case 'find_precedents':
        return await handlePrecedentSearch(supabaseClient, userData, request, startTime)
      
      default:
        throw new Error('Invalid research action specified')
    }

  } catch (error) {
    console.error('Legal research error:', error)
    
    const response: ResearchResponse = {
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

async function handleCaseLawSearch(
  supabaseClient: any,
  userData: any,
  request: ResearchRequest,
  startTime: number
): Promise<Response> {
  // Create research record
  const researchId = crypto.randomUUID()
  
  const { data: researchData, error: researchError } = await supabaseClient
    .from('legal_research')
    .insert({
      id: researchId,
      law_firm_id: userData.law_firm_id,
      case_id: request.query.caseId || null,
      title: `Case Law Search: ${request.query.researchQuestion.substring(0, 100)}`,
      research_question: request.query.researchQuestion,
      jurisdiction: request.query.jurisdiction,
      practice_area: request.query.practiceArea,
      status: 'in_progress',
      researcher_id: userData.id
    })
    .select()
    .single()

  if (researchError) {
    throw new Error(`Failed to create research record: ${researchError.message}`)
  }

  // Perform case law search
  const searchResults = await performCaseLawSearch(request.query)
  
  // Store citations in database
  const citationPromises = searchResults.map(async (result) => {
    return await supabaseClient
      .from('case_law_citations')
      .insert({
        law_firm_id: userData.law_firm_id,
        research_id: researchId,
        case_id: request.query.caseId || null,
        citation: result.citation,
        case_name: result.caseName,
        court: result.court,
        decision_date: result.decisionDate,
        jurisdiction: result.jurisdiction,
        legal_issue: result.legalIssue,
        holding: result.holding,
        relevance_score: result.relevanceScore,
        notes: JSON.stringify({
          keyQuotes: result.keyQuotes,
          distinguishingFactors: result.distinguishingFactors,
          courtLevel: result.courtLevel
        }),
        created_by: userData.id
      })
  })

  await Promise.all(citationPromises)

  // Generate research summary if requested
  let summary = ''
  if (request.options.generateSummary) {
    summary = await generateResearchSummary(searchResults, request.query.researchQuestion)
  }

  // Update research record with results
  await supabaseClient
    .from('legal_research')
    .update({
      status: 'completed',
      summary: summary,
      hours_spent: (Date.now() - startTime) / (1000 * 60 * 60) // Convert to hours
    })
    .eq('id', researchId)

  // Log the research activity
  await supabaseClient
    .from('audit_log')
    .insert({
      law_firm_id: userData.law_firm_id,
      user_id: userData.id,
      entity_type: 'legal_research',
      entity_id: researchId,
      action: 'create',
      new_values: {
        researchQuestion: request.query.researchQuestion,
        resultsCount: searchResults.length
      }
    })

  const response: ResearchResponse = {
    success: true,
    data: {
      researchId,
      results: searchResults,
      summary,
      totalResults: searchResults.length,
      searchTime: Date.now() - startTime,
      recommendations: generateResearchRecommendations(searchResults)
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

async function handleCaseAnalysis(
  supabaseClient: any,
  userData: any,
  request: ResearchRequest,
  startTime: number
): Promise<Response> {
  // Get existing research or create new one
  const researchId = crypto.randomUUID()
  
  // Perform deep case analysis
  const analysisResults = await performCaseAnalysis(request.query)
  
  // Generate comparative analysis between cases
  const comparativeAnalysis = await generateComparativeAnalysis(analysisResults)
  
  const response: ResearchResponse = {
    success: true,
    data: {
      researchId,
      results: analysisResults,
      summary: comparativeAnalysis,
      totalResults: analysisResults.length,
      searchTime: Date.now() - startTime,
      recommendations: [
        "Review distinguishing factors carefully",
        "Consider jurisdiction-specific precedents",
        "Analyze recent developments in this area of law"
      ]
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

async function handleBriefGeneration(
  supabaseClient: any,
  userData: any,
  request: ResearchRequest,
  startTime: number
): Promise<Response> {
  // Search for relevant cases
  const searchResults = await performCaseLawSearch(request.query)
  
  // Generate legal brief
  const briefContent = await generateLegalBrief(
    request.query.researchQuestion,
    searchResults,
    {
      jurisdiction: request.query.jurisdiction,
      practiceArea: request.query.practiceArea,
      caseId: request.query.caseId
    }
  )

  // Save brief as document
  const briefDocumentId = await saveBriefAsDocument(
    supabaseClient,
    userData,
    briefContent,
    request.query
  )

  const response: ResearchResponse = {
    success: true,
    data: {
      researchId: crypto.randomUUID(),
      briefGenerated: true,
      briefUrl: `/documents/${briefDocumentId}`,
      summary: briefContent.summary,
      totalResults: searchResults.length,
      searchTime: Date.now() - startTime
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

async function handlePrecedentSearch(
  supabaseClient: any,
  userData: any,
  request: ResearchRequest,
  startTime: number
): Promise<Response> {
  // Find similar cases and precedents
  const precedents = await findSimilarPrecedents(request.query)
  
  // Analyze precedential value
  const precedentAnalysis = await analyzePrecedentialValue(precedents)

  const response: ResearchResponse = {
    success: true,
    data: {
      researchId: crypto.randomUUID(),
      results: precedents,
      summary: precedentAnalysis,
      totalResults: precedents.length,
      searchTime: Date.now() - startTime,
      recommendations: [
        "Focus on binding precedents from higher courts",
        "Consider persuasive authority from similar jurisdictions",
        "Analyze factual similarities and differences"
      ]
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

// Research Implementation Functions

async function performCaseLawSearch(query: any): Promise<CaseLawResult[]> {
  // In production, integrate with legal databases like Westlaw, LexisNexis, etc.
  // For demo purposes, return simulated case law results
  
  const mockCases: CaseLawResult[] = [
    {
      id: "case-001",
      citation: "Smith v. Jones, 123 F.3d 456 (9th Cir. 2020)",
      caseName: "Smith v. Jones",
      court: "United States Court of Appeals for the Ninth Circuit",
      decisionDate: "2020-03-15",
      jurisdiction: query.jurisdiction || "Federal",
      legalIssue: "Whether attorney-client privilege extends to communications with corporate officers",
      holding: "Attorney-client privilege protects communications between counsel and corporate officers when seeking legal advice in their official capacity.",
      relevanceScore: 9.2,
      keyQuotes: [
        "The privilege extends to all communications made for the purpose of securing legal advice.",
        "Corporate officers speaking in their official capacity are within the scope of privilege."
      ],
      distinguishingFactors: [
        "Corporate context vs. individual representation",
        "Official capacity vs. personal communications"
      ],
      supportingEvidence: [
        "Federal Rule of Evidence 501",
        "Restatement (Third) of Law Governing Lawyers § 73"
      ],
      headnotes: [
        "Attorney-Client Privilege - Corporate Communications",
        "Evidence - Privileged Communications"
      ],
      courtLevel: "appellate",
      judgeNames: ["Judge Anderson", "Judge Brown", "Judge Chen"],
      caseHistory: "Affirmed district court ruling on privilege claim",
      treatmentByOtherCases: [
        {
          citingCase: "Brown v. White, 456 F.3d 789 (9th Cir. 2021)",
          treatment: "followed"
        }
      ]
    },
    {
      id: "case-002",
      citation: "Johnson v. State, 789 A.2d 123 (State 2019)",
      caseName: "Johnson v. State",
      court: "State Supreme Court",
      decisionDate: "2019-11-22",
      jurisdiction: query.jurisdiction || "State",
      legalIssue: "Scope of work product protection in criminal defense",
      holding: "Work product doctrine protects trial preparation materials absent substantial need and undue hardship.",
      relevanceScore: 8.7,
      keyQuotes: [
        "The work product doctrine protects the mental processes of attorneys.",
        "Substantial need must be demonstrated to overcome work product protection."
      ],
      distinguishingFactors: [
        "Criminal vs. civil context",
        "Trial preparation vs. legal advice"
      ],
      supportingEvidence: [
        "Federal Rule of Civil Procedure 26(b)(3)",
        "Hickman v. Taylor, 329 U.S. 495 (1947)"
      ],
      headnotes: [
        "Work Product Doctrine - Scope",
        "Discovery - Protected Materials"
      ],
      courtLevel: "supreme",
      judgeNames: ["Chief Justice Williams", "Justice Davis", "Justice Miller"],
      caseHistory: "Reversed court of appeals decision",
      treatmentByOtherCases: []
    }
  ]

  // Filter based on query parameters
  let filteredCases = mockCases

  if (query.courtLevel && query.courtLevel !== 'all') {
    filteredCases = filteredCases.filter(case => case.courtLevel === query.courtLevel)
  }

  if (query.relevanceThreshold) {
    filteredCases = filteredCases.filter(case => case.relevanceScore >= query.relevanceThreshold)
  }

  // Sort by relevance score
  filteredCases.sort((a, b) => b.relevanceScore - a.relevanceScore)

  return filteredCases.slice(0, query.maxResults || 50)
}

async function performCaseAnalysis(query: any): Promise<CaseLawResult[]> {
  // Perform deeper analysis of specific cases
  const cases = await performCaseLawSearch(query)
  
  // Add detailed analysis to each case
  return cases.map(case => ({
    ...case,
    distinguishingFactors: [
      ...case.distinguishingFactors || [],
      "Factual pattern analysis",
      "Jurisdictional differences",
      "Temporal considerations"
    ],
    supportingEvidence: [
      ...case.supportingEvidence || [],
      "Secondary authority analysis",
      "Legislative history review"
    ]
  }))
}

async function findSimilarPrecedents(query: any): Promise<CaseLawResult[]> {
  // Find precedential cases with similar fact patterns
  const cases = await performCaseLawSearch(query)
  
  // Filter for precedential value
  return cases
    .filter(case => case.courtLevel === 'supreme' || case.courtLevel === 'appellate')
    .filter(case => case.relevanceScore > 8.0)
}

async function generateResearchSummary(results: CaseLawResult[], researchQuestion: string): Promise<string> {
  if (results.length === 0) {
    return "No relevant cases found for the research question."
  }

  const highRelevanceCases = results.filter(r => r.relevanceScore > 8.0)
  const jurisdictions = [...new Set(results.map(r => r.jurisdiction))]
  const courtLevels = [...new Set(results.map(r => r.courtLevel))]

  return `Research Summary for: "${researchQuestion}"

Found ${results.length} relevant cases, with ${highRelevanceCases.length} high-relevance matches.

Key Jurisdictions: ${jurisdictions.join(', ')}
Court Levels: ${courtLevels.join(', ')}

Top Cases:
${results.slice(0, 3).map(r => 
  `• ${r.citation} (Relevance: ${r.relevanceScore}/10)\n  ${r.holding}`
).join('\n\n')}

Recommendation: Focus on the highest-relevance cases and consider jurisdictional differences when applying precedents.`
}

async function generateComparativeAnalysis(results: CaseLawResult[]): Promise<string> {
  return `Comparative Case Analysis

The research identified ${results.length} relevant cases with varying approaches to the legal issue.

Common Holdings:
• Attorney-client privilege protects confidential communications
• Work product doctrine shields trial preparation materials
• Exceptions exist for crime-fraud and substantial need

Distinguishing Factors:
• Jurisdictional variations in privilege scope
• Corporate vs. individual client differences
• Criminal vs. civil case applications

Trend Analysis:
Recent cases show an expansion of privilege protections in corporate contexts while maintaining traditional crime-fraud exceptions.`
}

async function generateLegalBrief(
  researchQuestion: string,
  cases: CaseLawResult[],
  context: any
): Promise<{ content: string; summary: string }> {
  const briefContent = `LEGAL RESEARCH BRIEF

I. ISSUE
${researchQuestion}

II. BRIEF ANSWER
Based on the research, [brief conclusion based on strongest cases]

III. STATEMENT OF FACTS
[Relevant facts from the case context]

IV. LEGAL ANALYSIS

A. Controlling Authority
${cases.filter(c => c.courtLevel === 'supreme').map(c => 
  `${c.citation}: ${c.holding}`
).join('\n')}

B. Persuasive Authority
${cases.filter(c => c.courtLevel === 'appellate').map(c => 
  `${c.citation}: ${c.holding}`
).join('\n')}

C. Analysis
[Detailed legal analysis applying cases to facts]

V. CONCLUSION
[Summary and recommendations]

VI. CITATIONS
${cases.map(c => c.citation).join('\n')}
`

  return {
    content: briefContent,
    summary: `Legal brief generated analyzing ${cases.length} cases relevant to: ${researchQuestion}`
  }
}

async function analyzePrecedentialValue(precedents: CaseLawResult[]): Promise<string> {
  const binding = precedents.filter(p => p.courtLevel === 'supreme')
  const persuasive = precedents.filter(p => p.courtLevel === 'appellate')

  return `Precedential Value Analysis

Binding Precedents: ${binding.length}
${binding.map(p => `• ${p.citation} - ${p.holding.substring(0, 100)}...`).join('\n')}

Persuasive Authority: ${persuasive.length}
${persuasive.map(p => `• ${p.citation} - ${p.holding.substring(0, 100)}...`).join('\n')}

Strategic Recommendations:
1. Lead with binding precedents from highest court
2. Use persuasive authority to support arguments
3. Distinguish adverse precedents by factual differences
4. Consider recent trends in judicial interpretation`
}

function generateResearchRecommendations(results: CaseLawResult[]): string[] {
  const recommendations = [
    "Review all high-relevance cases thoroughly",
    "Consider jurisdictional variations in law",
    "Analyze factual similarities and differences"
  ]

  if (results.some(r => r.courtLevel === 'supreme')) {
    recommendations.push("Focus on Supreme Court precedents as binding authority")
  }

  if (results.some(r => new Date(r.decisionDate) > new Date('2020-01-01'))) {
    recommendations.push("Pay attention to recent developments in this area")
  }

  return recommendations
}

async function saveBriefAsDocument(
  supabaseClient: any,
  userData: any,
  briefContent: any,
  query: any
): Promise<string> {
  const documentId = crypto.randomUUID()
  
  const { data: documentData, error: docError } = await supabaseClient
    .from('documents')
    .insert({
      id: documentId,
      law_firm_id: userData.law_firm_id,
      case_id: query.caseId || null,
      title: `Legal Research Brief - ${query.researchQuestion.substring(0, 50)}`,
      description: briefContent.summary,
      file_name: `legal-brief-${Date.now()}.docx`,
      file_path: `briefs/${documentId}.docx`,
      document_type: 'Legal Brief',
      is_privileged: true,
      access_level: 'internal',
      created_by: userData.id,
      search_content: briefContent.content
    })
    .select()
    .single()

  if (docError) {
    throw new Error('Failed to save brief as document')
  }

  return documentId
}