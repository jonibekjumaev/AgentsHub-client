/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type AgentCategory =
  | 'AUTOMATION'
  | 'CONTENT'
  | 'CUSTOMER_SUPPORT'
  | 'DATA_ANALYSIS'
  | 'EDUCATION'
  | 'MARKETING'
  | 'OTHER'
  | 'SALES';

export type CpiSearch = {
  categoryList?: Array<AgentCategory> | null | undefined;
  pricesRange?: PricesRange | null | undefined;
  pricingList?: Array<ProductPricing> | null | undefined;
  productStatus?: ProductStatus | null | undefined;
  tagList?: Array<string> | null | undefined;
  text?: string | null | undefined;
};

export type CreatorProductsInquiry = {
  direction?: Direction | null | undefined;
  limit: number;
  page: number;
  search: CpiSearch;
  sort?: string | null | undefined;
};

export type Direction =
  | 'ASC'
  | 'DESC';

export type LoginInput = {
  memberNick: string;
  memberPassword: string;
};

export type MemberAuthType =
  | 'EMAIL'
  | 'PHONE'
  | 'TELEGRAM';

export type MemberInput = {
  memberAuthType?: MemberAuthType | null | undefined;
  memberNick: string;
  memberPassword: string;
  memberPhone: string;
  memberType: MemberType;
};

export type MemberStatus =
  | 'ACTIVE'
  | 'BLOCK'
  | 'DELETE';

export type MemberType =
  | 'ADMIN'
  | 'CREATOR'
  | 'USER';

export type PIsearch = {
  categoryList?: Array<AgentCategory> | null | undefined;
  memberId?: string | null | undefined;
  periodsRange?: PeriodsRange | null | undefined;
  pricesRange?: PricesRange | null | undefined;
  pricingList?: Array<ProductPricing> | null | undefined;
  tagList?: Array<string> | null | undefined;
  text?: string | null | undefined;
};

export type PeriodsRange = {
  end: string;
  start: string;
};

export type PricesRange = {
  end: number;
  start: number;
};

export type ProductPricing =
  | 'CUSTOM'
  | 'FREE'
  | 'ONE_TIME'
  | 'SUBSCRIPTION';

export type ProductStatus =
  | 'ACTIVE'
  | 'DELETE'
  | 'PAUSED';

export type ProductUpdate = {
  _id: string;
  productCategory?: AgentCategory | null | undefined;
  productDemoUrl?: string | null | undefined;
  productDesc?: string | null | undefined;
  productImages?: Array<string> | null | undefined;
  productPrice?: number | null | undefined;
  productPricing?: ProductPricing | null | undefined;
  productStatus?: ProductStatus | null | undefined;
  productTags?: Array<string> | null | undefined;
  productTitle?: string | null | undefined;
};

export type ProductsInquiry = {
  direction?: Direction | null | undefined;
  limit: number;
  page: number;
  search: PIsearch;
  sort?: string | null | undefined;
};

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { getMe: { _id: string, memberType: MemberType, memberStatus: MemberStatus, memberNick: string, memberFullName: string | null, memberImage: string, memberPhone: string, memberEmail: string | null, memberWhatsapp: string | null } };

export type AgentDetailQueryVariables = Exact<{
  productId: string;
}>;


export type AgentDetailQuery = { getProduct: { _id: string, productTitle: string, productDesc: string, productStatus: ProductStatus, productCategory: AgentCategory, productPricing: ProductPricing, productPrice: number | null, productDemoUrl: string | null, productTags: Array<string> | null, productImages: Array<string>, productLikes: number, productViews: number, productComments: number, updatedAt: string, memberData: { _id: string, memberNick: string, memberFullName: string | null, memberImage: string, memberProducts: number, memberFollowers: number } | null } };

export type AgentViewerQueryVariables = Exact<{
  productId: string;
}>;


