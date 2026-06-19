import { Voter } from './types';

// Smart Prioritization Scoring System
// Determines which voters should be contacted today

export interface ScoredVoter extends Voter {
  score: number;
  scoreBreakdown: {
    statusScore: number;
    tagScore: number;
    recencyScore: number;
    mobilizationScore: number;
    priorityScore: number;
  };
  recommendation: string;
}

export function calculateVoterScore(voter: Voter): ScoredVoter {
  let statusScore = 0;
  let tagScore = 0;
  let recencyScore = 0;
  let mobilizationScore = 0;
  let priorityScore = 0;

  // 1. Political Status Score
  if (voter.politicalStatus === 'undecided') {
    statusScore = 5; // Highest conversion potential
  } else if (voter.politicalStatus === 'supporter') {
    mobilizationScore = 2; // For mobilization
  } else {
    statusScore = 1; // Opponents still worth engaging
  }

  // 2. Tag Score (has issue engagement)
  if (voter.tags.length > 0) {
    tagScore = Math.min(voter.tags.length * 1.5, 4);
  }

  // 3. Recency Score (not contacted recently)
  if (!voter.lastContactedDate) {
    recencyScore = 3; // Never contacted
  } else {
    const daysSince = Math.floor(
      (Date.now() - new Date(voter.lastContactedDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSince > 30) recencyScore = 3;
    else if (daysSince > 14) recencyScore = 2;
    else if (daysSince > 7) recencyScore = 1;
    else recencyScore = 0;
  }

  // 4. Priority Level Score
  if (voter.priority === 'high') priorityScore = 3;
  else if (voter.priority === 'medium') priorityScore = 1;

  const totalScore = statusScore + tagScore + recencyScore + mobilizationScore + priorityScore;
  
  let recommendation = '';
  if (totalScore >= 10) {
    recommendation = 'Prioritet i lartë — Kontaktoni sot!';
  } else if (totalScore >= 7) {
    recommendation = 'Potencial i lartë konvertimi';
  } else if (totalScore >= 4) {
    recommendation = 'Kontaktoni këtë javë';
  } else {
    recommendation = 'Prioritet i ulët';
  }

  return {
    ...voter,
    score: totalScore,
    scoreBreakdown: {
      statusScore,
      tagScore,
      recencyScore,
      mobilizationScore,
      priorityScore,
    },
    recommendation,
  };
}

export function getTopPriorityVoters(voters: Voter[], limit: number = 20): ScoredVoter[] {
  return voters
    .map(calculateVoterScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function getDailyCallList(voters: Voter[], limit: number = 15): ScoredVoter[] {
  return getTopPriorityVoters(
    voters.filter(v => v.politicalStatus !== 'opponent'),
    limit
  );
}

export function getHighConversionPotential(voters: Voter[]): ScoredVoter[] {
  return voters
    .filter(v => v.politicalStatus === 'undecided')
    .map(calculateVoterScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, 30);
}
