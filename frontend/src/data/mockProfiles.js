// ============================================================
// MOCK USER PROFILES FOR AI MONEY MENTOR DEMO
// Two profiles matching the exact scenarios from the project spec
// ============================================================

export const profiles = [
  // ──────────────────────────────────────────────────────────
  // PROFILE 1: Young Professional — Score 62/100
  // ──────────────────────────────────────────────────────────
  {
    id: 'young-professional',
    name: 'Arjun Mehta',
    label: 'Young Professional',
    age: 27,
    salary: 720000, // 7.2L annual (₹60K/month)
    monthlyExpenses: 40000,
    overallScore: 62,
    scoreVerdict: 'Needs Attention',

    // ── Money Health Agent ──
    moneyHealth: {
      savings: 45000,
      monthlyExpenses: 40000,
      emergencyMonths: 1.1,
      emergencyTarget: 120000, // 3 months
      savingsRate: 18,
      debtToIncome: 35,
      goalProgress: 24,
      breakdown: [
        { label: 'Liquidity', score: 28, max: 30, color: '#ef4444' },
        { label: 'Savings Rate', score: 14, max: 25, color: '#f59e0b' },
        { label: 'Debt Ratio', score: 12, max: 20, color: '#f59e0b' },
        { label: 'Goal Progress', score: 8, max: 25, color: '#ef4444' },
      ],
      actions: [
        {
          severity: 'critical',
          title: 'Emergency Fund: Critical Alert',
          description: 'You currently have ₹45,000 in savings against a monthly expense of ₹40,000 (1.1 months).',
          action: 'Pause discretionary investments until you build a reserve of ₹1.2 Lakhs (3 months\' cover). Consider sweeping this into a Liquid Mutual Fund or a high-yield savings account.',
        },
        {
          severity: 'warning',
          title: 'Savings Rate Below Target',
          description: 'Your savings rate is 18%, slightly below the recommended 20% threshold.',
          action: 'Automate a ₹5,000 SIP on salary day so savings happen first, not last.',
        },
      ],
    },

    // ── Tax Wizard Agent ──
    taxWizard: {
      currentRegime: 'Old',
      grossIncome: 720000,
      claimed80C: 40000,
      max80C: 150000,
      remaining80C: 110000,
      oldRegimeTax: 52500,
      newRegimeTax: 34000,
      savings: 18500,
      recommendation: 'new', // switch to new regime
      actions: [
        {
          title: 'Switch to New Tax Regime',
          description: 'Switching to the New Tax Regime will save you exactly ₹18,500 in taxes this financial year based on your current deductions.',
        },
        {
          title: 'Or: Maximize Old Regime',
          description: 'If you prefer the Old Regime, you must deploy ₹1,10,000 into ELSS or PPF before March 31st to maximize tax efficiency.',
        },
      ],
      deductions: [
        { section: '80C', claimed: 40000, limit: 150000, items: 'ELSS, PPF, LIC, EPF' },
        { section: '80D', claimed: 0, limit: 25000, items: 'Health Insurance' },
        { section: 'HRA', claimed: 0, limit: 60000, items: 'House Rent Allowance' },
      ],
    },

    // ── Portfolio X-Ray Agent ──
    portfolioXRay: {
      funds: [
        {
          name: 'HDFC Mid-Cap Opportunities',
          plan: 'Regular',
          category: 'Mid Cap',
          aum: 250000,
          ter: 1.6,
          directTer: 0.8,
          terDiff: 0.8,
          tenYearLoss: 140000, // ₹1.4L lost
          nav: 145.32,
        },
        {
          name: 'SBI Small Cap Fund',
          plan: 'Regular',
          category: 'Small Cap',
          aum: 100000,
          ter: 1.8,
          directTer: 0.65,
          terDiff: 1.15,
          tenYearLoss: 95000,
          nav: 87.55,
        },
        {
          name: 'ICICI Pru Liquid Fund',
          plan: 'Direct',
          category: 'Liquid',
          aum: 45000,
          ter: 0.2,
          directTer: 0.2,
          terDiff: 0,
          tenYearLoss: 0,
          nav: 312.8,
        },
      ],
      overlapAnalysis: null, // no overlap issue for this profile
      actions: [
        {
          title: 'Switch to Direct Plans',
          description: 'Your HDFC Mid-Cap Opportunities (Regular) is charging a TER of 1.6%. The Direct plan charges 0.8%.',
          impact: 'Over 10 years, this 0.8% difference will cost you approximately ₹1.4 Lakhs in lost compounding.',
          action: 'Initiate a switch from Regular to Direct plans via your broker. Ensure you account for the 10% LTCG tax on equity above ₹1.25L if applicable.',
        },
      ],
    },

    // ── FIRE Planner Agent ──
    firePlanner: {
      currentAge: 27,
      targetAge: 45,
      monthlySIP: 10000,
      currentCorpus: 45000,
      targetCorpus: 20000000, // ₹2 Cr
      expectedReturn: 0.12,
      inflation: 0.06,
      currentTrajectory: {
        hitAge: 52,
        probability: 55,
      },
      optimizedTrajectory: {
        hitAge: 47,
        stepUp: 10,
        probability: 72,
      },
    },

    // ── Compliance Guardian ──
    compliance: {
      notes: [
        'Mutual Fund investments are subject to market risks, read all scheme related documents carefully.',
        'This plan is generated based on historical data and current tax laws. It does not constitute a guarantee of future returns.',
        'Please consult a registered SEBI Investment Adviser (RIA) before executing large portfolio shifts.',
      ],
    },
  },

  // ──────────────────────────────────────────────────────────
  // PROFILE 2: Mid-Career Tech Worker — Score 88/100
  // ──────────────────────────────────────────────────────────
  {
    id: 'tech-worker',
    name: 'Priya Sharma',
    label: 'Mid-Career Tech Worker',
    age: 35,
    salary: 2400000, // 24L annual (₹2L/month)
    monthlyExpenses: 80000,
    overallScore: 88,
    scoreVerdict: 'Excellent',

    // ── Money Health Agent ──
    moneyHealth: {
      savings: 850000,
      monthlyExpenses: 80000,
      emergencyMonths: 10.6,
      emergencyTarget: 480000, // 6 months
      savingsRate: 42,
      debtToIncome: 12,
      goalProgress: 72,
      breakdown: [
        { label: 'Liquidity', score: 28, max: 30, color: '#22c55e' },
        { label: 'Savings Rate', score: 23, max: 25, color: '#22c55e' },
        { label: 'Debt Ratio', score: 18, max: 20, color: '#22c55e' },
        { label: 'Goal Progress', score: 19, max: 25, color: '#22c55e' },
      ],
      actions: [
        {
          severity: 'success',
          title: 'Emergency Fund: Excellent',
          description: 'You have 10.6 months of expenses saved (₹8.5L). Well above the 6-month recommended buffer.',
          action: 'Consider moving excess emergency funds (above 6 months) into short-term debt funds for better returns.',
        },
        {
          severity: 'success',
          title: 'Savings Rate: Outstanding',
          description: 'Your 42% savings rate far exceeds the 20% target. You are on an accelerated wealth-building path.',
          action: 'Maintain current discipline. Consider tax-loss harvesting at year-end to optimize further.',
        },
      ],
    },

    // ── Tax Wizard Agent ──
    taxWizard: {
      currentRegime: 'Old',
      grossIncome: 2400000,
      claimed80C: 90000,
      max80C: 150000,
      remaining80C: 60000,
      oldRegimeTax: 374400,
      newRegimeTax: 390000,
      savings: 18720, // from investing remaining 80C
      recommendation: 'old', // stay on old, invest more in 80C
      actions: [
        {
          title: 'Maximize Section 80C',
          description: 'By sticking to the Old Regime, you currently have ₹60,000 left in your Section 80C limit.',
        },
        {
          title: 'Action: Deploy ₹60,000 in ELSS',
          description: 'Investing this ₹60,000 in an ELSS Mutual Fund before March 31st will reduce your final tax liability by ₹18,720.',
        },
      ],
      deductions: [
        { section: '80C', claimed: 90000, limit: 150000, items: 'EPF, ELSS' },
        { section: '80D', claimed: 25000, limit: 25000, items: 'Health Insurance (Self)' },
        { section: '80D (Parents)', claimed: 50000, limit: 50000, items: 'Health Insurance (Parents)' },
        { section: 'HRA', claimed: 120000, limit: 120000, items: 'House Rent Allowance' },
      ],
    },

    // ── Portfolio X-Ray Agent ──
    portfolioXRay: {
      funds: [
        {
          name: 'Axis Bluechip Fund',
          plan: 'Direct',
          category: 'Large Cap',
          aum: 1200000,
          ter: 0.55,
          directTer: 0.55,
          terDiff: 0,
          tenYearLoss: 0,
          nav: 52.8,
        },
        {
          name: 'SBI Bluechip Fund',
          plan: 'Direct',
          category: 'Large Cap',
          aum: 800000,
          ter: 0.72,
          directTer: 0.72,
          terDiff: 0,
          tenYearLoss: 0,
          nav: 78.43,
        },
        {
          name: 'Quant Small Cap Fund',
          plan: 'Direct',
          category: 'Small Cap',
          aum: 500000,
          ter: 0.62,
          directTer: 0.62,
          terDiff: 0,
          tenYearLoss: 0,
          nav: 198.7,
        },
        {
          name: 'Nippon India Growth Fund',
          plan: 'Direct',
          category: 'Mid Cap',
          aum: 400000,
          ter: 0.98,
          directTer: 0.98,
          terDiff: 0,
          tenYearLoss: 0,
          nav: 3150.6,
        },
        {
          name: 'SBI Magnum Gilt Fund',
          plan: 'Direct',
          category: 'Gilt (Long Duration)',
          aum: 600000,
          ter: 0.45,
          directTer: 0.45,
          terDiff: 0,
          tenYearLoss: 0,
          nav: 56.12,
        },
      ],
      overlapAnalysis: {
        fund1: 'Axis Bluechip Fund',
        fund2: 'SBI Bluechip Fund',
        overlapPercent: 68,
        overlappingStocks: [
          { name: 'HDFC Bank', weight1: 9.2, weight2: 8.8 },
          { name: 'Reliance Industries', weight1: 8.5, weight2: 7.9 },
          { name: 'ICICI Bank', weight1: 7.8, weight2: 8.1 },
          { name: 'Infosys', weight1: 6.2, weight2: 5.9 },
          { name: 'TCS', weight1: 5.8, weight2: 6.3 },
          { name: 'Larsen & Toubro', weight1: 4.5, weight2: 4.2 },
          { name: 'Bharti Airtel', weight1: 4.1, weight2: 3.8 },
          { name: 'ITC', weight1: 3.8, weight2: 4.5 },
        ],
        secondOverlap: {
          fund1: 'Quant Small Cap Fund',
          fund2: 'Nippon India Growth Fund',
          overlapPercent: 65,
        },
      },
      actions: [
        {
          title: 'Redundancy Alert: 68% Overlap',
          description: 'You hold Axis Bluechip Fund and SBI Bluechip Fund. Our X-Ray detects a 68% stock overlap between these two. You are paying two fund managers to hold the exact same top 10 stocks.',
          impact: 'Combined AUM of ₹20L in overlapping funds is duplicating exposure.',
          action: 'Consider consolidating into a single Nifty 50 Index Fund to reduce TER to ~0.2% while maintaining the same market exposure.',
        },
        {
          title: 'Secondary Overlap: 65%',
          description: 'Your Quant Small Cap Fund and Nippon India Growth Fund also show a 65% stock overlap.',
          impact: 'Sector concentration risk is elevated due to similar holdings.',
          action: 'Consider replacing one with a Flexi-Cap fund for better diversification.',
        },
      ],
    },

    // ── FIRE Planner Agent ──
    firePlanner: {
      currentAge: 35,
      targetAge: 50,
      monthlySIP: 60000,
      currentCorpus: 3500000, // 35L
      targetCorpus: 50000000, // ₹5 Cr
      expectedReturn: 0.12,
      inflation: 0.06,
      currentTrajectory: {
        hitAge: 53,
        probability: 68,
      },
      optimizedTrajectory: {
        hitAge: 48,
        stepUp: 12,
        probability: 85,
      },
      newsImpact: {
        headline: 'RBI announces pause on Repo Rate hikes',
        relevance: 'Your 20% allocation to long-duration Debt Mutual Funds is well-positioned to benefit from this, as bond yields are likely to stabilize or drop, increasing your NAV. Hold steady.',
      },
    },

    // ── Compliance Guardian ──
    compliance: {
      notes: [
        'Monte Carlo simulations are based on randomized probability models of historical market behavior and do not guarantee future performance.',
        'Financial Independence targets are highly sensitive to inflation and personal withdrawal rates.',
        'This is an educational projection, not binding financial advice.',
        'Mutual Fund investments are subject to market risks, read all scheme related documents carefully.',
      ],
    },
  },
];

export default profiles;
