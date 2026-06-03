---
type: product-spec
created: 2026-06-02
updated: 2026-06-02
---

# Document 1: Short Video Creator Platform Complete Product Flow & Development Document
*(Psychology-Driven Hyperlocal Creator Ecosystem)*

## 1. PRODUCT VISION
The platform is a hyperlocal short-video creator ecosystem designed for India’s next-generation creators. The app combines:
- Infinite short-video entertainment
- Hyperlocal discovery
- Human psychology-based recommendations
- Creator monetization
- Social validation
- Reward-driven engagement

The platform is designed to maximize:
- Daily active usage
- Content uploads
- User retention
- Session time
- Emotional engagement

## 2. CORE PRODUCT CONCEPT
Every user is both:
- Viewer
- Creator

Users can:
- Watch videos
- Upload videos
- Follow creators
- Earn coins
- Gift creators
- Receive gifts
- Build audience
- Become viral

*No separate creator account required.*

## 3. APPLICATION ENTRY FLOW

### 3.1 SPLASH SCREEN
- **Purpose**: Brand introduction and app initialization.
- **Duration**: 2–3 seconds
- **Backend Actions During Splash**:
  - Check internet
  - Initialize APIs
  - Detect device location
  - Load nearby trends
  - Check login session
  - Load recommendation cache

### 3.2 WELCOME SCREEN FLOW (3 Screens)

#### Welcome Screen 1
- **Messaging**: “Discover Viral Creators Near You”
- **Features Highlighted**:
  - Nearby reels
  - Local creators
  - Hyperlocal trends
- **Background**: Auto-playing nearby/trending short videos.

#### Welcome Screen 2
- **Messaging**: “Create, Upload & Become Viral”
- **Features Highlighted**:
  - Upload videos
  - Earn followers
  - Grow audience
  - Go viral

#### Welcome Screen 3
- **Messaging**: “Earn Rewards & Build Your Identity”
- **Features Highlighted**:
  - Coin rewards
  - Creator growth
  - Gifts from followers
  - Monetization

### 3.3 LOCATION DETECTION FLOW
After welcome screens, the system automatically requests GPS location permission.
- **If granted**:
  - Detect city
  - Detect nearby area
  - Configure nearby feed
- **If denied**:
  - Ask manual city selection

**Location used for**:
- Nearby reels
- Nearby creators
- Local trending
- Recommendation optimization

### 3.4 INTEREST SELECTION FLOW
User selects interests before entering app.
- **Interest Categories Examples**: Comedy, Emotional, Motivation, Gaming, Dance, Village life, Lifestyle, Music, Arts/Theater, Fitness, Palette (Arts), Gaming, Culinary (Food), MapPin (Location).
- **Selection Rule**: Minimum 3 interests.
- **Purpose**:
  - Initial recommendation engine
  - Mood-based feed generation
  - Human psychology optimization
  - Retention improvement

## 4. AUTHENTICATION FLOW

### 4.1 LOGIN SCREEN
Users can login using:
- **Option 1**: Mobile Number + OTP
- **Option 2**: Email + Password
- **Option 3**: Username + Password
- **Option 4**: Google Login
- **Login Psychology**: Fast, Simple, Trustworthy. No unnecessary fields.

### 4.2 SIGNUP SCREEN
- **Required Fields**: Full Name, Username, Mobile Number, Email Address, 6-Digit Secure Password
- **Username Rules**:
  - Unique username
  - Auto availability check
  - Suggest alternative usernames (Example: `@kanhaiya01`, `@kanhaiya_official`)
- **Password Rules**: 6-digit secure password (numeric or alphanumeric, encrypted in backend).
- **Signup Backend Flow**:
  - Create profile
  - Create creator identity
  - Initialize wallet
  - Generate recommendation profile
  - Save location data
  - Generate nearby mapping

## 5. HOME FEED FLOW

### 5.1 AUTO-PLAY FEED EXPERIENCE
Immediately after login, user lands directly into a full-screen reel feed (no dashboard first).
- Videos: Auto-play instantly, Infinite scrolling, Smooth vertical swipe.
- Goal: Instant dopamine engagement.

