# Qripr

Qripr is a session-based secure sharing app. It allows guest and registered users to create sessions, exchange device info and keys, and upgrade to Pro for extended features.

## 🚀 Features
### Guest Users

Can create sessions without an account.

Each session has:

A creator public/private key pair (ECDH P-256).

A creatorDevice entry containing device info.

A default device limit (e.g. 2).

Session IDs are stored in IndexedDB so multiple guest users can create sessions before signing in.

### Registered Users

Sessions created as a guest can be migrated to the user account on sign-in:

Fetch session IDs from IndexedDB.

For each ID, fetch from Firestore.

Update userId and owner in Firestore.

Clear migrated session IDs from IndexedDB.

### Account System

Accounts are stored in Firestore under accounts/{userId}.

Fields:

accountType: "free" | "pro"

proSince: date when upgraded to Pro

### Messages

Stored under sessions/{sessionId}/messages.

Creator can see all messages.

Members can only see messages they added.

###Payments

Supports Stripe and Paystack for upgrading to Pro.

### Workflow:

User clicks Upgrade (Stripe or Paystack).

On success, Firestore is updated:

accountType: "pro"

proSince: <date>

A record is written to payments/{transactionId}.

## Database Design
Firestore Collections
accounts/{userId}
  accountType: "free" | "pro"
  proSince: <date>

sessions/{sessionId}
  creatorPublicKeyBase64
  creatorDevice
  deviceLimit
  devices[]
  owner
  userId (if registered)

sessions/{sessionId}/messages/{messageId}
  content
  senderId
  createdAt

payments/{paymentId}
  userId
  amount
  currency
  createdAt
  provider ("stripe" | "paystack")
  status

## IndexedDB Stores
keys
  sessionId -> privateKey (pkcs8)

sessions
  sessionId -> sessionId

## 🛠️ Tech Stack

Next.js 13+ App Router

Firebase Firestore

Stripe & Paystack for payments

IndexedDB (idb library) for guest session persistence

React Hot Toast for notifications

TailwindCSS for styling

## 🔐 Security and Encryption

ECDH (P-256) for key exchange.

Messages are encrypted end-to-end using derived session keys.

Only session members with the correct private key can decrypt.

## ✅ Upgrade Logic

Stripe uses webhook to confirm checkout.session.completed.

Paystack uses /api/paystack/verify endpoint to confirm transactions.

Both trigger the same Firestore updates:

Upgrade account.

Add payment record.

👉 This README keeps our design doc + dev guide in one place.

## ⚙️ Developer Onboarding
1. Clone Repo
git clone https://github.com/your-org/qripr.git
cd qripr

2. Install Dependencies
    ```bash
    npm install 
    ```
    or
    ```bash
    yarn install 
    ``` 

3. Setup Environment Variables
    - Create .env.local at the project root:

    - ### Firebase
        - NEXT_PUBLIC_FIREBASE_API_KEY=xxxx
        - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxxx
        - NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxxx
        - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxxx
        - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxxx
        - NEXT_PUBLIC_FIREBASE_APP_ID=xxxx

    - ### Stripe
        - STRIPE_SECRET_KEY=sk_test_xxx
        - STRIPE_WEBHOOK_SECRET=whsec_xxx

    - ### Paystack
        - PAYSTACK_SECRET_KEY=sk_test_xxx
        - NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxx

4. Firebase Setup

    - Create a Firebase project.

    - Enable Firestore and Authentication (Google, Email/Password).

    - Add your Firebase config to .env.local.

5. Stripe Setup

    - Install Stripe CLI: https://stripe.com/docs/stripe-cli

    - Forward webhooks locally:

    - stripe listen --forward-to localhost:3000/api/stripe/webhook

6. Paystack Setup

    - Register a Paystack account.

    - Add webhook endpoint in dashboard → /api/paystack/verify.

7. Run Dev Server
    ```bash
     npm run dev 
    ```

8. Build for Production
    ```bash
    npm run build
    npm run start
    ```
