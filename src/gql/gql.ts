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
    "\n\tquery AgentDetail($productId: String!) {\n\t\tgetProduct(productId: $productId) {\n\t\t\t_id\n\t\t\tproductTitle\n\t\t\tproductDesc\n\t\t\tproductStatus\n\t\t\tproductCategory\n\t\t\tproductPricing\n\t\t\tproductPrice\n\t\t\tproductDemoUrl\n\t\t\tproductTags\n\t\t\tproductImages\n\t\t\tproductLikes\n\t\t\tproductViews\n\t\t\tproductComments\n\t\t\tupdatedAt\n\t\t\tmemberData {\n\t\t\t\t_id\n\t\t\t\tmemberNick\n\t\t\t\tmemberFullName\n\t\t\t\tmemberImage\n\t\t\t\tmemberProducts\n\t\t\t\tmemberFollowers\n\t\t\t}\n\t\t}\n\t}\n": typeof types.AgentDetailDocument,
    "\n\tquery AgentViewer($productId: String!) {\n\t\tgetProduct(productId: $productId) {\n\t\t\t_id\n\t\t\tproductViews\n\t\t\tmeLiked {\n\t\t\t\tmemberId\n\t\t\t\tlikeRefId\n\t\t\t\tmyFavorite\n\t\t\t}\n\t\t\tmemberData {\n\t\t\t\t_id\n\t\t\t\tmemberEmail\n\t\t\t\tmemberWhatsapp\n\t\t\t}\n\t\t}\n\t}\n": typeof types.AgentViewerDocument,
    "\n\tmutation LikeAgent($productId: String!) {\n\t\tlikeTargetProduct(productId: $productId) {\n\t\t\t_id\n\t\t\tproductLikes\n\t\t}\n\t}\n": typeof types.LikeAgentDocument,
    "\n\tfragment AgentCard on Product {\n\t\t_id\n\t\tproductTitle\n\t\tproductCategory\n\t\tproductPricing\n\t\tproductPrice\n\t\tproductImages\n\t\tproductLikes\n\t\tproductViews\n\t\tmemberData {\n\t\t\t_id\n\t\t\tmemberNick\n\t\t}\n\t}\n": typeof types.AgentCardFragmentDoc,
    "\n\tquery AgentsList($input: ProductsInquiry!) {\n\t\tgetProducts(input: $input) {\n\t\t\tlist {\n\t\t\t\t...AgentCard\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n": typeof types.AgentsListDocument,
    "\n\tfragment CreatorAgentRow on Product {\n\t\t_id\n\t\tproductTitle\n\t\tproductCategory\n\t\tproductStatus\n\t\tproductPricing\n\t\tproductPrice\n\t\tproductImages\n\t\tproductViews\n\t\tproductLikes\n\t\tproductComments\n\t\tupdatedAt\n\t}\n": typeof types.CreatorAgentRowFragmentDoc,
    "\n\tquery CreatorAgents($input: CreatorProductsInquiry!) {\n\t\tlist: getCreatorProducts(input: $input) {\n\t\t\tlist {\n\t\t\t\t...CreatorAgentRow\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t\tactive: getCreatorProducts(input: { page: 1, limit: 1, search: { productStatus: ACTIVE } }) {\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t\tpaused: getCreatorProducts(input: { page: 1, limit: 1, search: { productStatus: PAUSED } }) {\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n": typeof types.CreatorAgentsDocument,
    "\n\tmutation UpdateAgentStatus($input: ProductUpdate!) {\n\t\tupdateProduct(input: $input) {\n\t\t\t_id\n\t\t\tproductStatus\n\t\t\tupdatedAt\n\t\t}\n\t}\n": typeof types.UpdateAgentStatusDocument,
    "\n\tmutation Login($input: LoginInput!) {\n\t\tlogin(input: $input) {\n\t\t\t_id\n\t\t\tmemberType\n\t\t\taccessToken\n\t\t}\n\t}\n": typeof types.LoginDocument,
    "\n\tmutation Signup($input: MemberInput!) {\n\t\tsignup(input: $input) {\n\t\t\t_id\n\t\t\tmemberType\n\t\t\taccessToken\n\t\t}\n\t}\n": typeof types.SignupDocument,
    "\n\tquery CreatorStats {\n\t\tgetMe {\n\t\t\t_id\n\t\t\tmemberProducts\n\t\t\tmemberViews\n\t\t\tmemberLikes\n\t\t\tmemberFollowers\n\t\t}\n\t}\n": typeof types.CreatorStatsDocument,
    "\n\tquery DevApiProducts($input: ProductsInquiry!) {\n\t\tgetProducts(input: $input) {\n\t\t\tlist {\n\t\t\t\t_id\n\t\t\t\tproductTitle\n\t\t\t\tproductCategory\n\t\t\t\tproductPricing\n\t\t\t\tproductPrice\n\t\t\t\tproductLikes\n\t\t\t\tproductViews\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n": typeof types.DevApiProductsDocument,
};
const documents: Documents = {
    "\n\tquery Me {\n\t\tgetMe {\n\t\t\t_id\n\t\t\tmemberType\n\t\t\tmemberStatus\n\t\t\tmemberNick\n\t\t\tmemberFullName\n\t\t\tmemberImage\n\t\t\tmemberPhone\n\t\t\tmemberEmail\n\t\t\tmemberWhatsapp\n\t\t}\n\t}\n": types.MeDocument,
    "\n\tquery AgentDetail($productId: String!) {\n\t\tgetProduct(productId: $productId) {\n\t\t\t_id\n\t\t\tproductTitle\n\t\t\tproductDesc\n\t\t\tproductStatus\n\t\t\tproductCategory\n\t\t\tproductPricing\n\t\t\tproductPrice\n\t\t\tproductDemoUrl\n\t\t\tproductTags\n\t\t\tproductImages\n\t\t\tproductLikes\n\t\t\tproductViews\n\t\t\tproductComments\n\t\t\tupdatedAt\n\t\t\tmemberData {\n\t\t\t\t_id\n\t\t\t\tmemberNick\n\t\t\t\tmemberFullName\n\t\t\t\tmemberImage\n\t\t\t\tmemberProducts\n\t\t\t\tmemberFollowers\n\t\t\t}\n\t\t}\n\t}\n": types.AgentDetailDocument,
    "\n\tquery AgentViewer($productId: String!) {\n\t\tgetProduct(productId: $productId) {\n\t\t\t_id\n\t\t\tproductViews\n\t\t\tmeLiked {\n\t\t\t\tmemberId\n\t\t\t\tlikeRefId\n\t\t\t\tmyFavorite\n\t\t\t}\n\t\t\tmemberData {\n\t\t\t\t_id\n\t\t\t\tmemberEmail\n\t\t\t\tmemberWhatsapp\n\t\t\t}\n\t\t}\n\t}\n": types.AgentViewerDocument,
    "\n\tmutation LikeAgent($productId: String!) {\n\t\tlikeTargetProduct(productId: $productId) {\n\t\t\t_id\n\t\t\tproductLikes\n\t\t}\n\t}\n": types.LikeAgentDocument,
    "\n\tfragment AgentCard on Product {\n\t\t_id\n\t\tproductTitle\n\t\tproductCategory\n\t\tproductPricing\n\t\tproductPrice\n\t\tproductImages\n\t\tproductLikes\n\t\tproductViews\n\t\tmemberData {\n\t\t\t_id\n\t\t\tmemberNick\n\t\t}\n\t}\n": types.AgentCardFragmentDoc,
    "\n\tquery AgentsList($input: ProductsInquiry!) {\n\t\tgetProducts(input: $input) {\n\t\t\tlist {\n\t\t\t\t...AgentCard\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n": types.AgentsListDocument,
    "\n\tfragment CreatorAgentRow on Product {\n\t\t_id\n\t\tproductTitle\n\t\tproductCategory\n\t\tproductStatus\n\t\tproductPricing\n\t\tproductPrice\n\t\tproductImages\n\t\tproductViews\n\t\tproductLikes\n\t\tproductComments\n\t\tupdatedAt\n\t}\n": types.CreatorAgentRowFragmentDoc,
    "\n\tquery CreatorAgents($input: CreatorProductsInquiry!) {\n\t\tlist: getCreatorProducts(input: $input) {\n\t\t\tlist {\n\t\t\t\t...CreatorAgentRow\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t\tactive: getCreatorProducts(input: { page: 1, limit: 1, search: { productStatus: ACTIVE } }) {\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t\tpaused: getCreatorProducts(input: { page: 1, limit: 1, search: { productStatus: PAUSED } }) {\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n": types.CreatorAgentsDocument,
    "\n\tmutation UpdateAgentStatus($input: ProductUpdate!) {\n\t\tupdateProduct(input: $input) {\n\t\t\t_id\n\t\t\tproductStatus\n\t\t\tupdatedAt\n\t\t}\n\t}\n": types.UpdateAgentStatusDocument,
    "\n\tmutation Login($input: LoginInput!) {\n\t\tlogin(input: $input) {\n\t\t\t_id\n\t\t\tmemberType\n\t\t\taccessToken\n\t\t}\n\t}\n": types.LoginDocument,
    "\n\tmutation Signup($input: MemberInput!) {\n\t\tsignup(input: $input) {\n\t\t\t_id\n\t\t\tmemberType\n\t\t\taccessToken\n\t\t}\n\t}\n": types.SignupDocument,
    "\n\tquery CreatorStats {\n\t\tgetMe {\n\t\t\t_id\n\t\t\tmemberProducts\n\t\t\tmemberViews\n\t\t\tmemberLikes\n\t\t\tmemberFollowers\n\t\t}\n\t}\n": types.CreatorStatsDocument,
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
export function graphql(source: "\n\tquery AgentDetail($productId: String!) {\n\t\tgetProduct(productId: $productId) {\n\t\t\t_id\n\t\t\tproductTitle\n\t\t\tproductDesc\n\t\t\tproductStatus\n\t\t\tproductCategory\n\t\t\tproductPricing\n\t\t\tproductPrice\n\t\t\tproductDemoUrl\n\t\t\tproductTags\n\t\t\tproductImages\n\t\t\tproductLikes\n\t\t\tproductViews\n\t\t\tproductComments\n\t\t\tupdatedAt\n\t\t\tmemberData {\n\t\t\t\t_id\n\t\t\t\tmemberNick\n\t\t\t\tmemberFullName\n\t\t\t\tmemberImage\n\t\t\t\tmemberProducts\n\t\t\t\tmemberFollowers\n\t\t\t}\n\t\t}\n\t}\n"): (typeof documents)["\n\tquery AgentDetail($productId: String!) {\n\t\tgetProduct(productId: $productId) {\n\t\t\t_id\n\t\t\tproductTitle\n\t\t\tproductDesc\n\t\t\tproductStatus\n\t\t\tproductCategory\n\t\t\tproductPricing\n\t\t\tproductPrice\n\t\t\tproductDemoUrl\n\t\t\tproductTags\n\t\t\tproductImages\n\t\t\tproductLikes\n\t\t\tproductViews\n\t\t\tproductComments\n\t\t\tupdatedAt\n\t\t\tmemberData {\n\t\t\t\t_id\n\t\t\t\tmemberNick\n\t\t\t\tmemberFullName\n\t\t\t\tmemberImage\n\t\t\t\tmemberProducts\n\t\t\t\tmemberFollowers\n\t\t\t}\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tquery AgentViewer($productId: String!) {\n\t\tgetProduct(productId: $productId) {\n\t\t\t_id\n\t\t\tproductViews\n\t\t\tmeLiked {\n\t\t\t\tmemberId\n\t\t\t\tlikeRefId\n\t\t\t\tmyFavorite\n\t\t\t}\n\t\t\tmemberData {\n\t\t\t\t_id\n\t\t\t\tmemberEmail\n\t\t\t\tmemberWhatsapp\n\t\t\t}\n\t\t}\n\t}\n"): (typeof documents)["\n\tquery AgentViewer($productId: String!) {\n\t\tgetProduct(productId: $productId) {\n\t\t\t_id\n\t\t\tproductViews\n\t\t\tmeLiked {\n\t\t\t\tmemberId\n\t\t\t\tlikeRefId\n\t\t\t\tmyFavorite\n\t\t\t}\n\t\t\tmemberData {\n\t\t\t\t_id\n\t\t\t\tmemberEmail\n\t\t\t\tmemberWhatsapp\n\t\t\t}\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tmutation LikeAgent($productId: String!) {\n\t\tlikeTargetProduct(productId: $productId) {\n\t\t\t_id\n\t\t\tproductLikes\n\t\t}\n\t}\n"): (typeof documents)["\n\tmutation LikeAgent($productId: String!) {\n\t\tlikeTargetProduct(productId: $productId) {\n\t\t\t_id\n\t\t\tproductLikes\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tfragment AgentCard on Product {\n\t\t_id\n\t\tproductTitle\n\t\tproductCategory\n\t\tproductPricing\n\t\tproductPrice\n\t\tproductImages\n\t\tproductLikes\n\t\tproductViews\n\t\tmemberData {\n\t\t\t_id\n\t\t\tmemberNick\n\t\t}\n\t}\n"): (typeof documents)["\n\tfragment AgentCard on Product {\n\t\t_id\n\t\tproductTitle\n\t\tproductCategory\n\t\tproductPricing\n\t\tproductPrice\n\t\tproductImages\n\t\tproductLikes\n\t\tproductViews\n\t\tmemberData {\n\t\t\t_id\n\t\t\tmemberNick\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tquery AgentsList($input: ProductsInquiry!) {\n\t\tgetProducts(input: $input) {\n\t\t\tlist {\n\t\t\t\t...AgentCard\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n"): (typeof documents)["\n\tquery AgentsList($input: ProductsInquiry!) {\n\t\tgetProducts(input: $input) {\n\t\t\tlist {\n\t\t\t\t...AgentCard\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tfragment CreatorAgentRow on Product {\n\t\t_id\n\t\tproductTitle\n\t\tproductCategory\n\t\tproductStatus\n\t\tproductPricing\n\t\tproductPrice\n\t\tproductImages\n\t\tproductViews\n\t\tproductLikes\n\t\tproductComments\n\t\tupdatedAt\n\t}\n"): (typeof documents)["\n\tfragment CreatorAgentRow on Product {\n\t\t_id\n\t\tproductTitle\n\t\tproductCategory\n\t\tproductStatus\n\t\tproductPricing\n\t\tproductPrice\n\t\tproductImages\n\t\tproductViews\n\t\tproductLikes\n\t\tproductComments\n\t\tupdatedAt\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tquery CreatorAgents($input: CreatorProductsInquiry!) {\n\t\tlist: getCreatorProducts(input: $input) {\n\t\t\tlist {\n\t\t\t\t...CreatorAgentRow\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t\tactive: getCreatorProducts(input: { page: 1, limit: 1, search: { productStatus: ACTIVE } }) {\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t\tpaused: getCreatorProducts(input: { page: 1, limit: 1, search: { productStatus: PAUSED } }) {\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n"): (typeof documents)["\n\tquery CreatorAgents($input: CreatorProductsInquiry!) {\n\t\tlist: getCreatorProducts(input: $input) {\n\t\t\tlist {\n\t\t\t\t...CreatorAgentRow\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t\tactive: getCreatorProducts(input: { page: 1, limit: 1, search: { productStatus: ACTIVE } }) {\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t\tpaused: getCreatorProducts(input: { page: 1, limit: 1, search: { productStatus: PAUSED } }) {\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tmutation UpdateAgentStatus($input: ProductUpdate!) {\n\t\tupdateProduct(input: $input) {\n\t\t\t_id\n\t\t\tproductStatus\n\t\t\tupdatedAt\n\t\t}\n\t}\n"): (typeof documents)["\n\tmutation UpdateAgentStatus($input: ProductUpdate!) {\n\t\tupdateProduct(input: $input) {\n\t\t\t_id\n\t\t\tproductStatus\n\t\t\tupdatedAt\n\t\t}\n\t}\n"];
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
export function graphql(source: "\n\tquery CreatorStats {\n\t\tgetMe {\n\t\t\t_id\n\t\t\tmemberProducts\n\t\t\tmemberViews\n\t\t\tmemberLikes\n\t\t\tmemberFollowers\n\t\t}\n\t}\n"): (typeof documents)["\n\tquery CreatorStats {\n\t\tgetMe {\n\t\t\t_id\n\t\t\tmemberProducts\n\t\t\tmemberViews\n\t\t\tmemberLikes\n\t\t\tmemberFollowers\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tquery DevApiProducts($input: ProductsInquiry!) {\n\t\tgetProducts(input: $input) {\n\t\t\tlist {\n\t\t\t\t_id\n\t\t\t\tproductTitle\n\t\t\t\tproductCategory\n\t\t\t\tproductPricing\n\t\t\t\tproductPrice\n\t\t\t\tproductLikes\n\t\t\t\tproductViews\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n"): (typeof documents)["\n\tquery DevApiProducts($input: ProductsInquiry!) {\n\t\tgetProducts(input: $input) {\n\t\t\tlist {\n\t\t\t\t_id\n\t\t\t\tproductTitle\n\t\t\t\tproductCategory\n\t\t\t\tproductPricing\n\t\t\t\tproductPrice\n\t\t\t\tproductLikes\n\t\t\t\tproductViews\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;