import { Response } from 'express';
import { AuthRequest } from '../types/index.js';

// Simple FAQ database
const FAQ_DATABASE: Record<string, string> = {
  'how to post load': 'Go to the "Post Load" page, fill in pickup and delivery information, add rate and equipment type, then click "Post Load". Brokers can post unlimited loads.',
  'how to book load': 'Browse the Load Board, find a load that matches your equipment, and click "Book Load". Carriers with proper authority can book loads.',
  'what is usdot': 'USDOT (US Department of Transportation) number is required by FMCSA for all carriers operating in interstate commerce.',
  'what is mc number': 'MC (Motor Carrier) number is issued by the FMCSA and is required for for-hire carriers operating interstate.',
  'what is ein': 'EIN (Employer Identification Number) is a 9-digit tax ID issued by the IRS for businesses.',
  'forgot password': 'Use the "Forgot Password" link on the login page to reset your password.',
  'verify email': 'Check your email inbox for a 6-digit verification code. Enter it on the verification page to activate your account.',
  'how to update profile': 'Go to Settings and update your profile information including email, phone, and company details.',
  'how to contact support': 'Use this chat widget, send a message to support@cargolume.com, or call our support line.',
  'what is carrier': 'A carrier is a trucking company that transports freight from point A to point B.',
  'what is broker': 'A broker arranges freight transportation between shippers and carriers without operating trucks themselves.',
  'what is shipper': 'A shipper owns the freight and needs it transported from origin to destination.',
  'subscription plans': 'We offer Free, Ultima, and Premium plans. Visit the Pricing page for details.',
  'how to upload documents': 'Go to Documents page, click "Upload", and select your BOL, POD, insurance, or other freight documents.',
  'how to send message': 'Go to Messages, select a user, type your message, and click Send.',
  'load status available': 'Available loads are open for booking by carriers.',
  'load status booked': 'Booked loads have been assigned to a carrier and are in the system.',
  'load status in transit': 'In transit means the freight is currently being transported.',
  'load status delivered': 'Delivered means the shipment has reached its destination.',
  'what equipment types': 'Common equipment types include Dry Van, Flatbed, Reefer, Step Deck, and more.',
};

// Simple keyword matching function
function findBestMatch(userQuestion: string): { answer: string; matchedQuestion: string } | null {
  const lowerQuestion = userQuestion.toLowerCase().trim();
  
  // Exact match first
  if (FAQ_DATABASE[lowerQuestion]) {
    return {
      answer: FAQ_DATABASE[lowerQuestion],
      matchedQuestion: lowerQuestion
    };
  }

  // Keyword matching
  let bestMatch: { key: string; score: number } | null = null;
  
  for (const [question] of Object.entries(FAQ_DATABASE)) {
    const questionWords = question.split(' ');
    const questionLower = question.toLowerCase();
    
    // Count matching words
    let score = 0;
    for (const word of lowerQuestion.split(' ')) {
      if (questionWords.some(qw => qw.includes(word))) {
        score++;
      }
    }
    
    // Also check if any key phrase is contained in the question
    if (lowerQuestion.includes(questionLower)) {
      score += 2; // Boost score for containing phrases
    }
    
    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { key: question, score };
    }
  }
  
  if (bestMatch && bestMatch.score >= 1) {
    return {
      answer: FAQ_DATABASE[bestMatch.key],
      matchedQuestion: bestMatch.key
    };
  }
  
  return null;
}

export const chat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    // Find best matching answer
    const match = findBestMatch(message);

    if (match) {
      res.json({
        success: true,
        data: {
          answer: match.answer,
          matchedQuestion: match.matchedQuestion,
          source: 'faq'
        }
      });
    } else {
      // Default response for unmatched questions
      res.json({
        success: true,
        data: {
          answer: 'I don\'t have information about that specific topic. Please try rephrasing your question or contact our support team at support@cargolume.com for personalized assistance.',
          matchedQuestion: null,
          source: 'default'
        }
      });
    }
  } catch (error: any) {
    console.error('AI chat error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
};

