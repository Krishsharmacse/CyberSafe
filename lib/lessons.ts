export interface Lesson {
  id: string
  title: string
  description: string
  category: 'basics' | 'phishing' | 'financial' | 'social' | 'impersonation'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: number // minutes
  learningPoints: number
  content: string
  keyTakeaways: string[]
  simulation?: SimulationScenario
}

export interface SimulationScenario {
  id: string
  context: string
  whatsappMessages: WhatsAppMessage[]
  correctAnswers: string[]
  explanation: string
}

export interface WhatsAppMessage {
  id: string
  sender: string
  senderImage?: string
  message: string
  timestamp: string
  isGreen?: boolean // WhatsApp Business / verified account
}

export const lessons: Lesson[] = [
  {
    id: 'lesson-1',
    title: 'Recognizing Phishing Messages',
    description: 'Learn how to identify phishing attacks that pretend to be from banks or services',
    category: 'phishing',
    difficulty: 'beginner',
    duration: 5,
    learningPoints: 100,
    content: `
    Phishing is when scammers pretend to be from a legitimate company (like your bank) to trick you into:
    - Sharing passwords or OTPs
    - Clicking malicious links
    - Downloading malware
    - Transferring money
    
    Common phishing signs:
    1. Urgent language ("Act Now!", "Your account is locked!")
    2. Requests for sensitive info (passwords, OTPs, card numbers)
    3. Suspicious sender addresses
    4. Generic greetings ("Dear Customer" instead of your name)
    5. Poor grammar or formatting
    6. Links that don't match the claimed sender
    7. Threats or fear-based messaging
    
    Real banks NEVER ask for:
    - Your full OTP
    - Your PIN or password
    - Your CVV
    - To click links in messages
    `,
    keyTakeaways: [
      'Banks never ask for OTPs via message',
      'Verify links by hovering over them before clicking',
      'Call the official number to confirm suspicious requests',
      'Use your bank app instead of clicking message links',
    ],
    simulation: {
      id: 'phishing-1',
      context: 'You receive a WhatsApp message that appears to be from your bank.',
      whatsappMessages: [
        {
          id: '1',
          sender: 'State Bank of India',
          message: 'ALERT: Your account has been locked due to suspicious activity. Click here to verify: bit.ly/verify-bank',
          timestamp: '2:45 PM',
          isGreen: false,
        },
        {
          id: '2',
          sender: 'State Bank of India',
          message: 'Urgent: Please confirm your OTP: 256891 to unlock your account immediately',
          timestamp: '2:46 PM',
        },
      ],
      correctAnswers: ['This is a phishing scam', 'Do not click the link', 'Do not share the OTP'],
      explanation: 'This is a classic phishing attempt with multiple red flags: shortened URL, urgency, request for OTP, and generic greeting. Banks never ask for OTPs via message.',
    },
  },
  {
    id: 'lesson-2',
    title: 'Spotting Romance Scams',
    description: 'Understand how scammers build fake relationships to steal money',
    category: 'social',
    difficulty: 'intermediate',
    duration: 8,
    learningPoints: 150,
    content: `
    Romance scams involve building fake relationships to manipulate victims into sending money.
    
    Common tactics:
    1. Quick declarations of love
    2. Requesting money for "emergencies" (medical, travel, business)
    3. Asking you to keep the relationship secret
    4. Using fake photos from the internet
    5. Making excuses to avoid video calls
    6. Gradual escalation of money requests
    
    Red flags:
    - Never wants to video call
    - Asks for money very quickly
    - Story keeps changing
    - Wants relationship kept secret
    - Attractive profile photo, suspicious about verification
    - Consistent "bad luck" or emergencies
    
    Protect yourself:
    - Use reverse image search on profile photos
    - Ask for video call early and often
    - Never send money to someone you haven't met
    - Don't fall for time pressure or guilt tactics
    - Tell trusted friends about the person
    `,
    keyTakeaways: [
      'Real relationships develop slowly',
      'Always verify identity with video calls',
      'Never send money to strangers online',
      'Trust your instincts if something feels off',
    ],
  },
  {
    id: 'lesson-3',
    title: 'Government Impersonation Schemes',
    description: 'How scammers impersonate government agencies to extract money',
    category: 'impersonation',
    difficulty: 'beginner',
    duration: 6,
    learningPoints: 120,
    content: `
    Scammers often impersonate:
    - Tax authorities (Income Tax Department)
    - Police departments
    - Telecom authorities
    - Labor departments
    - Energy boards
    
    Common schemes:
    1. "You have pending taxes/fines"
    2. "Your telecom connection will be cancelled"
    3. "Police case against you"
    4. "Penalty for illegal activity"
    5. "Refund available, please verify details"
    
    How they operate:
    - Start with official-sounding language
    - Create urgency and fear
    - Demand immediate payment
    - Provide fake case/reference numbers
    - Claim you can settle it "quickly" for a fee
    
    Facts to remember:
    - Government agencies never ask payment via UPI, Google Pay, or WhatsApp
    - They send official notices by post, not WhatsApp
    - You have the right to verify through official channels
    - Real authorities give you time to respond
    - Never pay without independent verification
    `,
    keyTakeaways: [
      'Government agencies don\'t threaten immediate action',
      'Verify through official websites or offices',
      'Never pay government dues via informal channels',
      'Ask for written official documentation',
    ],
  },
  {
    id: 'lesson-4',
    title: 'Investment & Prize Scams',
    description: 'Recognize too-good-to-be-true offers for money',
    category: 'financial',
    difficulty: 'intermediate',
    duration: 7,
    learningPoints: 140,
    content: `
    If it seems too good to be true, it probably is.
    
    Common schemes:
    1. "You won a lottery you never entered"
    2. "Get 100% returns on investment"
    3. "Limited time: Double your money"
    4. "Crypto investment opportunity"
    5. "Job offer with high salary for minimal work"
    6. "Inheritance from unknown relative"
    
    Why they work:
    - Greed and desperation
    - Legitimate-sounding explanations
    - Fake testimonials and proof
    - Pressure to "act fast"
    - Requests for small initial amount
    
    Warning signs:
    - Unrealistic returns
    - Pressure to keep it secret
    - Guarantee of profits
    - Requests for "processing fees"
    - Can't withdraw money easily
    - Frequent requests for more money
    - Company not verifiable online
    
    Smart practices:
    - Research the company thoroughly
    - Check regulatory registrations
    - Never invest based on messages
    - Trust established, regulated institutions
    - Ask certified financial advisors
    `,
    keyTakeaways: [
      'Legitimate investments don\'t guarantee returns',
      'Real companies are verifiable and regulated',
      'Always research before investing',
      'Be skeptical of unsolicited offers',
    ],
  },
  {
    id: 'lesson-5',
    title: 'Email & Website Spoofing',
    description: 'Learn how websites and emails are faked to look legitimate',
    category: 'phishing',
    difficulty: 'advanced',
    duration: 10,
    learningPoints: 180,
    content: `
    Spoofing is when scammers create fake versions of legitimate websites or emails.
    
    Email spoofing:
    - Sender address looks like official company but isn't
    - Example: "paypa1.com" looks like "paypal.com" at first glance
    - Check full sender address by clicking "Show Original" in Gmail
    - Legitimate companies have consistent domain names
    
    Website spoofing:
    - Fake website looks identical to real one
    - URL is slightly different (homoglyphs: paypa1.com vs paypal.com)
    - Often uses HTTPS to seem legitimate
    - Check for small differences in logos or layouts
    
    How to verify:
    1. Check the full URL (not just the page name)
    2. Look for SSL certificate (lock icon) - but not guarantee
    3. Type the URL directly instead of clicking links
    4. Check for spelling mistakes
    5. Compare to official website side by side
    6. Use password manager to auto-fill - it won't work on fake sites
    
    Browser tools:
    - Check domain WHOIS information
    - Use website reputation tools
    - Install browser extensions that warn about phishing
    - Verify sender through official contact info
    `,
    keyTakeaways: [
      'Always check the full URL carefully',
      'Type addresses directly or use bookmarks',
      'Legitimate sites have consistent branding',
      'Use two-factor authentication for important accounts',
    ],
  },
  {
    id: 'lesson-6',
    title: 'Social Engineering & Manipulation',
    description: 'Understand psychological tactics used by scammers',
    category: 'social',
    difficulty: 'advanced',
    duration: 8,
    learningPoints: 160,
    content: `
    Social engineering exploits human psychology rather than technical vulnerabilities.
    
    Common psychological tactics:
    1. Authority - Pretend to be from bank, police, government
    2. Urgency - "Act now or lose access"
    3. Fear - "Your account is compromised"
    4. Scarcity - "Limited spots available"
    5. Trust - Building rapport before asking for help
    6. Reciprocity - "I helped you, now you help me"
    7. Curiosity - Getting you to click suspicious links
    
    Manipulation techniques:
    - Pretext calling - Creating fake scenarios
    - Baiting - Leaving USB drives or attractive offers
    - Tailgating - Following you into secured areas
    - Quid pro quo - Trading favors
    - Pretexting - Using fake identity
    
    Real examples:
    - "I'm from IT support, I need your password to fix an issue"
    - "Your family member is in an accident, send money for hospital"
    - "I'm a single lady wanting to invest in your business"
    
    How to resist:
    - Question requests that bypass normal procedures
    - Verify through independent channels
    - Don't feel rushed into decisions
    - Trust your gut feeling
    - Know official procedures
    - Share suspicions with trusted people
    - It's OK to say "I need to verify this"
    `,
    keyTakeaways: [
      'Scammers use psychology, not just technology',
      'Urgency is a major red flag',
      'Verify independently before responding',
      'Your feelings of hesitation are valid',
    ],
  },
]

export function getLessonById(id: string): Lesson | undefined {
  return lessons.find(l => l.id === id)
}

export function getLessonsByCategory(category: string): Lesson[] {
  return lessons.filter(l => l.category === category)
}

export function getLessonsByDifficulty(difficulty: string): Lesson[] {
  return lessons.filter(l => l.difficulty === difficulty)
}

export const categories = [
  { id: 'basics', label: 'Basics', icon: '📚' },
  { id: 'phishing', label: 'Phishing', icon: '🎣' },
  { id: 'financial', label: 'Financial', icon: '💰' },
  { id: 'social', label: 'Social Engineering', icon: '🎭' },
  { id: 'impersonation', label: 'Impersonation', icon: '🎪' },
]

export const difficulties = [
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
]
