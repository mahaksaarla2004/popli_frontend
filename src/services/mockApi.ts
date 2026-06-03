import { Creator, Reel, Comment, Chat, Message, NotificationItem, TransactionItem } from '../types';
import { CITY_COORDINATES, getHaversineDistance } from './geoService';

// Seeds for programmatic Indian creator generation
const FIRST_NAMES = [
  'Aria', 'Vikram', 'Elena', 'Rahul', 'Marcus', 'Pooja', 'Amit', 'Neha', 'Rohan', 'Karan',
  'Priya', 'Sanjay', 'Deepika', 'Arjun', 'Anjali', 'Ranveer', 'Shraddha', 'Varun', 'Kriti', 'Sid',
  'Sunita', 'Anil', 'Preeti', 'Rajesh', 'Divya', 'Gaurav', 'Ishita', 'Manoj', 'Ritu', 'Vijay',
  'Sneha', 'Abhishek', 'Komal', 'Harsh', 'Swati', 'Aditya', 'Jyoti', 'Pranav', 'Nisha', 'Ravi'
];

const LAST_NAMES = [
  'Styles', 'Tech', 'Fashion', 'Dance', 'Vlogs', 'Sharma', 'Verma', 'Patel', 'Joshi', 'Singh',
  'Gupta', 'Kumar', 'Mehta', 'Reddy', 'Rao', 'Nair', 'Das', 'Sen', 'Roy', 'Chawla',
  'Chef', 'Art', 'Comedy', 'Motivate', 'Bose', 'Kapoor', 'Khan', 'Mishra', 'Yadav', 'Dubey',
  'Chatterjee', 'Iyer', 'Sinha', 'Choudhury', 'Gill', 'Bahl', 'Trivedi', 'Jha', 'Kashyap', 'Grover'
];

const CATEGORIES: Creator['category'][] = [
  'music', 'comedy', 'fitness', 'art', 'gaming', 'culinary', 'motivation', 'fashion', 'lifestyle'
];

const BIOS = [
  'Creating magic daily ✨ | Live, Love, Create 🎥',
  'Tech review, gadgets, and next-gen hardware! 💻⚡',
  'Fashion is what you buy, style is what you do 👗👠',
  'Dance to the rhythm of life! 🕺💃 Join the vibe.',
  'Exploring India\'s hidden gems, one vlog at a time 🌍✈️',
  'Your daily dose of culinary inspiration! 🍲🔥',
  'Art in the heart, canvas in the hands 🎨🖌️',
  'Laughter is the best medicine. Trolling the universe! 😂🎭',
  'Level up your mindset every single day. Stay hungry 🦁💪',
  'Just a soul making videos and sharing happiness 🌟❤️'
];

// Curated high-quality video loops
const MOCK_VIDEOS = [
  'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-dancing-40030-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-woman-dancing-under-neon-lights-40033-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-young-man-dancing-in-studio-40026-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-hip-hop-dancer-performing-in-a-studio-40032-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-waves-breaking-in-the-ocean-1527-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-neon-light-glowing-in-the-dark-43301-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-dj-controlling-sound-levels-34063-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-chef-flaming-food-in-pan-40899-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-girl-gaming-intensely-in-dark-room-41604-large.mp4'
];

const THUMBNAILS = [
  'https://picsum.photos/id/101/400/600',
  'https://picsum.photos/id/102/400/600',
  'https://picsum.photos/id/103/400/600',
  'https://picsum.photos/id/104/400/600',
  'https://picsum.photos/id/106/400/600',
  'https://picsum.photos/id/107/400/600',
  'https://picsum.photos/id/108/400/600',
  'https://picsum.photos/id/109/400/600',
  'https://picsum.photos/id/110/400/600',
  'https://picsum.photos/id/111/400/600'
];

const AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?q=80&w=200&auto=format&fit=crop'
];

