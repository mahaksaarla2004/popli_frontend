---
type: product-spec
created: 2026-06-02
updated: 2026-06-02
---

# Document 2: Short Video Creator Ecosystem Product Requirement & Development Document (Updated Version)

## 1. PRODUCT OVERVIEW
This platform is a creator-first short video ecosystem designed for India’s Tier 2, Tier 3 and Tier 4 users. Unlike traditional social platforms where creators and viewers are treated separately, this platform follows a unified user model: Every user can consume content, upload content, interact socially, and earn rewards.

The product is designed around:
- Dopamine-driven engagement psychology
- Reward-based creator motivation
- Localized discovery
- Lightweight mobile performance
- Admin-controlled platform governance

The goal is to build:
- High engagement
- Daily active usage
- Consistent content uploads
- Strong creator retention
- Controlled monetization

## 2. CORE PRODUCT PHILOSOPHY
The platform is based on 5 psychological pillars:

### 2.1 Instant Gratification
Users should receive:
- Instant likes
- Instant views
- Instant coin increments
- Fast notifications
- Immediate visibility
*Purpose: To create addictive feedback loops.*

### 2.2 Social Validation
Humans are emotionally driven by recognition. The platform continuously shows:
- Followers
- Likes
- Trending badges
- Nearby popularity
- Viral indicators
*Purpose: To motivate repeated uploads and social competition.*

### 2.3 Fear of Missing Out (FOMO)
The feed continuously refreshes:
- Nearby viral content
- Trending creators
- Local city trends
- Rising creators
*Purpose: To increase daily app opens.*

### 2.4 Variable Reward Psychology
Users never know:
- Which video will go viral
- Which upload will gain followers
- Which content earns more coins
*This unpredictability increases addiction and retention.*

### 2.5 Local Identity Psychology
Users emotionally connect more with:
- Their city
- Their language
- Nearby creators
- Local trends
*This becomes a major engagement engine.*

## 3. USER SYSTEM ARCHITECTURE (Unified User Model)
Every user account has:
- **Viewer Capabilities**: Watch videos, Like, Comment, Share, Save, Follow, Message.
- **Creator Capabilities**: Upload videos, Edit profile, Earn coins, Access analytics, Build followers.
*No separate creator registration required.*

## 4. COMPLETE USER FLOW

### 4.1 USER ONBOARDING FLOW
- **Step 1: App Open**: User opens app. Immediately shown trending videos, nearby viral content, and regional content (minimal friction onboarding).
- **Step 2: Login**: Options include Mobile OTP, Google login, or Guest browsing (limited).
- **Step 3: Interest Selection**: User selects language, content interests, and city/location for initial feed personalization.
- **Step 4: Feed Entry**: User lands directly into an infinite vertical reel feed (auto-play starts instantly).

### 4.2 CONTENT CONSUMPTION FLOW (Feed Types)
- **A. For You Feed**: Based on watch time, likes, shares, scroll speed, and repeat watches.
- **B. Nearby Feed (IMPORTANT Differentiator)**: Users see nearby creators, same city content, local trending videos, and nearby viral creators. Nearby logic is based on GPS, City, IP signals, and regional preferences. (Purpose: Hyperlocal engagement, local fame psychology, stronger emotional connection).
- **C. Trending Feed**: Based on fastest growing videos, high engagement velocity, coin earning spikes, and share ratio.
- **D. Following Feed**: Only followed creators.

### 4.3 VIDEO INTERACTION FLOW
Each video supports: Like, Comment, Share, Save, Follow creator, Send message, Report content. Interaction triggers real-time counters, notification delivery, and feed ranking boost.

### 4.4 VIDEO UPLOAD FLOW
- **Step 1**: Persistent floating upload button.
- **Step 2**: Select upload type (Record video or Upload from gallery).
- **Step 3**: Basic editing MVP (Trim, Caption, Tags, Hashtags, Thumbnail selection).
- **Step 4**: Upload optimization (compresses video, generates thumbnails, creates adaptive resolutions, optimizes for low bandwidth).
- **Step 5**: Publish video (instantly enters nearby feed, test audience feed, and trending pipeline).

### 4.5 VIRALITY DISTRIBUTION LOGIC
- **Phase 1: Local Testing**: Shown to nearby users and similar interest users. Metrics checked: watch completion, rewatch rate, likes, shares, comment velocity.
- **Phase 2: Regional Expansion**: If engagement is strong, expanded to regional audience.
- **Phase 3: National Trending**: If high retention remains, added to national feed.
*Creates hope psychology, viral possibility, and retention motivation.*

## 5. MONETIZATION SYSTEM (Virtual Coin Economy)
- **Earning Coins**: Users earn coins through video views, shares, watch time, follower growth, challenge participation, and the referral system.
- **Coin Psychology**: Coins are shown prominently on profile, during uploads, and on achievements through animations to create motivation.
- **Withdrawal System**: Users can convert coins into money under conditions: minimum threshold, fraud verification, engagement quality checks, and admin approval.

## 6. ADMIN PANEL CONTROL (90% CONTROL SYSTEM)
Details matching Document 3.

## 7. RECOMMENDATION ENGINE (Psychology-Based)
Optimizes for addiction, retention, and emotional engagement using:
- **Behavioral Signals**: Watch duration, scroll speed, pause time, repeat views, like ratio.
- **Emotional Signals**: Content similarity, locality, viral excitement, creator familiarity.
- **Social Signals**: Friends interactions, nearby popularity, shared content.
- **Priorities**: 1. Watch completion, 2. Rewatch percentage, 3. Shares, 4. Comment quality, 5. Local relevance, 6. Session retention impact.

## 8. NEARBY FEED SYSTEM (Core Feature)
Strongest growth mechanism showing creators near user, same city videos, local viral content, and nearby trends. Works psychologically because users feel local pride, accessibility, and higher relatability, improving shares, comments, and follower conversion.

## 9. FUTURE SCALING FEATURES
AI recommendation, Live streaming, Coin gifting, Creator subscriptions, Ads monetization, Brand collaborations marketplace, AI moderation, Music integration, AI editing tools.

## 10. TECH STACK RECOMMENDATION
- **Frontend**: React Native
- **Backend**: Node.js + NestJS
- **Database**: PostgreSQL & Redis cache
- **Video Infrastructure**: AWS S3, CloudFront CDN, FFmpeg processing
- **Real-time**: Socket.io
- **Admin Panel**: Next.js

## 11. SCALABILITY REQUIREMENTS
Supports millions of videos, concurrent streaming, real-time feed ranking, high notification load, and fast uploads.

## 12. SUCCESS METRICS
Daily uploads, watch time, creator retention, average session duration, upload frequency, coin participation, and nearby feed engagement.
