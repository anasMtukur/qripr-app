export interface Session {
    id?: string;
    type?: 'free'|'pro';
    creatorPublicKeyBase64: string;
    deviceLimit: number;
    deviceCount: number;
    encryption: string;
    createdAt: string;
    owner?: SessionOwner;
    creatorDevice?: any;
    devices?: [any];
}

export interface SessionOwner {
    id?: string;
    displayName: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    lastLoginAt: string;
    photoURL: string;
}

export interface JoinSessionResult {
    sharedKey: CryptoKey;
    keyPair: CryptoKeyPair;
}

export type RefineAction = 'summarize' | 'elaborate' | 'formalize' | 'shorten';
export type Provider = 'groq' | 'openai' | 'anthropic';

export interface RefineRequest {
  text: string;
  provider?: Provider;
  action: RefineAction;
  userId: string;
}