// Generate dynamic dataset
export function generateMockDatabase(): {
  creators: Creator[];
  reels: Reel[];
  notifications: NotificationItem[];
  chats: Chat[];
  transactions: TransactionItem[];
} {
  const cities = Object.keys(CITY_COORDINATES);
  const creators: Creator[] = [];
  const reels: Reel[] = [];

  // 1. Curate and insert Figma Design specific creators first
  const figmaCreators: Partial<Creator>[] = [
    {
      id: 'aria_styles',
      name: 'Aria Styles',
      username: 'aria_styles',
      avatar: AVATARS[0],
      bio: 'Fashion is an art, and I am the canvas 👗✨ | Indore\'s top style influencer',
      category: 'fashion',
      followersCount: 154200,
      followingCount: 142,
      coinsEarned: 245000,
      giftsReceivedCount: 12040,
      isVerified: true,
      location: { city: 'Indore', latitude: 22.721, longitude: 75.861 } // 2.4km from Indore center
    },
    {
      id: 'marcus_vlogs',
      name: 'Marcus Vlogs',
      username: 'marcus_vlogs',
      avatar: AVATARS[1],
      bio: 'Travelling India on my bike! 🏍️💨 Vlog daily | Indore Vibe',
      category: 'lifestyle',
      followersCount: 88400,
      followingCount: 95,
      coinsEarned: 124000,
      giftsReceivedCount: 5400,
      isVerified: true,
      location: { city: 'Indore', latitude: 22.716, longitude: 75.850 } // 0.8km from Indore center
    },
    {
      id: 'vikram_tech',
      name: 'Vikram Tech',
      username: 'vikram_tech',
      avatar: AVATARS[3],
      bio: 'Weekly #1 Creator 🏆 gadget reviews & tech hacks in Hindi!',
      category: 'gaming',
      followersCount: 420000,
      followingCount: 18,
      coinsEarned: 1800000, // Earned 1.8 Lakh this week
      giftsReceivedCount: 45000,
      isVerified: true,
      location: { city: 'Indore', latitude: 22.730, longitude: 75.875 }
    },
    {
      id: 'elena_fashion',
      name: 'Elena Fashion',
      username: 'elena_fashion',
      avatar: AVATARS[2],
      bio: 'Style Guru 👠 Redefining trends. Simple yet classy.',
      category: 'fashion',
      followersCount: 310000,
      followingCount: 45,
      coinsEarned: 1200000, // Earned 1.2 Lakh this week
      giftsReceivedCount: 31200,
      isVerified: true,
      location: { city: 'Bhopal', latitude: 23.262, longitude: 77.420 }
    },
    {
      id: 'rahul_dance_off',
      name: 'Rahul Dance',
      username: 'rahul_dance_off',
      avatar: AVATARS[7],
      bio: 'Winner of Megacoins challenge 🏆 | Catch my next flow!',
      category: 'music',
      followersCount: 112000,
      followingCount: 80,
      coinsEarned: 89000,
      giftsReceivedCount: 1200,
      isVerified: true,
      location: { city: 'Raipur', latitude: 21.256, longitude: 81.632 }
    }
  ];

  figmaCreators.forEach((c) => {
    creators.push({
      id: c.id!,
      name: c.name!,
      username: c.username!,
      avatar: c.avatar!,
      bio: c.bio!,
      category: c.category as Creator['category'],
      followersCount: c.followersCount!,
      followingCount: c.followingCount!,
      coinsEarned: c.coinsEarned!,
      giftsReceivedCount: c.giftsReceivedCount!,
      isVerified: c.isVerified!,
      location: c.location!
    });
  });

  // 2. Programmatically seed up to 105 total creators
  for (let i = creators.length; i < 105; i++) {
    const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
    const lastName = LAST_NAMES[i % LAST_NAMES.length];
    const name = `${firstName} ${lastName}`;
    const username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${i}`;
    const city = cities[i % cities.length];
    const baseCoords = CITY_COORDINATES[city];
    
    // Spread coordinates slightly so distance differs
    const latitude = baseCoords.latitude + (Math.random() - 0.5) * 0.1;
    const longitude = baseCoords.longitude + (Math.random() - 0.5) * 0.1;

    creators.push({
      id: `creator_${i}`,
      name,
      username,
      avatar: AVATARS[i % AVATARS.length],
      bio: BIOS[i % BIOS.length],
      category: CATEGORIES[i % CATEGORIES.length],
      followersCount: Math.floor(Math.random() * 95000) + 1200,
      followingCount: Math.floor(Math.random() * 400) + 20,
      coinsEarned: Math.floor(Math.random() * 50000) + 50,
      giftsReceivedCount: Math.floor(Math.random() * 1500),
      isVerified: Math.random() > 0.85,
      location: { city, latitude, longitude }
    });
  }

  // 3. Programmatically generate 300+ short Reels
  // Ensure every creator has at least 2 or 3 reels
  let reelIdCounter = 1;

  // Let's explicitly create Figma design reels first
  const figmaReels: Partial<Reel>[] = [
    {
      id: 'reel_figma_1',
      creatorId: 'rahul_dance_off',
      creatorName: 'Rahul Dance',
      creatorUsername: 'rahul_dance_off',
      creatorAvatar: AVATARS[7],
      videoUrl: MOCK_VIDEOS[2],
      thumbnailUrl: THUMBNAILS[2],
      description: 'New dance challenge for my 100k family! Use this sound and win mega coins this week... 🔥🕺 #StreetDance #DanceChallenge',
      musicName: 'Original Audio - Rahul Varma',
      likesCount: 24500, // 24.5K likes in Figma
      commentsCount: 1200, // 1.2K comments in Figma
      sharesCount: 450,
      savesCount: 890,
      category: 'music',
      location: { city: 'Raipur', latitude: 21.256, longitude: 81.632 }
    },
    {
      id: 'reel_figma_2',
      creatorId: 'aria_styles',
      creatorName: 'Aria Styles',
      creatorUsername: 'aria_styles',
      creatorAvatar: AVATARS[0],
      videoUrl: MOCK_VIDEOS[0],
      thumbnailUrl: THUMBNAILS[0],
      description: 'Styling neon overlays on true dark tones. Indore vibe checkout 👗🖤 #NeonVibes24 #OOTD #IndoreStreetStyle',
      musicName: 'Sunset Beat - Aria Styles',
      likesCount: 12300,
      commentsCount: 840,
      sharesCount: 310,
      savesCount: 450,
      category: 'fashion',
      location: { city: 'Indore', latitude: 22.721, longitude: 75.861 }
    },
    {
      id: 'reel_figma_3',
      creatorId: 'vikram_tech',
      creatorName: 'Vikram Tech',
      creatorUsername: 'vikram_tech',
      creatorAvatar: AVATARS[3],
      videoUrl: MOCK_VIDEOS[1],
      thumbnailUrl: THUMBNAILS[1],
      description: 'Unboxing the new folding gaming console! Mobile play has evolved. 💻🎮 #TechHacks #ConsoleGaming #Unboxing',
      musicName: 'Future Wave - Tech Zone',
      likesCount: 85200,
      commentsCount: 3400,
      sharesCount: 12400,
      savesCount: 9800,
      category: 'gaming',
      location: { city: 'Indore', latitude: 22.730, longitude: 75.875 }
    }
  ];

  figmaReels.forEach((r) => {
    reels.push({
      id: r.id!,
      creatorId: r.creatorId!,
      creatorName: r.creatorName!,
      creatorUsername: r.creatorUsername!,
      creatorAvatar: r.creatorAvatar!,
      videoUrl: r.videoUrl!,
      thumbnailUrl: r.thumbnailUrl!,
      description: r.description!,
      musicName: r.musicName!,
      likesCount: r.likesCount!,
      commentsCount: r.commentsCount!,
      sharesCount: r.sharesCount!,
      savesCount: r.savesCount!,
      isLiked: false,
      isSaved: false,
      isFollowed: true,
      category: r.category!,
      location: r.location!,
      rewardEarned: Math.floor(r.likesCount! * 0.05) // ₹5 per 1,000 views simulation
    });
    reelIdCounter++;
  });

  // Now seed the rest to reach 305 reels
  creators.forEach((c, index) => {
    const reelsToCreate = index < 10 ? 4 : 3; // Top creators get more reels
    for (let r = 0; r < reelsToCreate; r++) {
      const vIndex = (index + r) % MOCK_VIDEOS.length;
      const tIndex = (index + r) % THUMBNAILS.length;
      const likes = Math.floor(Math.random() * 50000) + 100;
      const comments = Math.floor(likes * 0.05) + 2;

      reels.push({
        id: `reel_${reelIdCounter}`,
        creatorId: c.id,
        creatorName: c.name,
        creatorUsername: c.username,
        creatorAvatar: c.avatar,
        videoUrl: MOCK_VIDEOS[vIndex],
        thumbnailUrl: THUMBNAILS[tIndex],
        description: `Check out this amazing reel! Seeding custom hyperlocal Indian creator vibes from beautiful ${c.location.city}. #VibeZone #${c.category} #${c.location.city}Creator`,
        musicName: `Original Audio - ${c.name}`,
        likesCount: likes,
        commentsCount: comments,
        sharesCount: Math.floor(likes * 0.08) + 1,
        savesCount: Math.floor(likes * 0.12) + 2,
        isLiked: Math.random() > 0.7,
        isSaved: Math.random() > 0.85,
        isFollowed: Math.random() > 0.5,
        category: c.category,
        location: c.location,
        rewardEarned: Math.floor(likes * 0.05)
      });
      reelIdCounter++;
    }
  });

  // 4. Seeding Notifications
  const notifications: NotificationItem[] = [
    {
      id: 'notif_1',
      type: 'gift',
      senderName: 'alexa_vibes',
      senderAvatar: AVATARS[2],
      title: 'Received a Rocket! 🚀',
      body: 'alexa_vibes gifted you a Rocket (500 coins).',
      timestamp: '5m ago',
      isRead: false,
      coinsCount: 500
    },
    {
      id: 'notif_2',
      type: 'comment',
      senderName: 'neon_curator',
      senderAvatar: AVATARS[4],
      title: 'New comment on your video',
      body: '"Hope you guys love the atmosphere of this one! More drops coming soon. 🌌"',
      timestamp: '1h ago',
      isRead: false
    },
    {
      id: 'notif_3',
      type: 'follow',
      senderName: 'jason_prime',
      senderAvatar: AVATARS[5],
      title: 'New Follower! 👤',
      body: 'jason_prime started following you.',
      timestamp: '3h ago',
      isRead: true
    },
    {
      id: 'notif_4',
      type: 'viral_alert',
      title: 'Viral Alert! ⚡',
      body: 'Your latest dance reel is trending #1 in Raipur with 24K+ views in 3 hours!',
      timestamp: '5h ago',
      isRead: false
    },
    {
      id: 'notif_5',
      type: 'nearby_trend',
      title: 'Nearby Challenge Live 🗺️',
      body: 'Join the #NEONVIBES24 citywalk in Indore. Win up to ₹50,000!',
      timestamp: '1d ago',
      isRead: true
    }
  ];

  // 5. Seeding Chats & inbox
  const chats: Chat[] = [
    {
      id: 'chat_1',
      creatorId: 'aria_styles',
      creatorName: 'Aria Styles',
      creatorUsername: 'aria_styles',
      creatorAvatar: AVATARS[0],
      isOnline: true,
      lastMessage: 'The transitions are absolutely fire! That lighting in the beginning. Wow. ✨',
      lastMessageTime: '9:41 AM',
      unreadCount: 2
    },
    {
      id: 'chat_2',
      creatorId: 'marcus_vlogs',
      creatorName: 'Marcus Vlogs',
      creatorUsername: 'marcus_vlogs',
      creatorAvatar: AVATARS[1],
      isOnline: true,
      lastMessage: 'Let\'s collaborate on a bike tour in Dewas next week!',
      lastMessageTime: 'Yesterday',
      unreadCount: 0
    },
    {
      id: 'chat_3',
      creatorId: 'elena_fashion',
      creatorName: 'Elena Fashion',
      creatorUsername: 'elena_fashion',
      creatorAvatar: AVATARS[2],
      isOnline: false,
      lastMessage: 'Sent you a coin package support pack. Keep going!',
      lastMessageTime: '2 days ago',
      unreadCount: 0
    }
  ];

  // 6. Seeding transactions
  const transactions: TransactionItem[] = [
    {
      id: 'tx_1',
      type: 'gift_receive',
      amount: 500,
      currency: 'coins',
      description: 'Received Rocket gift from alexa_vibes',
      status: 'success',
      timestamp: '01-06-2026 21:30'
    },
    {
      id: 'tx_2',
      type: 'coin_recharge',
      amount: 1250,
      currency: 'coins',
      description: 'Recharged wallet with 1,250 Coins',
      status: 'success',
      timestamp: '01-06-2026 12:15'
    },
    {
      id: 'tx_3',
      type: 'withdrawal',
      amount: 2450,
      currency: 'INR',
      description: 'Withdrew earnings to UPI ID: user@upi',
      status: 'success',
      timestamp: '31-05-2026 18:00'
    },
    {
      id: 'tx_4',
      type: 'gift_send',
      amount: 50,
      currency: 'coins',
      description: 'Sent Heart gift to rahul_dance_off',
      status: 'success',
      timestamp: '30-05-2026 10:45'
    }
  ];

  return { creators, reels, notifications, chats, transactions };
}