export type AgentViewerQuery = { getProduct: { _id: string, productViews: number, meLiked: Array<{ memberId: string, likeRefId: string, myFavorite: boolean }> | null, memberData: { _id: string, memberEmail: string | null, memberWhatsapp: string | null } | null } };

export type LikeAgentMutationVariables = Exact<{
  productId: string;
}>;


export type LikeAgentMutation = { likeTargetProduct: { _id: string, productLikes: number } };

export type AgentCardFragment = { _id: string, productTitle: string, productCategory: AgentCategory, productPricing: ProductPricing, productPrice: number | null, productImages: Array<string>, productLikes: number, productViews: number, memberData: { _id: string, memberNick: string } | null };

export type AgentsListQueryVariables = Exact<{
  input: ProductsInquiry;
}>;


export type AgentsListQuery = { getProducts: { list: Array<{ _id: string, productTitle: string, productCategory: AgentCategory, productPricing: ProductPricing, productPrice: number | null, productImages: Array<string>, productLikes: number, productViews: number, memberData: { _id: string, memberNick: string } | null }>, metaCounter: Array<{ total: number | null }> | null } };

export type CreatorAgentRowFragment = { _id: string, productTitle: string, productCategory: AgentCategory, productStatus: ProductStatus, productPricing: ProductPricing, productPrice: number | null, productImages: Array<string>, productViews: number, productLikes: number, productComments: number, updatedAt: string };

export type CreatorAgentsQueryVariables = Exact<{
  input: CreatorProductsInquiry;
}>;


export type CreatorAgentsQuery = { list: { list: Array<{ _id: string, productTitle: string, productCategory: AgentCategory, productStatus: ProductStatus, productPricing: ProductPricing, productPrice: number | null, productImages: Array<string>, productViews: number, productLikes: number, productComments: number, updatedAt: string }>, metaCounter: Array<{ total: number | null }> | null }, active: { metaCounter: Array<{ total: number | null }> | null }, paused: { metaCounter: Array<{ total: number | null }> | null } };

export type UpdateAgentStatusMutationVariables = Exact<{
  input: ProductUpdate;
}>;


export type UpdateAgentStatusMutation = { updateProduct: { _id: string, productStatus: ProductStatus, updatedAt: string } };

export type LoginMutationVariables = Exact<{
  input: LoginInput;
}>;


export type LoginMutation = { login: { _id: string, memberType: MemberType, accessToken: string | null } };

export type SignupMutationVariables = Exact<{
  input: MemberInput;
}>;


export type SignupMutation = { signup: { _id: string, memberType: MemberType, accessToken: string | null } };

export type CreatorStatsQueryVariables = Exact<{ [key: string]: never; }>;


export type CreatorStatsQuery = { getMe: { _id: string, memberProducts: number, memberViews: number, memberLikes: number, memberFollowers: number } };

export type DevApiProductsQueryVariables = Exact<{
  input: ProductsInquiry;
}>;


export type DevApiProductsQuery = { getProducts: { list: Array<{ _id: string, productTitle: string, productCategory: AgentCategory, productPricing: ProductPricing, productPrice: number | null, productLikes: number, productViews: number }>, metaCounter: Array<{ total: number | null }> | null } };