### 5.2 FEED TYPES
- **A. Nearby Feed**: Default feed priority. Shows nearby creators, same city videos, local viral reels, nearby trending content. (Purpose: Local emotional connection).
- **B. Trending Feed**: Shows fast viral content, high engagement videos, trending creators.
- **C. Mood-Based Feed**: AI/behavior system detects watch patterns, scroll speed, pause time, emotional content preference and adapts feed dynamically.
  - *Sad mood* → emotional content
  - *Fast scrolling* → funny short content
  - *Long watch time* → story content
- **D. Following Feed**: Shows followed creators only.

## 6. HUMAN PSYCHOLOGY RECOMMENDATION ENGINE
- **System Tracks**: Watch duration, rewatch behavior, pause behavior, like patterns, comment patterns, time spent, mood preference, location relevance.
- **Psychology Goals**: Platform should create curiosity, emotional attachment, dopamine loops, social validation, FOMO.
- **Feed Prioritization Formula**:
  1. Watch completion
  2. Rewatch rate
  3. Shares
  4. Nearby relevance
  5. Emotional engagement
  6. Session retention probability

## 7. VIDEO INTERACTION SYSTEM
Every reel supports:
- Like, Comment, Share, Save, Follow creator, Gift creator, Message creator, Report content.
- **Real-Time Engagement**: Counters update instantly (Likes, Views, Coins, Gifts, Followers) to create immediate gratification psychology.

## 8. GIFT SYSTEM
Users can gift creators: Coins, Animated gifts, Special badges.
- **Gift Types Examples**: Rose, Crown, Fire, Rocket, Diamond.
- **Gift Psychology Purpose**: Creator motivation, fan loyalty, emotional attachment, status display.
- **Gift Backend Logic**: System tracks gift sender, gift receiver, coin deduction, wallet history. Admin can control gift pricing, disable gifts, or launch seasonal gifts.

## 9. VIDEO UPLOAD FLOW
- **Step 1**: Tap upload button.
- **Step 2**: Choose record video or upload from gallery.
- **Step 3**: Basic editing (Trim video, add caption, hashtags, location, category).
- **Step 4**: Thumbnail generation.
- **Step 5**: Upload optimization (compresses video, generates multiple resolutions, creates preview/thumbnails).
- **Step 6**: Publish reel (reel enters nearby testing feed, recommendation engine, trending pipeline).

## 10. CREATOR PROFILE SYSTEM
Each user gets a public creator profile containing:
- DP/Profile image, Username, Bio, Followers, Following, Total likes, Total gifts, Coin balance, Uploaded reels, Verified badge (future).
- **Profile Actions**: Visitors can follow, message, gift, or share profile.

## 11. COIN & MONETIZATION SYSTEM
- **Earning Sources**: Reel views, watch time, shares, gifts received, viral reels, challenges, referral system.
- **Wallet System**: Stores total coins, earnings history, gift history, withdrawal history.
- **Withdrawal Rules**: Admin-controlled minimum withdrawal threshold, daily limits, fraud verification, manual review system.

## 12. ADMIN PANEL CONTROL (90% CONTROL SYSTEM)
Master control center details moved to Document 3.

## 13. PUSH NOTIFICATION SYSTEM
Notifications for: Likes, Comments, Followers, Gifts, Trending status, Nearby viral alerts.

## 14. PERFORMANCE REQUIREMENTS
Optimized for: Low-end Android devices, slow internet, low RAM phones.
- **Goals**: Fast loading, smooth scrolling, low data usage, fast uploads, low battery consumption.

## 15. FUTURE SCALING FEATURES
Roadmap: AI feed recommendation, Live streaming, Coin gifting battles, Creator subscriptions, Ads monetization, Brand collaboration marketplace, AI moderation, AI editing tools, Music integration.

## 16. RECOMMENDED TECH STACK
- **Frontend**: React Native
- **Backend**: Node.js + NestJS
- **Database**: PostgreSQL
- **Cache**: Redis
- **Video Processing**: FFmpeg
- **Cloud Storage**: AWS S3
- **CDN**: CloudFront
- **Real-Time Features**: Socket.io
- **Admin Panel**: Next.js

## 17. FINAL PRODUCT GOAL
The platform is designed to become:
- India’s hyperlocal creator ecosystem
- A dopamine-driven engagement platform
- A reward-based creator economy
- A scalable short-video social network

**Core Formula**: Infinite Reels + Nearby Discovery + Mood-Based Recommendation + Coin Rewards + Gifts + Social Validation + Strong Admin Governance = High Retention.
