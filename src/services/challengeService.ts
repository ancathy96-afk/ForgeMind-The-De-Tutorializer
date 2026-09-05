import { Concept, GeneratedChallenge, DifficultyLevel, ChallengeSourceType } from '../types';
import { validateGeneratedChallenge } from '../utils/challengeValidator';
import { getCuratedNovelChallenge } from '../data/curatedNovelChallenges';

export interface GenerateChallengeResult {
  success: boolean;
  challenge?: GeneratedChallenge;
  error?: string;
  source?: 'gemini' | 'curated-baseline' | 'curated-fallback' | 'curated-recovery' | 'client-fallback';
}

export async function generateNovelChallenge(
  concept: Concept,
  difficulty?: DifficultyLevel | string,
  sourceType: ChallengeSourceType = 'LIBRARY'
): Promise<GenerateChallengeResult> {
  // CRITICAL MANDATE: Content Library challenges are pre-authored.
  // DO NOT call Gemini to generate these challenges at runtime.
  // The learner selecting a library concept should immediately receive the stored challenge.
  const isLibrary = sourceType === 'LIBRARY' || concept.sourceType !== 'USER_GENERATED';
  const preAuthored = concept.challenge || getCuratedNovelChallenge(concept.id);

  if (isLibrary && preAuthored) {
    return {
      success: true,
      challenge: { ...preAuthored, sourceType: 'LIBRARY' },
      source: 'curated-baseline'
    };
  }

  try {
    const response = await fetch('/api/generate-challenge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        concept,
        difficulty: difficulty || concept.approximateDifficulty || 'Applied',
        sourceType
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || `Server responded with status ${response.status}`;

      // Check if we have a curated backup before declaring failure
      const curated = getCuratedNovelChallenge(concept.id);
      if (curated) {
        return {
          success: true,
          challenge: { ...curated, sourceType },
          source: 'curated-recovery',
          error: errorMessage
        };
      }

      return {
        success: false,
        error: errorMessage
      };
    }

    const data = await response.json();
    const challenge: GeneratedChallenge = {
      ...data.challenge,
      sourceType: data.challenge.sourceType || sourceType
    };

    // Validate structured response
    const validation = validateGeneratedChallenge(challenge);
    if (!validation.isValid) {
      console.warn('Client validation warning for received challenge:', validation.errors);
      // If validation fails, try curated fallback
      const curated = getCuratedNovelChallenge(concept.id);
      if (curated) {
        return {
          success: true,
          challenge: { ...curated, sourceType },
          source: 'curated-fallback'
        };
      }
      return {
        success: false,
        error: `Generated challenge format was incomplete: ${validation.errors.join(', ')}`
      };
    }

    return {
      success: true,
      challenge,
      source: data.source || 'gemini'
    };
  } catch (err: any) {
    console.error('Network or execution error while generating challenge:', err);

    // If fetch failed completely (e.g. server booting or offline), use curated if available
    const curated = getCuratedNovelChallenge(concept.id);
    if (curated) {
      return {
        success: true,
        challenge: { ...curated, sourceType },
        source: 'client-fallback',
        error: err.message
      };
    }

    return {
      success: false,
      error: err.message || 'Unable to connect to the challenge generation engine.'
    };
  }
}
