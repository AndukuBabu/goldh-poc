import { users, type User, type InsertUser, type NewsArticle, type LearningTopic } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserWallet(id: string, walletAddress: string, isPremium: boolean): Promise<User | undefined>;
  getNewsArticles(): Promise<NewsArticle[]>;
  getLearningTopics(): Promise<LearningTopic[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserWallet(id: string, walletAddress: string, isPremium: boolean): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ walletAddress, isPremium })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getNewsArticles(): Promise<NewsArticle[]> {
    return [
      { id: "1", title: "Bitcoin surges past $50K as institutional adoption grows", url: "#", publishedAt: new Date().toISOString() },
      { id: "2", title: "Ethereum 2.0 staking rewards reach new highs", url: "#", publishedAt: new Date().toISOString() },
      { id: "3", title: "DeFi protocols see 200% growth in TVL this quarter", url: "#", publishedAt: new Date().toISOString() },
    ];
  }

  async getLearningTopics(): Promise<LearningTopic[]> {
    return [
      {
        id: "blockchain",
        title: "Blockchain Basics",
        question: "What is Blockchain?",
        answer: "A blockchain is a digital ledger that records transactions across many computers. Think of it like a shared notebook that everyone can read, but no one can erase or change past entries. Each 'block' contains a group of transactions, and they're linked together in a 'chain' - hence the name! This technology makes crypto secure and transparent.",
        relatedTopics: ["smart-contract", "token"]
      },
      {
        id: "wallet",
        title: "Crypto Wallets",
        question: "What is a Wallet?",
        answer: "A crypto wallet is like your digital bank account for cryptocurrency. It stores your 'keys' (think of them as passwords) that let you send and receive crypto. There are different types: software wallets (apps on your phone/computer), hardware wallets (physical devices), and web wallets. Your wallet doesn't actually store the crypto - it stores the keys to access your crypto on the blockchain!",
        relatedTopics: ["blockchain", "token"]
      },
      {
        id: "airdrop",
        title: "Airdrops",
        question: "What is an Airdrop?",
        answer: "An airdrop is when a crypto project gives away free tokens to users. It's like a promotional giveaway! Projects do this to build their community, reward early supporters, or generate buzz. To qualify, you usually need to hold certain tokens, follow social media accounts, or complete simple tasks. It's essentially free crypto, but always verify the source to avoid scams!",
        relatedTopics: ["token", "wallet"]
      },
      {
        id: "token",
        title: "Tokens vs Coins",
        question: "What is a Token (vs Coin)?",
        answer: "Coins and tokens are both cryptocurrencies, but there's a key difference. Coins (like Bitcoin or Ethereum) have their own blockchain. Tokens are built on top of existing blockchains - for example, many tokens run on the Ethereum blockchain. Think of it this way: coins are like dollars and euros (their own currency), while tokens are like gift cards or loyalty points that work within a specific system.",
        relatedTopics: ["blockchain", "airdrop", "smart-contract"]
      },
      {
        id: "staking",
        title: "Staking",
        question: "What is Staking?",
        answer: "Staking is like putting your crypto in a savings account to earn interest. You 'lock up' your tokens to help secure the blockchain network, and in return, you earn rewards (more tokens!). It's a way to make passive income from crypto you're holding anyway. Different platforms offer different staking rewards (APY), and some require you to lock your tokens for a specific period.",
        relatedTopics: ["apy", "token"]
      },
      {
        id: "tvl",
        title: "Total Value Locked",
        question: "What is TVL (Total Value Locked)?",
        answer: "TVL measures how much money (in crypto) is deposited in a DeFi (Decentralized Finance) protocol. It's like measuring how much money is in a bank's vaults. A higher TVL usually means more people trust the protocol. For example, if a staking platform has $100 million TVL, that means users have deposited $100 million worth of crypto into it. It's a good indicator of a protocol's popularity and trustworthiness!",
        relatedTopics: ["staking", "apy"]
      },
      {
        id: "apy",
        title: "Annual Percentage Yield",
        question: "What is APY?",
        answer: "APY (Annual Percentage Yield) shows how much you can earn on your crypto in a year, including compound interest. If you stake $1,000 with 10% APY, you'd earn about $100 in a year. The higher the APY, the more you earn - but remember, higher returns often come with higher risks! Always research before committing your funds.",
        relatedTopics: ["staking", "tvl"]
      },
      {
        id: "smart-contract",
        title: "Smart Contracts",
        question: "What is a Smart Contract?",
        answer: "A smart contract is like a digital agreement that automatically executes when conditions are met. Imagine a vending machine: you put in money, select an item, and the machine automatically gives you that item. Smart contracts work the same way on the blockchain - they're programmed to do things automatically when certain conditions are true, without needing a middleman. They power most DeFi applications!",
        relatedTopics: ["blockchain", "bsc"]
      },
      {
        id: "bsc",
        title: "BNB Smart Chain",
        question: "What is the BNB Smart Chain?",
        answer: "The BNB Smart Chain (formerly Binance Smart Chain) is a blockchain network created by Binance. It's similar to Ethereum but generally faster and cheaper to use. Many tokens and DeFi apps run on BSC because transaction fees are much lower. Think of it as an alternative highway that's less congested and cheaper to drive on, but still gets you to similar destinations!",
        relatedTopics: ["blockchain", "smart-contract", "token"]
      },
      {
        id: "goldh",
        title: "GOLDH Platform",
        question: "What is the GOLDH platform?",
        answer: "GOLDH (Golden Horizon) is your comprehensive crypto intelligence platform designed for everyone - from beginners to experienced traders. We provide real-time market insights, educational resources, portfolio tracking, and community features all in one place. Our mission is to make crypto accessible and understandable while helping you build wealth and bridge into the digital asset world. Premium members with 5000+ GOLDH tokens get exclusive features and early access to new tools!",
        relatedTopics: ["blockchain", "wallet", "token"]
      }
    ];
  }
}

export const storage = new DatabaseStorage();
