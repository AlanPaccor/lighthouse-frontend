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
  const hasIssues = hallucinationResult.hasHallucinations || confidence < 80;

  if (!hasIssues) {
    return (
      <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-green-400">✓</span>
          <span className="text-sm text-green-300 font-medium">
            High Confidence ({confidence.toFixed(0)}%) - All claims supported
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
      <div className="flex items-start gap-2 mb-3">
        <span className="text-red-400 text-xl">⚠️</span>
        <div className="flex-1">
          <div className="text-sm font-semibold text-red-300 mb-1">
            Potential Hallucinations Detected
          </div>
          <div className="text-xs text-red-400">
            Confidence Score: {confidence.toFixed(0)}%
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