export const AgentCardFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AgentCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"productTitle"}},{"kind":"Field","name":{"kind":"Name","value":"productCategory"}},{"kind":"Field","name":{"kind":"Name","value":"productPricing"}},{"kind":"Field","name":{"kind":"Name","value":"productPrice"}},{"kind":"Field","name":{"kind":"Name","value":"productImages"}},{"kind":"Field","name":{"kind":"Name","value":"productLikes"}},{"kind":"Field","name":{"kind":"Name","value":"productViews"}},{"kind":"Field","name":{"kind":"Name","value":"memberData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"memberNick"}}]}}]}}]} as unknown as DocumentNode<AgentCardFragment, unknown>;
export const CreatorAgentRowFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CreatorAgentRow"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"productTitle"}},{"kind":"Field","name":{"kind":"Name","value":"productCategory"}},{"kind":"Field","name":{"kind":"Name","value":"productStatus"}},{"kind":"Field","name":{"kind":"Name","value":"productPricing"}},{"kind":"Field","name":{"kind":"Name","value":"productPrice"}},{"kind":"Field","name":{"kind":"Name","value":"productImages"}},{"kind":"Field","name":{"kind":"Name","value":"productViews"}},{"kind":"Field","name":{"kind":"Name","value":"productLikes"}},{"kind":"Field","name":{"kind":"Name","value":"productComments"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<CreatorAgentRowFragment, unknown>;
export const MeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getMe"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"memberType"}},{"kind":"Field","name":{"kind":"Name","value":"memberStatus"}},{"kind":"Field","name":{"kind":"Name","value":"memberNick"}},{"kind":"Field","name":{"kind":"Name","value":"memberFullName"}},{"kind":"Field","name":{"kind":"Name","value":"memberImage"}},{"kind":"Field","name":{"kind":"Name","value":"memberPhone"}},{"kind":"Field","name":{"kind":"Name","value":"memberEmail"}},{"kind":"Field","name":{"kind":"Name","value":"memberWhatsapp"}}]}}]}}]} as unknown as DocumentNode<MeQuery, MeQueryVariables>;
export const AgentDetailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AgentDetail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"productId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getProduct"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"productId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"productId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"productTitle"}},{"kind":"Field","name":{"kind":"Name","value":"productDesc"}},{"kind":"Field","name":{"kind":"Name","value":"productStatus"}},{"kind":"Field","name":{"kind":"Name","value":"productCategory"}},{"kind":"Field","name":{"kind":"Name","value":"productPricing"}},{"kind":"Field","name":{"kind":"Name","value":"productPrice"}},{"kind":"Field","name":{"kind":"Name","value":"productDemoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"productTags"}},{"kind":"Field","name":{"kind":"Name","value":"productImages"}},{"kind":"Field","name":{"kind":"Name","value":"productLikes"}},{"kind":"Field","name":{"kind":"Name","value":"productViews"}},{"kind":"Field","name":{"kind":"Name","value":"productComments"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"memberData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"memberNick"}},{"kind":"Field","name":{"kind":"Name","value":"memberFullName"}},{"kind":"Field","name":{"kind":"Name","value":"memberImage"}},{"kind":"Field","name":{"kind":"Name","value":"memberProducts"}},{"kind":"Field","name":{"kind":"Name","value":"memberFollowers"}}]}}]}}]}}]} as unknown as DocumentNode<AgentDetailQuery, AgentDetailQueryVariables>;
export const AgentViewerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AgentViewer"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"productId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getProduct"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"productId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"productId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"productViews"}},{"kind":"Field","name":{"kind":"Name","value":"meLiked"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"memberId"}},{"kind":"Field","name":{"kind":"Name","value":"likeRefId"}},{"kind":"Field","name":{"kind":"Name","value":"myFavorite"}}]}},{"kind":"Field","name":{"kind":"Name","value":"memberData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"memberEmail"}},{"kind":"Field","name":{"kind":"Name","value":"memberWhatsapp"}}]}}]}}]}}]} as unknown as DocumentNode<AgentViewerQuery, AgentViewerQueryVariables>;
export const LikeAgentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"LikeAgent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"productId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"likeTargetProduct"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"productId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"productId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"productLikes"}}]}}]}}]} as unknown as DocumentNode<LikeAgentMutation, LikeAgentMutationVariables>;
export const AgentsListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AgentsList"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ProductsInquiry"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getProducts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"list"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AgentCard"}}]}},{"kind":"Field","name":{"kind":"Name","value":"metaCounter"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AgentCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"productTitle"}},{"kind":"Field","name":{"kind":"Name","value":"productCategory"}},{"kind":"Field","name":{"kind":"Name","value":"productPricing"}},{"kind":"Field","name":{"kind":"Name","value":"productPrice"}},{"kind":"Field","name":{"kind":"Name","value":"productImages"}},{"kind":"Field","name":{"kind":"Name","value":"productLikes"}},{"kind":"Field","name":{"kind":"Name","value":"productViews"}},{"kind":"Field","name":{"kind":"Name","value":"memberData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"memberNick"}}]}}]}}]} as unknown as DocumentNode<AgentsListQuery, AgentsListQueryVariables>;
export const CreatorAgentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CreatorAgents"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreatorProductsInquiry"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"list"},"name":{"kind":"Name","value":"getCreatorProducts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"list"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CreatorAgentRow"}}]}},{"kind":"Field","name":{"kind":"Name","value":"metaCounter"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"active"},"name":{"kind":"Name","value":"getCreatorProducts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"page"},"value":{"kind":"IntValue","value":"1"}},{"kind":"ObjectField","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"1"}},{"kind":"ObjectField","name":{"kind":"Name","value":"search"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"productStatus"},"value":{"kind":"EnumValue","value":"ACTIVE"}}]}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"metaCounter"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"paused"},"name":{"kind":"Name","value":"getCreatorProducts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"page"},"value":{"kind":"IntValue","value":"1"}},{"kind":"ObjectField","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"1"}},{"kind":"ObjectField","name":{"kind":"Name","value":"search"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"productStatus"},"value":{"kind":"EnumValue","value":"PAUSED"}}]}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"metaCounter"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CreatorAgentRow"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"productTitle"}},{"kind":"Field","name":{"kind":"Name","value":"productCategory"}},{"kind":"Field","name":{"kind":"Name","value":"productStatus"}},{"kind":"Field","name":{"kind":"Name","value":"productPricing"}},{"kind":"Field","name":{"kind":"Name","value":"productPrice"}},{"kind":"Field","name":{"kind":"Name","value":"productImages"}},{"kind":"Field","name":{"kind":"Name","value":"productViews"}},{"kind":"Field","name":{"kind":"Name","value":"productLikes"}},{"kind":"Field","name":{"kind":"Name","value":"productComments"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<CreatorAgentsQuery, CreatorAgentsQueryVariables>;
export const UpdateAgentStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateAgentStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ProductUpdate"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProduct"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"productStatus"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpdateAgentStatusMutation, UpdateAgentStatusMutationVariables>;
export const LoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Login"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LoginInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"memberType"}},{"kind":"Field","name":{"kind":"Name","value":"accessToken"}}]}}]}}]} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;
export const SignupDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Signup"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MemberInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"signup"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"memberType"}},{"kind":"Field","name":{"kind":"Name","value":"accessToken"}}]}}]}}]} as unknown as DocumentNode<SignupMutation, SignupMutationVariables>;
export const CreatorStatsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CreatorStats"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getMe"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"memberProducts"}},{"kind":"Field","name":{"kind":"Name","value":"memberViews"}},{"kind":"Field","name":{"kind":"Name","value":"memberLikes"}},{"kind":"Field","name":{"kind":"Name","value":"memberFollowers"}}]}}]}}]} as unknown as DocumentNode<CreatorStatsQuery, CreatorStatsQueryVariables>;
export const DevApiProductsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DevApiProducts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ProductsInquiry"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getProducts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"list"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"productTitle"}},{"kind":"Field","name":{"kind":"Name","value":"productCategory"}},{"kind":"Field","name":{"kind":"Name","value":"productPricing"}},{"kind":"Field","name":{"kind":"Name","value":"productPrice"}},{"kind":"Field","name":{"kind":"Name","value":"productLikes"}},{"kind":"Field","name":{"kind":"Name","value":"productViews"}}]}},{"kind":"Field","name":{"kind":"Name","value":"metaCounter"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}}]}}]} as unknown as DocumentNode<DevApiProductsQuery, DevApiProductsQueryVariables>;