// 7. Preset comments array mapping to the Figma Dance reel
export const MOCK_COMMENTS: Comment[] = [
  {
    id: 'c_1',
    reelId: 'reel_figma_1',
    username: 'neon_curator',
    avatar: AVATARS[4],
    text: 'Hope you guys love the atmosphere of this one! More drops coming soon. 🌌',
    createdAt: '2h ago',
    likesCount: 842,
    isCreator: true
  },
  {
    id: 'c_2',
    reelId: 'reel_figma_1',
    username: 'alexa_vibes',
    avatar: AVATARS[2],
    text: 'The transitions are absolutely fire. That lighting in the beginning? Wow. ✨',
    createdAt: '45m ago',
    likesCount: 124,
    isTopGifter: true
  },
  {
    id: 'c_3',
    reelId: 'reel_figma_1',
    username: 'jason_prime',
    avatar: AVATARS[5],
    text: 'Where did you find that track? It perfectly matches the neon aesthetic.',
    createdAt: '12m ago',
    likesCount: 48
  },
  {
    id: 'c_4',
    reelId: 'reel_figma_1',
    username: 'sophia_arts',
    avatar: AVATARS[6],
    text: 'I think it\'s an unreleased remix of After Hours! 😍',
    createdAt: '5m ago',
    likesCount: 12
  }
];

// Curated Virtual Gifts matching Figma Exactly
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
