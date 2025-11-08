// src/components/HallucinationWarning.tsx
import type { Trace, HallucinationResult } from '../types/Trace';

interface HallucinationWarningProps {
  trace: Trace;
}

export default function HallucinationWarning({ trace }: HallucinationWarningProps) {
  // Check if we have hallucination data
  if (!trace.hallucinationData) {
    return null;
  }

  let hallucinationResult: HallucinationResult;
  try {
    // Parse the JSON string
    hallucinationResult = typeof trace.hallucinationData === 'string' 
      ? JSON.parse(trace.hallucinationData)
      : trace.hallucinationData;
  } catch (e) {
    console.error('Failed to parse hallucination data:', e);
    return null;
  }

  const confidence = trace.confidenceScore || hallucinationResult.confidenceScore || 100;
  
  // New confidence-based thresholds:
  // 0-50%: Hallucination (red)
  // 50-75%: Warning (yellow/orange)
  // 75-100%: Supported (green)
  const getConfidenceStatus = (score: number) => {
    if (score >= 75) return { level: 'supported', color: 'green', icon: '✓', label: 'Supported' };
    if (score >= 50) return { level: 'warning', color: 'yellow', icon: '⚠', label: 'Warning' };
    return { level: 'hallucination', color: 'red', icon: '⚠️', label: 'Hallucination Detected' };
  };

  const status = getConfidenceStatus(confidence);
  const isSupported = status.level === 'supported';
  const isWarning = status.level === 'warning';

  // Supported (75-100%)
  if (isSupported) {
    return (
      <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-green-400 text-lg">✓</span>
          <div className="flex-1">
            <div className="text-sm font-semibold text-green-300">
              Supported - High Confidence ({confidence.toFixed(0)}%)
            </div>
            <div className="text-xs text-green-400 mt-1">
              All claims are well-supported by the database
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Warning (50-75%)
  if (isWarning) {
    return (
      <div className="mt-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
        <div className="flex items-start gap-2 mb-3">
          <span className="text-yellow-400 text-xl">⚠</span>
          <div className="flex-1">
            <div className="text-sm font-semibold text-yellow-300 mb-1">
              Moderate Confidence Warning ({confidence.toFixed(0)}%)
            </div>
            <div className="text-xs text-yellow-400 mb-2">
              Some claims may need verification
            </div>
          </div>
        </div>

        {hallucinationResult.unsupportedClaims && hallucinationResult.unsupportedClaims.length > 0 && (
          <div className="mb-3">
            <div className="text-xs font-medium text-yellow-300 mb-2">
              Claims Requiring Verification ({hallucinationResult.unsupportedClaims.length}):
            </div>
            <ul className="list-disc list-inside space-y-1 text-xs text-yellow-200">
              {hallucinationResult.unsupportedClaims.slice(0, 3).map((claim, i) => (
                <li key={i} className="truncate">{claim}</li>
              ))}
            </ul>
          </div>
        )}

        {hallucinationResult.aiReview && (
          <div className="mt-3 pt-3 border-t border-yellow-500/20">
            <div className="text-xs font-medium text-yellow-300 mb-1">AI Review:</div>
            <div className="text-xs text-yellow-200 leading-relaxed">
              {hallucinationResult.aiReview}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Hallucination (0-50%)
  return (
    <div className="mt-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
      <div className="flex items-start gap-2 mb-3">
        <span className="text-red-400 text-xl">⚠️</span>
        <div className="flex-1">
          <div className="text-sm font-semibold text-red-300 mb-1">
            Hallucination Detected ({confidence.toFixed(0)}% Confidence)
          </div>
          <div className="text-xs text-red-400">
            Low confidence - claims are not well-supported
          </div>
        </div>
      </div>

      {hallucinationResult.unsupportedClaims && hallucinationResult.unsupportedClaims.length > 0 && (
        <div className="mb-3">
          <div className="text-xs font-medium text-red-300 mb-2">
            Unsupported Claims ({hallucinationResult.unsupportedClaims.length}):
          </div>
          <ul className="list-disc list-inside space-y-1 text-xs text-red-200">
            {hallucinationResult.unsupportedClaims.slice(0, 5).map((claim, i) => (
              <li key={i} className="truncate">{claim}</li>
            ))}
          </ul>
        </div>
      )}

      {hallucinationResult.aiReview && (
        <div className="mt-3 pt-3 border-t border-red-500/20">
          <div className="text-xs font-medium text-red-300 mb-1">AI Review:</div>
          <div className="text-xs text-red-200 leading-relaxed">
            {hallucinationResult.aiReview}
          </div>
        </div>
      )}
    </div>
  );
}