// Curated Virtual Gifts
export const GIFT_CATALOG = [
  { id: 'rocket', name: 'Rocket', cost: 500, icon: '🚀', animationType: 'fly' },
  { id: 'rose', name: 'Rose', cost: 10, icon: '🌹', animationType: 'burst' },
  { id: 'heart', name: 'Heart', cost: 50, icon: '💖', animationType: 'float' },
  { id: 'crown', name: 'Crown', cost: 2000, icon: '👑', animationType: 'spin' },
  { id: 'diamond', name: 'Diamond', cost: 1000, icon: '💎', animationType: 'burst' },
  { id: 'party', name: 'Party', cost: 150, icon: '🎉', animationType: 'burst' },
  { id: 'sparkle', name: 'Sparkle', cost: 300, icon: '✨', animationType: 'float' },
  { id: 'star', name: 'Star', cost: 5, icon: '⭐', animationType: 'fly' }
] as const;

// FAQ Questions for Support screen
export const FAQ_LIST = [
  {
    q: 'How does view monetization work?',
    a: 'Every creator earns ₹5 per 1,000 genuine views. There are no minimum 10K followers required. Start earning from your very first video!'
  },
  {
    q: 'What is the minimum withdrawal limit?',
    a: 'You can withdraw minimum ₹500 directly to your linked UPI ID or bank account. All payouts are safe, secure, and processed within 24 hours.'
  },
  {
    q: 'How can I earn coins or receive gifts?',
    a: 'Fans can recharge virtual coins and buy gifts (Rose, Rocket, Crown, etc.) in the video player bottom panel. When they gift you, these coins are credited directly to your creator balance as cashable earnings.'
  },
  {
    q: 'How does hyperlocal feed selection work?',
    a: 'The "Nearby Feed" uses GPS coordinates to match you with creators within 0-50 km of your exact location, promoting local trends and talent!'
  },
  {
    q: 'Is my KYC details secure?',
    a: 'Yes, absolutely. We use industry-standard encryption protocols. Your PAN, Aadhaar, and bank coordinates are fully encrypted and never shared.'
  }
];
