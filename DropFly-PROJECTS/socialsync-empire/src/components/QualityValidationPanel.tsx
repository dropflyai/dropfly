'use client';

import { useState, useEffect } from 'react';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  TrendingUp,
  Zap,
  Target,
  Settings,
  RefreshCw
} from 'lucide-react';
import { QualityValidator, type ValidationResult, type VideoQualityMetrics } from '@/utils/qualityValidator';

interface QualityValidationPanelProps {
  videoMetrics?: VideoQualityMetrics;
  targetPlatforms?: string[];
  onValidationComplete?: (result: ValidationResult) => void;
  autoValidate?: boolean;
}

export default function QualityValidationPanel({
  videoMetrics,
  targetPlatforms = [],
  onValidationComplete,
  autoValidate = true
}: QualityValidationPanelProps) {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Perform validation
  const performValidation = async () => {
    if (!videoMetrics) return;

    setIsValidating(true);
    try {
      // Simulate validation delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800));

      const result = QualityValidator.validateVideo(
        videoMetrics,
        targetPlatforms
      );

      setValidationResult(result);
      onValidationComplete?.(result);
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setIsValidating(false);
    }
  };

  // Auto-validate when metrics change
  useEffect(() => {
    if (autoValidate && videoMetrics) {
      performValidation();
    }
  }, [videoMetrics, targetPlatforms, autoValidate]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 border-green-500/30';
    if (score >= 60) return 'bg-yellow-500/20 border-yellow-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  const getSeverityIcon = (severity: 'critical' | 'major' | 'minor') => {
    switch (severity) {
      case 'critical':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'major':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'minor':
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  if (!videoMetrics) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-4">
        <div className="flex items-center gap-2 text-gray-400">
          <Shield className="w-5 h-5" />
          <span>Quality validation requires video metrics</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-400" />
          <h3 className="font-medium text-gray-200">Quality Validation</h3>
        </div>

        <div className="flex items-center gap-2">
          {validationResult && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-gray-400 hover:text-gray-300 text-sm"
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
          )}
          <button
            onClick={performValidation}
            disabled={isValidating}
            className="text-blue-400 hover:text-blue-300 disabled:text-gray-500"
          >
            {isValidating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Validation in progress */}
      {isValidating && (
        <div className="text-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
          <p className="text-sm text-gray-400">Analyzing video quality...</p>
        </div>
      )}

      {/* Validation results */}
      {validationResult && !isValidating && (
        <div className="space-y-4">
          {/* Quality Score */}
          <div className={`rounded-lg p-4 border ${getScoreBackground(validationResult.score)}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-gray-300" />
                <span className="font-medium text-gray-200">Quality Score</span>
              </div>
              <div className={`text-2xl font-bold ${getScoreColor(validationResult.score)}`}>
                {validationResult.score}/100
              </div>
            </div>

            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  validationResult.score >= 80 ? 'bg-green-500' :
                  validationResult.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${validationResult.score}%` }}
              ></div>
            </div>

            <div className="text-sm text-gray-300 mt-2">
              {validationResult.isValid ? (
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  Ready for export
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-400">
                  <XCircle className="w-4 h-4" />
                  Issues need to be resolved
                </div>
              )}
            </div>
          </div>

          {/* Quick Summary */}
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="bg-gray-700/50 rounded p-3 text-center">
              <div className="text-red-400 font-medium">{validationResult.issues.length}</div>
              <div className="text-gray-400">Issues</div>
            </div>
            <div className="bg-gray-700/50 rounded p-3 text-center">
              <div className="text-yellow-400 font-medium">{validationResult.warnings.length}</div>
              <div className="text-gray-400">Warnings</div>
            </div>
            <div className="bg-gray-700/50 rounded p-3 text-center">
              <div className="text-green-400 font-medium">{validationResult.recommendations.length}</div>
              <div className="text-gray-400">Tips</div>
            </div>
          </div>

          {/* Platform Compliance */}
          {validationResult.platformCompliance.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Platform Compliance
              </h4>
              {validationResult.platformCompliance.map((compliance, i) => (
                <div key={i} className="bg-gray-700/50 rounded p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-200">{compliance.platform}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${compliance.isCompliant ? 'text-green-400' : 'text-red-400'}`}>
                        {compliance.compliance}%
                      </span>
                      {compliance.isCompliant ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                  </div>
                  {compliance.violations.length > 0 && (
                    <div className="text-xs text-red-300 mt-1">
                      {compliance.violations.slice(0, 2).map((violation, j) => (
                        <div key={j}>• {violation}</div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Detailed Issues and Warnings */}
          {showDetails && (
            <div className="space-y-4">
              {/* Issues */}
              {validationResult.issues.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    Issues ({validationResult.issues.length})
                  </h4>
                  <div className="space-y-2">
                    {validationResult.issues.map((issue, i) => (
                      <div key={i} className="bg-red-500/10 border border-red-500/30 rounded p-3">
                        <div className="flex items-start gap-2">
                          {getSeverityIcon(issue.severity)}
                          <div className="flex-1">
                            <div className="text-sm text-red-200">{issue.message}</div>
                            {issue.fix && (
                              <div className="text-xs text-red-300 mt-1">
                                💡 {issue.fix}
                              </div>
                            )}
                            {issue.autoFixable && (
                              <div className="mt-2">
                                <button className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 px-2 py-1 rounded transition-colors">
                                  <Zap className="w-3 h-3 inline mr-1" />
                                  Auto-fix
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {validationResult.warnings.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4 text-yellow-400" />
                    Warnings ({validationResult.warnings.length})
                  </h4>
                  <div className="space-y-2">
                    {validationResult.warnings.slice(0, 3).map((warning, i) => (
                      <div key={i} className="bg-yellow-500/10 border border-yellow-500/30 rounded p-3">
                        <div className="text-sm text-yellow-200">{warning.message}</div>
                        {warning.suggestion && (
                          <div className="text-xs text-yellow-300 mt-1">
                            💡 {warning.suggestion}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {validationResult.recommendations.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-blue-400" />
                    Recommendations
                  </h4>
                  <div className="space-y-1">
                    {validationResult.recommendations.slice(0, 4).map((rec, i) => (
                      <div key={i} className="text-xs text-blue-200 bg-blue-500/10 rounded px-2 py-1">
                        {rec}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Export Status */}
          <div className={`rounded-lg p-3 border ${
            validationResult.isValid
              ? 'bg-green-500/10 border-green-500/30'
              : 'bg-red-500/10 border-red-500/30'
          }`}>
            <div className="flex items-center gap-2 text-sm">
              {validationResult.isValid ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-green-200">Video is ready for export</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-red-400" />
                  <span className="text-red-200">
                    {validationResult.issues.filter(i => i.severity === 'critical').length} critical issue(s) must be resolved
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}