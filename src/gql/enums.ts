export const AgentCategory = {
  Automation: 'AUTOMATION',
  Content: 'CONTENT',
  CustomerSupport: 'CUSTOMER_SUPPORT',
  DataAnalysis: 'DATA_ANALYSIS',
  Education: 'EDUCATION',
  Marketing: 'MARKETING',
  Other: 'OTHER',
  Sales: 'SALES'
} as const;

export type AgentCategory = typeof AgentCategory[keyof typeof AgentCategory];
export const BoardArticleCategory = {
  Free: 'FREE',
  Humor: 'HUMOR',
  News: 'NEWS',
  Recommend: 'RECOMMEND'
} as const;

export type BoardArticleCategory = typeof BoardArticleCategory[keyof typeof BoardArticleCategory];
export const BoardArticleStatus = {
  Active: 'ACTIVE',
  Delete: 'DELETE'
} as const;

export type BoardArticleStatus = typeof BoardArticleStatus[keyof typeof BoardArticleStatus];
export const BriefStatus = {
  Closed: 'CLOSED',
  Delete: 'DELETE',
  Open: 'OPEN'
} as const;

export type BriefStatus = typeof BriefStatus[keyof typeof BriefStatus];
export const CommentGroup = {
  Article: 'ARTICLE',
  Brief: 'BRIEF',
  Member: 'MEMBER',
  Product: 'PRODUCT'
} as const;

export type CommentGroup = typeof CommentGroup[keyof typeof CommentGroup];
export const CommentStatus = {
  Active: 'ACTIVE',
  Delete: 'DELETE'
} as const;

export type CommentStatus = typeof CommentStatus[keyof typeof CommentStatus];
export const Direction = {
  Asc: 'ASC',
  Desc: 'DESC'
} as const;

export type Direction = typeof Direction[keyof typeof Direction];
export const MemberAuthType = {
  Email: 'EMAIL',
  Phone: 'PHONE',
  Telegram: 'TELEGRAM'
} as const;

export type MemberAuthType = typeof MemberAuthType[keyof typeof MemberAuthType];
export const MemberStatus = {
  Active: 'ACTIVE',
  Block: 'BLOCK',
  Delete: 'DELETE'
} as const;

export type MemberStatus = typeof MemberStatus[keyof typeof MemberStatus];
export const MemberType = {
  Admin: 'ADMIN',
  Creator: 'CREATOR',
  User: 'USER'
} as const;

export type MemberType = typeof MemberType[keyof typeof MemberType];
export const ProductPricing = {
  Custom: 'CUSTOM',
  Free: 'FREE',
  OneTime: 'ONE_TIME',
  Subscription: 'SUBSCRIPTION'
} as const;

export type ProductPricing = typeof ProductPricing[keyof typeof ProductPricing];
export const ProductStatus = {
  Active: 'ACTIVE',
  Delete: 'DELETE',
  Paused: 'PAUSED'
} as const;

export type ProductStatus = typeof ProductStatus[keyof typeof ProductStatus];