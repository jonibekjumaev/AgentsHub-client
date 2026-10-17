/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n\tquery Me {\n\t\tgetMe {\n\t\t\t_id\n\t\t\tmemberType\n\t\t\tmemberStatus\n\t\t\tmemberNick\n\t\t\tmemberFullName\n\t\t\tmemberImage\n\t\t\tmemberPhone\n\t\t\tmemberEmail\n\t\t\tmemberWhatsapp\n\t\t}\n\t}\n": typeof types.MeDocument,
    "\n\tmutation Login($input: LoginInput!) {\n\t\tlogin(input: $input) {\n\t\t\t_id\n\t\t\tmemberType\n\t\t\taccessToken\n\t\t}\n\t}\n": typeof types.LoginDocument,
    "\n\tmutation Signup($input: MemberInput!) {\n\t\tsignup(input: $input) {\n\t\t\t_id\n\t\t\tmemberType\n\t\t\taccessToken\n\t\t}\n\t}\n": typeof types.SignupDocument,
    "\n\tquery DevApiProducts($input: ProductsInquiry!) {\n\t\tgetProducts(input: $input) {\n\t\t\tlist {\n\t\t\t\t_id\n\t\t\t\tproductTitle\n\t\t\t\tproductCategory\n\t\t\t\tproductPricing\n\t\t\t\tproductPrice\n\t\t\t\tproductLikes\n\t\t\t\tproductViews\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n": typeof types.DevApiProductsDocument,
};
const documents: Documents = {
    "\n\tquery Me {\n\t\tgetMe {\n\t\t\t_id\n\t\t\tmemberType\n\t\t\tmemberStatus\n\t\t\tmemberNick\n\t\t\tmemberFullName\n\t\t\tmemberImage\n\t\t\tmemberPhone\n\t\t\tmemberEmail\n\t\t\tmemberWhatsapp\n\t\t}\n\t}\n": types.MeDocument,
    "\n\tmutation Login($input: LoginInput!) {\n\t\tlogin(input: $input) {\n\t\t\t_id\n\t\t\tmemberType\n\t\t\taccessToken\n\t\t}\n\t}\n": types.LoginDocument,
    "\n\tmutation Signup($input: MemberInput!) {\n\t\tsignup(input: $input) {\n\t\t\t_id\n\t\t\tmemberType\n\t\t\taccessToken\n\t\t}\n\t}\n": types.SignupDocument,
    "\n\tquery DevApiProducts($input: ProductsInquiry!) {\n\t\tgetProducts(input: $input) {\n\t\t\tlist {\n\t\t\t\t_id\n\t\t\t\tproductTitle\n\t\t\t\tproductCategory\n\t\t\t\tproductPricing\n\t\t\t\tproductPrice\n\t\t\t\tproductLikes\n\t\t\t\tproductViews\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n": types.DevApiProductsDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tquery Me {\n\t\tgetMe {\n\t\t\t_id\n\t\t\tmemberType\n\t\t\tmemberStatus\n\t\t\tmemberNick\n\t\t\tmemberFullName\n\t\t\tmemberImage\n\t\t\tmemberPhone\n\t\t\tmemberEmail\n\t\t\tmemberWhatsapp\n\t\t}\n\t}\n"): (typeof documents)["\n\tquery Me {\n\t\tgetMe {\n\t\t\t_id\n\t\t\tmemberType\n\t\t\tmemberStatus\n\t\t\tmemberNick\n\t\t\tmemberFullName\n\t\t\tmemberImage\n\t\t\tmemberPhone\n\t\t\tmemberEmail\n\t\t\tmemberWhatsapp\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tmutation Login($input: LoginInput!) {\n\t\tlogin(input: $input) {\n\t\t\t_id\n\t\t\tmemberType\n\t\t\taccessToken\n\t\t}\n\t}\n"): (typeof documents)["\n\tmutation Login($input: LoginInput!) {\n\t\tlogin(input: $input) {\n\t\t\t_id\n\t\t\tmemberType\n\t\t\taccessToken\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tmutation Signup($input: MemberInput!) {\n\t\tsignup(input: $input) {\n\t\t\t_id\n\t\t\tmemberType\n\t\t\taccessToken\n\t\t}\n\t}\n"): (typeof documents)["\n\tmutation Signup($input: MemberInput!) {\n\t\tsignup(input: $input) {\n\t\t\t_id\n\t\t\tmemberType\n\t\t\taccessToken\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tquery DevApiProducts($input: ProductsInquiry!) {\n\t\tgetProducts(input: $input) {\n\t\t\tlist {\n\t\t\t\t_id\n\t\t\t\tproductTitle\n\t\t\t\tproductCategory\n\t\t\t\tproductPricing\n\t\t\t\tproductPrice\n\t\t\t\tproductLikes\n\t\t\t\tproductViews\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n"): (typeof documents)["\n\tquery DevApiProducts($input: ProductsInquiry!) {\n\t\tgetProducts(input: $input) {\n\t\t\tlist {\n\t\t\t\t_id\n\t\t\t\tproductTitle\n\t\t\t\tproductCategory\n\t\t\t\tproductPricing\n\t\t\t\tproductPrice\n\t\t\t\tproductLikes\n\t\t\t\tproductViews\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;