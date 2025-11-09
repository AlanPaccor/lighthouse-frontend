// src/components/HallucinationWarning.tsx
import type { Trace, HallucinationResult } from '../types/Trace';

interface HallucinationWarningProps {
  trace: Trace;
}

export default function HallucinationWarning({ trace }: HallucinationWarningProps) {
  if (!trace.hallucinationData) {
    return null;
  }

  let hallucinationResult: HallucinationResult;
  try {
    hallucinationResult = typeof trace.hallucinationData === 'string' 
      ? JSON.parse(trace.hallucinationData)
      : trace.hallucinationData;
  } catch (e) {
    console.error('Failed to parse hallucination data:', e);
    return null;
  }

  const confidence = trace.confidenceScore || hallucinationResult.confidenceScore || 100;
  
  const getConfidenceStatus = (score: number) => {
    if (score >= 75) return { level: 'supported', label: 'Supported' };
    if (score >= 50) return { level: 'warning', label: 'Warning' };
    return { level: 'hallucination', label: 'Hallucination Detected' };
  };

  const status = getConfidenceStatus(confidence);
  const isSupported = status.level === 'supported';
  const isWarning = status.level === 'warning';

  // Supported (75-100%)
  if (isSupported) {
    return (
      <div className="mt-3 border border-foreground/20 p-4 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-foreground text-lg">✓</span>
          <div className="flex-1">
            <div className="text-sm font-medium text-foreground">
              Supported - High Confidence ({confidence.toFixed(0)}%)
            </div>
            <div className="text-xs text-foreground/60 mt-1 font-light">
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
      <div className="mt-3 border border-foreground/20 p-4 space-y-3">
        <div className="flex items-start gap-2">
          <span className="text-foreground text-xl">⚠</span>
          <div className="flex-1">
            <div className="text-sm font-medium text-foreground mb-1">
              Moderate Confidence Warning ({confidence.toFixed(0)}%)
            </div>
            <div className="text-xs text-foreground/60 mb-2 font-light">
              Some claims may need verification
            </div>
          </div>
        </div>

        {hallucinationResult.unsupportedClaims && hallucinationResult.unsupportedClaims.length > 0 && (
          <div className="mb-3">
            <div className="text-xs font-medium text-foreground/80 mb-2 uppercase tracking-wider">
              Claims Requiring Verification ({hallucinationResult.unsupportedClaims.length})
            </div>
            <ul className="list-disc list-inside space-y-1 text-xs text-foreground/70 font-light">
              {hallucinationResult.unsupportedClaims.slice(0, 3).map((claim, i) => (
                <li key={i} className="truncate">{claim}</li>
              ))}
            </ul>
          </div>
        )}

        {hallucinationResult.aiReview && (
          <div className="mt-3 pt-3 border-t border-foreground/10">
            <div className="text-xs font-medium text-foreground/80 mb-1 uppercase tracking-wider">AI Review</div>
            <div className="text-xs text-foreground/70 leading-relaxed font-light">
              {hallucinationResult.aiReview}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Hallucination (0-50%)
  return (
    <div className="mt-3 border border-foreground/20 p-4 space-y-3">
      <div className="flex items-start gap-2">
        <span className="text-foreground text-xl">⚠️</span>
        <div className="flex-1">
          <div className="text-sm font-medium text-foreground mb-1">
            Hallucination Detected ({confidence.toFixed(0)}% Confidence)
          </div>
          <div className="text-xs text-foreground/60 font-light">
            Low confidence - claims are not well-supported
          </div>
        </div>
      </div>

      {hallucinationResult.unsupportedClaims && hallucinationResult.unsupportedClaims.length > 0 && (
        <div className="mb-3">
          <div className="text-xs font-medium text-foreground/80 mb-2 uppercase tracking-wider">
            Unsupported Claims ({hallucinationResult.unsupportedClaims.length})
          </div>
          <ul className="list-disc list-inside space-y-1 text-xs text-foreground/70 font-light">
            {hallucinationResult.unsupportedClaims.slice(0, 5).map((claim, i) => (
              <li key={i} className="truncate">{claim}</li>
            ))}
          </ul>
        </div>
      )}

      {hallucinationResult.aiReview && (
        <div className="mt-3 pt-3 border-t border-foreground/10">
          <div className="text-xs font-medium text-foreground/80 mb-1 uppercase tracking-wider">AI Review</div>
          <div className="text-xs text-foreground/70 leading-relaxed font-light">
            {hallucinationResult.aiReview}
          </div>
        </div>
      )}
    </div>
  );
}
