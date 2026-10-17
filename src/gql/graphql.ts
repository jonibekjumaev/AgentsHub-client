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

export type Direction =
  | 'ASC'
  | 'DESC';

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

export type ProductsInquiry = {
  direction?: Direction | null | undefined;
  limit: number;
  page: number;
  search: PIsearch;
  sort?: string | null | undefined;
};

export type DevApiProductsQueryVariables = Exact<{
  input: ProductsInquiry;
}>;


export type DevApiProductsQuery = { getProducts: { list: Array<{ _id: string, productTitle: string, productCategory: AgentCategory, productPricing: ProductPricing, productPrice: number | null, productLikes: number, productViews: number }>, metaCounter: Array<{ total: number | null }> | null } };


export const DevApiProductsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DevApiProducts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ProductsInquiry"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getProducts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"list"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"productTitle"}},{"kind":"Field","name":{"kind":"Name","value":"productCategory"}},{"kind":"Field","name":{"kind":"Name","value":"productPricing"}},{"kind":"Field","name":{"kind":"Name","value":"productPrice"}},{"kind":"Field","name":{"kind":"Name","value":"productLikes"}},{"kind":"Field","name":{"kind":"Name","value":"productViews"}}]}},{"kind":"Field","name":{"kind":"Name","value":"metaCounter"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}}]}}]} as unknown as DocumentNode<DevApiProductsQuery, DevApiProductsQueryVariables>;