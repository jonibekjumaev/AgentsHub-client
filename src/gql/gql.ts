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
    "\n\tquery Account {\n\t\tgetMe {\n\t\t\t_id\n\t\t\tmemberType\n\t\t\tmemberNick\n\t\t\tmemberFullName\n\t\t\tmemberImage\n\t\t\tmemberPhone\n\t\t\tmemberEmail\n\t\t\tmemberWhatsapp\n\t\t\tmemberDesc\n\t\t}\n\t}\n": typeof types.AccountDocument,
    "\n\tmutation UpdateAccount($input: MemberUpdate!) {\n\t\tupdateMember(input: $input) {\n\t\t\t_id\n\t\t\tmemberNick\n\t\t\tmemberFullName\n\t\t\tmemberImage\n\t\t\tmemberPhone\n\t\t\tmemberEmail\n\t\t\tmemberWhatsapp\n\t\t\tmemberDesc\n\t\t}\n\t}\n": typeof types.UpdateAccountDocument,
    "\n\tmutation ChangePassword($input: ChangePasswordInput!) {\n\t\tchangePassword(input: $input)\n\t}\n": typeof types.ChangePasswordDocument,
    "\n\tmutation UploadAvatar($file: Upload!) {\n\t\timageUploader(file: $file, target: \"member\")\n\t}\n": typeof types.UploadAvatarDocument,
    "\n\tquery AdminMembers($input: MembersInquiry!) {\n\t\tgetAllMembersByAdmin(input: $input) {\n\t\t\tlist {\n\t\t\t\t_id\n\t\t\t\tmemberType\n\t\t\t\tmemberStatus\n\t\t\t\tmemberNick\n\t\t\t\tmemberFullName\n\t\t\t\tmemberImage\n\t\t\t\tmemberPhone\n\t\t\t\tmemberEmail\n\t\t\t\tmemberProducts\n\t\t\t\tmemberBriefs\n\t\t\t\tcreatedAt\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n": typeof types.AdminMembersDocument,
    "\n\tmutation AdminUpdateMember($input: MemberUpdateByAdmin!) {\n\t\tupdateMemberByAdmin(input: $input) {\n\t\t\t_id\n\t\t\tmemberStatus\n\t\t}\n\t}\n": typeof types.AdminUpdateMemberDocument,
    "\n\tquery AdminProducts($input: AllProductsInquiry!) {\n\t\tgetAllProductsByAdmin(input: $input) {\n\t\t\tlist {\n\t\t\t\t_id\n\t\t\t\tproductTitle\n\t\t\t\tproductStatus\n\t\t\t\tproductCategory\n\t\t\t\tproductPricing\n\t\t\t\tproductPrice\n\t\t\t\tproductLikes\n\t\t\t\tproductViews\n\t\t\t\tupdatedAt\n\t\t\t\tmemberData {\n\t\t\t\t\t_id\n\t\t\t\t\tmemberNick\n\t\t\t\t}\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n": typeof types.AdminProductsDocument,
    "\n\tmutation AdminUpdateProduct($input: ProductUpdate!) {\n\t\tupdateProductByAdmin(input: $input) {\n\t\t\t_id\n\t\t\tproductStatus\n\t\t}\n\t}\n": typeof types.AdminUpdateProductDocument,
    "\n\tmutation AdminRemoveProduct($productId: String!) {\n\t\tremoveProductByAdmin(productId: $productId) {\n\t\t\t_id\n\t\t}\n\t}\n": typeof types.AdminRemoveProductDocument,
    "\n\tquery AdminBriefs($input: AllBriefsInquiry!) {\n\t\tgetAllBriefsByAdmin(input: $input) {\n\t\t\tlist {\n\t\t\t\t_id\n\t\t\t\tbriefTitle\n\t\t\t\tbriefStatus\n\t\t\t\tbriefCategory\n\t\t\t\tbriefBudget\n\t\t\t\tbriefDeadline\n\t\t\t\tbriefViews\n\t\t\t\tbriefComments\n\t\t\t\tcreatedAt\n\t\t\t\tmemberData {\n\t\t\t\t\t_id\n\t\t\t\t\tmemberNick\n\t\t\t\t}\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n": typeof types.AdminBriefsDocument,
    "\n\tmutation AdminUpdateBrief($input: BriefUpdate!) {\n\t\tupdateBriefByAdmin(input: $input) {\n\t\t\t_id\n\t\t\tbriefStatus\n\t\t\tbriefDeadline\n\t\t}\n\t}\n": typeof types.AdminUpdateBriefDocument,
    "\n\tmutation AdminRemoveBrief($briefId: String!) {\n\t\tremoveBriefByAdmin(briefId: $briefId) {\n\t\t\t_id\n\t\t}\n\t}\n": typeof types.AdminRemoveBriefDocument,
    "\n\tquery AdminArticles($input: AllBoardArticlesInquiry!) {\n\t\tgetAllBoardArticlesByAdmin(input: $input) {\n\t\t\tlist {\n\t\t\t\t_id\n\t\t\t\tarticleTitle\n\t\t\t\tarticleStatus\n\t\t\t\tarticleCategory\n\t\t\t\tarticleLikes\n\t\t\t\tarticleComments\n\t\t\t\tcreatedAt\n\t\t\t\tmemberData {\n\t\t\t\t\t_id\n\t\t\t\t\tmemberNick\n\t\t\t\t}\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n": typeof types.AdminArticlesDocument,
    "\n\tmutation AdminUpdateArticle($input: BoardArticleUpdate!) {\n\t\tupdateBoardArticleByAdmin(input: $input) {\n\t\t\t_id\n\t\t\tarticleStatus\n\t\t}\n\t}\n": typeof types.AdminUpdateArticleDocument,
    "\n\tmutation AdminRemoveArticle($articleId: String!) {\n\t\tremoveBoardArticleByAdmin(articleId: $articleId) {\n\t\t\t_id\n\t\t}\n\t}\n": typeof types.AdminRemoveArticleDocument,
    "\n\tquery AgentDetail($productId: String!) {\n\t\tgetProduct(productId: $productId) {\n\t\t\t_id\n\t\t\tproductTitle\n\t\t\tproductDesc\n\t\t\tproductStatus\n\t\t\tproductCategory\n\t\t\tproductPricing\n\t\t\tproductPrice\n\t\t\tproductDemoUrl\n\t\t\tproductTags\n\t\t\tproductImages\n\t\t\tproductLikes\n\t\t\tproductViews\n\t\t\tproductComments\n\t\t\tupdatedAt\n\t\t\tmemberData {\n\t\t\t\t_id\n\t\t\t\tmemberNick\n\t\t\t\tmemberFullName\n\t\t\t\tmemberImage\n\t\t\t\tmemberProducts\n\t\t\t\tmemberFollowers\n\t\t\t}\n\t\t}\n\t}\n": typeof types.AgentDetailDocument,
    "\n\tquery AgentViewer($productId: String!) {\n\t\tgetProduct(productId: $productId) {\n\t\t\t_id\n\t\t\tproductViews\n\t\t\tmeLiked {\n\t\t\t\tmemberId\n\t\t\t\tlikeRefId\n\t\t\t\tmyFavorite\n\t\t\t}\n\t\t\tmemberData {\n\t\t\t\t_id\n\t\t\t\tmemberEmail\n\t\t\t\tmemberWhatsapp\n\t\t\t}\n\t\t}\n\t}\n": typeof types.AgentViewerDocument,
    "\n\tmutation LikeAgent($productId: String!) {\n\t\tlikeTargetProduct(productId: $productId) {\n\t\t\t_id\n\t\t\tproductLikes\n\t\t}\n\t}\n": typeof types.LikeAgentDocument,
    "\n\tquery OwnerAgent($productId: String!) {\n\t\tgetProduct(productId: $productId) {\n\t\t\t_id\n\t\t\tmemberId\n\t\t\tproductStatus\n\t\t\tproductTitle\n\t\t\tproductCategory\n\t\t\tproductPricing\n\t\t\tproductPrice\n\t\t\tproductDemoUrl\n\t\t\tproductTags\n\t\t\tproductImages\n\t\t\tproductDesc\n\t\t\tproductLikes\n\t\t\tproductViews\n\t\t\tupdatedAt\n\t\t}\n\t}\n": typeof types.OwnerAgentDocument,
    "\n\tmutation CreateAgent($input: ProductInput!) {\n\t\tcreateProduct(input: $input) {\n\t\t\t_id\n\t\t\tproductTitle\n\t\t\tproductStatus\n\t\t}\n\t}\n": typeof types.CreateAgentDocument,
    "\n\tmutation UpdateAgent($input: ProductUpdate!) {\n\t\tupdateProduct(input: $input) {\n\t\t\t_id\n\t\t\tproductStatus\n\t\t\tproductTitle\n\t\t\tproductCategory\n\t\t\tproductPricing\n\t\t\tproductPrice\n\t\t\tproductDemoUrl\n\t\t\tproductTags\n\t\t\tproductImages\n\t\t\tproductDesc\n\t\t\tupdatedAt\n\t\t}\n\t}\n": typeof types.UpdateAgentDocument,
    "\n\tmutation UploadAgentImage($file: Upload!) {\n\t\timageUploader(file: $file, target: \"product\")\n\t}\n": typeof types.UploadAgentImageDocument,
    "\n\tfragment AgentCard on Product {\n\t\t_id\n\t\tproductTitle\n\t\tproductCategory\n\t\tproductPricing\n\t\tproductPrice\n\t\tproductImages\n\t\tproductLikes\n\t\tproductViews\n\t\tmemberData {\n\t\t\t_id\n\t\t\tmemberNick\n\t\t}\n\t}\n": typeof types.AgentCardFragmentDoc,
    "\n\tquery AgentsList($input: ProductsInquiry!) {\n\t\tgetProducts(input: $input) {\n\t\t\tlist {\n\t\t\t\t...AgentCard\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n": typeof types.AgentsListDocument,
    "\n\tfragment CreatorAgentRow on Product {\n\t\t_id\n\t\tproductTitle\n\t\tproductCategory\n\t\tproductStatus\n\t\tproductPricing\n\t\tproductPrice\n\t\tproductImages\n\t\tproductViews\n\t\tproductLikes\n\t\tproductComments\n\t\tupdatedAt\n\t}\n": typeof types.CreatorAgentRowFragmentDoc,
    "\n\tquery CreatorAgents($input: CreatorProductsInquiry!) {\n\t\tlist: getCreatorProducts(input: $input) {\n\t\t\tlist {\n\t\t\t\t...CreatorAgentRow\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t\tactive: getCreatorProducts(input: { page: 1, limit: 1, search: { productStatus: ACTIVE } }) {\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t\tpaused: getCreatorProducts(input: { page: 1, limit: 1, search: { productStatus: PAUSED } }) {\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n": typeof types.CreatorAgentsDocument,
    "\n\tmutation UpdateAgentStatus($input: ProductUpdate!) {\n\t\tupdateProduct(input: $input) {\n\t\t\t_id\n\t\t\tproductStatus\n\t\t\tupdatedAt\n\t\t}\n\t}\n": typeof types.UpdateAgentStatusDocument,
    "\n\tquery FavoriteAgents($input: OrdinaryInquiry!) {\n\t\tgetFavorities(input: $input) {\n\t\t\tlist {\n\t\t\t\t...AgentCard\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n": typeof types.FavoriteAgentsDocument,
    "\n\tquery VisitedAgents($input: OrdinaryInquiry!) {\n\t\tgetVisited(input: $input) {\n\t\t\tlist {\n\t\t\t\t...AgentCard\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n": typeof types.VisitedAgentsDocument,
    "\n\tmutation Login($input: LoginInput!) {\n\t\tlogin(input: $input) {\n\t\t\t_id\n\t\t\tmemberType\n\t\t\taccessToken\n\t\t}\n\t}\n": typeof types.LoginDocument,
    "\n\tmutation Signup($input: MemberInput!) {\n\t\tsignup(input: $input) {\n\t\t\t_id\n\t\t\tmemberType\n\t\t\taccessToken\n\t\t}\n\t}\n": typeof types.SignupDocument,
    "\n\tfragment BriefCard on Brief {\n\t\t_id\n\t\tbriefTitle\n\t\tbriefContent\n\t\tbriefCategory\n\t\tbriefStatus\n\t\tbriefBudget\n\t\tbriefDeadline\n\t\tbriefViews\n\t\tbriefComments\n\t\tcreatedAt\n\t\tclosedAt\n\t\tmemberData {\n\t\t\t_id\n\t\t\tmemberNick\n\t\t}\n\t}\n": typeof types.BriefCardFragmentDoc,
    "\n\tquery BriefsList($input: BriefsInquiry!) {\n\t\tgetBriefs(input: $input) {\n\t\t\tlist {\n\t\t\t\t...BriefCard\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n": typeof types.BriefsListDocument,
    "\n\tquery BriefDetail($briefId: String!) {\n\t\tgetBrief(briefId: $briefId) {\n\t\t\t_id\n\t\t\tbriefTitle\n\t\t\tbriefContent\n\t\t\tbriefCategory\n\t\t\tbriefStatus\n\t\t\tbriefBudget\n\t\t\tbriefDeadline\n\t\t\tbriefViews\n\t\t\tbriefComments\n\t\t\tcreatedAt\n\t\t\tupdatedAt\n\t\t\tclosedAt\n\t\t\tmemberData {\n\t\t\t\t_id\n\t\t\t\tmemberNick\n\t\t\t\tmemberFullName\n\t\t\t\tmemberImage\n\t\t\t\tmemberBriefs\n\t\t\t}\n\t\t}\n\t}\n": typeof types.BriefDetailDocument,
    "\n\tquery BriefViewer($briefId: String!) {\n\t\tgetBrief(briefId: $briefId) {\n\t\t\t_id\n\t\t\tbriefViews\n\t\t\tmemberData {\n\t\t\t\t_id\n\t\t\t\tmemberEmail\n\t\t\t\tmemberWhatsapp\n\t\t\t}\n\t\t}\n\t}\n": typeof types.BriefViewerDocument,
    "\n\tfragment MyBriefRow on Brief {\n\t\t_id\n\t\tbriefTitle\n\t\tbriefCategory\n\t\tbriefStatus\n\t\tbriefBudget\n\t\tbriefDeadline\n\t\tbriefViews\n\t\tbriefComments\n\t\tcreatedAt\n\t\tupdatedAt\n\t\tclosedAt\n\t}\n": typeof types.MyBriefRowFragmentDoc,
    "\n\tquery MyBriefs($input: MyBriefsInquiry!) {\n\t\tlist: getMyBriefs(input: $input) {\n\t\t\tlist {\n\t\t\t\t...MyBriefRow\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t\topen: getMyBriefs(input: { page: 1, limit: 1, search: { briefStatus: OPEN } }) {\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t\tclosed: getMyBriefs(input: { page: 1, limit: 1, search: { briefStatus: CLOSED } }) {\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n": typeof types.MyBriefsDocument,
    "\n\tmutation UpdateBriefStatus($input: BriefUpdate!) {\n\t\tupdateBrief(input: $input) {\n\t\t\t_id\n\t\t\tbriefStatus\n\t\t\tbriefDeadline\n\t\t\tclosedAt\n\t\t\tupdatedAt\n\t\t}\n\t}\n": typeof types.UpdateBriefStatusDocument,
    "\n\tquery OwnerBrief($briefId: String!) {\n\t\tgetBrief(briefId: $briefId) {\n\t\t\t_id\n\t\t\tmemberId\n\t\t\tbriefStatus\n\t\t\tbriefTitle\n\t\t\tbriefCategory\n\t\t\tbriefContent\n\t\t\tbriefBudget\n\t\t\tbriefDeadline\n\t\t\tupdatedAt\n\t\t}\n\t}\n": typeof types.OwnerBriefDocument,
    "\n\tmutation CreateBrief($input: BriefInput!) {\n\t\tcreateBrief(input: $input) {\n\t\t\t_id\n\t\t\tbriefTitle\n\t\t\tbriefStatus\n\t\t}\n\t}\n": typeof types.CreateBriefDocument,
    "\n\tmutation UpdateBrief($input: BriefUpdate!) {\n\t\tupdateBrief(input: $input) {\n\t\t\t_id\n\t\t\tbriefStatus\n\t\t\tbriefTitle\n\t\t\tbriefCategory\n\t\t\tbriefContent\n\t\t\tbriefBudget\n\t\t\tbriefDeadline\n\t\t\tupdatedAt\n\t\t}\n\t}\n": typeof types.UpdateBriefDocument,
    "\n\tfragment CommentItem on Comment {\n\t\t_id\n\t\tcommentContent\n\t\tcommentGroup\n\t\tcommentRefId\n\t\tmemberId\n\t\tcreatedAt\n\t\tmemberData {\n\t\t\t_id\n\t\t\tmemberNick\n\t\t\tmemberFullName\n\t\t\tmemberImage\n\t\t}\n\t}\n": typeof types.CommentItemFragmentDoc,
    "\n\tquery Comments($input: CommentsInquiry!) {\n\t\tgetComments(input: $input) {\n\t\t\tlist {\n\t\t\t\t...CommentItem\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n": typeof types.CommentsDocument,
    "\n\tmutation CreateComment($input: CommentInput!) {\n\t\tcreateComment(input: $input) {\n\t\t\t...CommentItem\n\t\t}\n\t}\n": typeof types.CreateCommentDocument,
    "\n\tmutation DeleteComment($input: CommentUpdate!) {\n\t\tupdateComment(input: $input) {\n\t\t\t_id\n\t\t\tcommentStatus\n\t\t}\n\t}\n": typeof types.DeleteCommentDocument,
    "\n\tfragment ArticleCard on BoardArticle {\n\t\t_id\n\t\tarticleCategory\n\t\tarticleStatus\n\t\tarticleTitle\n\t\tarticleContent\n\t\tarticleImage\n\t\tarticleLikes\n\t\tarticleViews\n\t\tarticleComments\n\t\tcreatedAt\n\t\tmemberData {\n\t\t\t_id\n\t\t\tmemberNick\n\t\t\tmemberFullName\n\t\t\tmemberImage\n\t\t}\n\t}\n": typeof types.ArticleCardFragmentDoc,
    "\n\tquery ArticlesList($input: BoardArticlesInquiry!) {\n\t\tgetBoardArticles(input: $input) {\n\t\t\tlist {\n\t\t\t\t...ArticleCard\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n": typeof types.ArticlesListDocument,
    "\n\tquery ArticleDetail($articleId: String!) {\n\t\tgetBoardArticle(articleId: $articleId) {\n\t\t\t...ArticleCard\n\t\t\tmemberId\n\t\t\tupdatedAt\n\t\t}\n\t}\n": typeof types.ArticleDetailDocument,
    "\n\tquery ArticleViewer($articleId: String!) {\n\t\tgetBoardArticle(articleId: $articleId) {\n\t\t\t_id\n\t\t\tarticleViews\n\t\t\tmeLiked {\n\t\t\t\tmemberId\n\t\t\t\tlikeRefId\n\t\t\t\tmyFavorite\n\t\t\t}\n\t\t}\n\t}\n": typeof types.ArticleViewerDocument,
    "\n\tmutation LikeArticle($articleId: String!) {\n\t\tlikeTargetBoardArticle(articleId: $articleId) {\n\t\t\t_id\n\t\t\tarticleLikes\n\t\t}\n\t}\n": typeof types.LikeArticleDocument,
    "\n\tquery OwnerArticle($articleId: String!) {\n\t\tgetBoardArticle(articleId: $articleId) {\n\t\t\t_id\n\t\t\tmemberId\n\t\t\tarticleStatus\n\t\t\tarticleCategory\n\t\t\tarticleTitle\n\t\t\tarticleContent\n\t\t\tarticleImage\n\t\t\tupdatedAt\n\t\t}\n\t}\n": typeof types.OwnerArticleDocument,
    "\n\tmutation CreateArticle($input: BoardArticleInput!) {\n\t\tcreateBoardArticle(input: $input) {\n\t\t\t_id\n\t\t\tarticleTitle\n\t\t}\n\t}\n": typeof types.CreateArticleDocument,
    "\n\tmutation UpdateArticle($input: BoardArticleUpdate!) {\n\t\tupdateBoardArticle(input: $input) {\n\t\t\t_id\n\t\t\tarticleStatus\n\t\t\tarticleCategory\n\t\t\tarticleTitle\n\t\t\tarticleContent\n\t\t\tarticleImage\n\t\t\tupdatedAt\n\t\t}\n\t}\n": typeof types.UpdateArticleDocument,
    "\n\tmutation UploadArticleImage($file: Upload!) {\n\t\timageUploader(file: $file, target: \"article\")\n\t}\n": typeof types.UploadArticleImageDocument,
    "\n\tfragment CreatorCard on Member {\n\t\t_id\n\t\tmemberNick\n\t\tmemberFullName\n\t\tmemberImage\n\t\tmemberDesc\n\t\tmemberRank\n\t\tmemberProducts\n\t\tmemberFollowers\n\t\tmemberLikes\n\t}\n": typeof types.CreatorCardFragmentDoc,
    "\n\tquery CreatorsList($input: CreatorsInquiry!) {\n\t\tgetCreators(input: $input) {\n\t\t\tlist {\n\t\t\t\t...CreatorCard\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n": typeof types.CreatorsListDocument,
    "\n\tquery MemberProfile($memberId: String!) {\n\t\tgetMember(memberId: $memberId) {\n\t\t\t_id\n\t\t\tmemberType\n\t\t\tmemberStatus\n\t\t\tmemberNick\n\t\t\tmemberFullName\n\t\t\tmemberImage\n\t\t\tmemberDesc\n\t\t\tmemberRank\n\t\t\tmemberProducts\n\t\t\tmemberBriefs\n\t\t\tmemberArticles\n\t\t\tmemberFollowers\n\t\t\tmemberFollowings\n\t\t\tmemberLikes\n\t\t\tmemberViews\n\t\t\tcreatedAt\n\t\t}\n\t}\n": typeof types.MemberProfileDocument,
    "\n\tquery MemberViewer($memberId: String!) {\n\t\tgetMember(memberId: $memberId) {\n\t\t\t_id\n\t\t\tmemberViews\n\t\t\tmemberEmail\n\t\t\tmemberWhatsapp\n\t\t\tmeFollowed {\n\t\t\t\tfollowingId\n\t\t\t\tfollowerId\n\t\t\t\tmyFollowing\n\t\t\t}\n\t\t}\n\t}\n": typeof types.MemberViewerDocument,
    "\n\tquery CreatorStats {\n\t\tgetMe {\n\t\t\t_id\n\t\t\tmemberProducts\n\t\t\tmemberViews\n\t\t\tmemberLikes\n\t\t\tmemberFollowers\n\t\t}\n\t}\n": typeof types.CreatorStatsDocument,
    "\n\tfragment FollowMember on Member {\n\t\t_id\n\t\tmemberType\n\t\tmemberNick\n\t\tmemberFullName\n\t\tmemberImage\n\t\tmemberFollowers\n\t}\n": typeof types.FollowMemberFragmentDoc,
    "\n\tmutation Subscribe($memberId: String!) {\n\t\tsubscribe(input: $memberId) {\n\t\t\t_id\n\t\t\tfollowingId\n\t\t\tfollowerId\n\t\t}\n\t}\n": typeof types.SubscribeDocument,
    "\n\tmutation Unsubscribe($memberId: String!) {\n\t\tunsubscribe(input: $memberId) {\n\t\t\t_id\n\t\t\tfollowingId\n\t\t\tfollowerId\n\t\t}\n\t}\n": typeof types.UnsubscribeDocument,
    "\n\tquery MyFollowingIds($input: FollowInquiry!) {\n\t\tgetMemberFollowings(input: $input) {\n\t\t\tlist {\n\t\t\t\t_id\n\t\t\t\tfollowingId\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n": typeof types.MyFollowingIdsDocument,
    "\n\tquery Followers($input: FollowInquiry!) {\n\t\tgetMemberFollowers(input: $input) {\n\t\t\tlist {\n\t\t\t\t_id\n\t\t\t\tfollowerId\n\t\t\t\tfollowerData {\n\t\t\t\t\t...FollowMember\n\t\t\t\t}\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n": typeof types.FollowersDocument,
    "\n\tquery Followings($input: FollowInquiry!) {\n\t\tgetMemberFollowings(input: $input) {\n\t\t\tlist {\n\t\t\t\t_id\n\t\t\t\tfollowingId\n\t\t\t\tfollowingData {\n\t\t\t\t\t...FollowMember\n\t\t\t\t}\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n": typeof types.FollowingsDocument,
    "\n\tquery DevApiProducts($input: ProductsInquiry!) {\n\t\tgetProducts(input: $input) {\n\t\t\tlist {\n\t\t\t\t_id\n\t\t\t\tproductTitle\n\t\t\t\tproductCategory\n\t\t\t\tproductPricing\n\t\t\t\tproductPrice\n\t\t\t\tproductLikes\n\t\t\t\tproductViews\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n": typeof types.DevApiProductsDocument,
};
const documents: Documents = {
    "\n\tquery Me {\n\t\tgetMe {\n\t\t\t_id\n\t\t\tmemberType\n\t\t\tmemberStatus\n\t\t\tmemberNick\n\t\t\tmemberFullName\n\t\t\tmemberImage\n\t\t\tmemberPhone\n\t\t\tmemberEmail\n\t\t\tmemberWhatsapp\n\t\t}\n\t}\n": types.MeDocument,
    "\n\tquery Account {\n\t\tgetMe {\n\t\t\t_id\n\t\t\tmemberType\n\t\t\tmemberNick\n\t\t\tmemberFullName\n\t\t\tmemberImage\n\t\t\tmemberPhone\n\t\t\tmemberEmail\n\t\t\tmemberWhatsapp\n\t\t\tmemberDesc\n\t\t}\n\t}\n": types.AccountDocument,
    "\n\tmutation UpdateAccount($input: MemberUpdate!) {\n\t\tupdateMember(input: $input) {\n\t\t\t_id\n\t\t\tmemberNick\n\t\t\tmemberFullName\n\t\t\tmemberImage\n\t\t\tmemberPhone\n\t\t\tmemberEmail\n\t\t\tmemberWhatsapp\n\t\t\tmemberDesc\n\t\t}\n\t}\n": types.UpdateAccountDocument,
    "\n\tmutation ChangePassword($input: ChangePasswordInput!) {\n\t\tchangePassword(input: $input)\n\t}\n": types.ChangePasswordDocument,
    "\n\tmutation UploadAvatar($file: Upload!) {\n\t\timageUploader(file: $file, target: \"member\")\n\t}\n": types.UploadAvatarDocument,
    "\n\tquery AdminMembers($input: MembersInquiry!) {\n\t\tgetAllMembersByAdmin(input: $input) {\n\t\t\tlist {\n\t\t\t\t_id\n\t\t\t\tmemberType\n\t\t\t\tmemberStatus\n\t\t\t\tmemberNick\n\t\t\t\tmemberFullName\n\t\t\t\tmemberImage\n\t\t\t\tmemberPhone\n\t\t\t\tmemberEmail\n\t\t\t\tmemberProducts\n\t\t\t\tmemberBriefs\n\t\t\t\tcreatedAt\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n": types.AdminMembersDocument,
    "\n\tmutation AdminUpdateMember($input: MemberUpdateByAdmin!) {\n\t\tupdateMemberByAdmin(input: $input) {\n\t\t\t_id\n\t\t\tmemberStatus\n\t\t}\n\t}\n": types.AdminUpdateMemberDocument,
    "\n\tquery AdminProducts($input: AllProductsInquiry!) {\n\t\tgetAllProductsByAdmin(input: $input) {\n\t\t\tlist {\n\t\t\t\t_id\n\t\t\t\tproductTitle\n\t\t\t\tproductStatus\n\t\t\t\tproductCategory\n\t\t\t\tproductPricing\n\t\t\t\tproductPrice\n\t\t\t\tproductLikes\n\t\t\t\tproductViews\n\t\t\t\tupdatedAt\n\t\t\t\tmemberData {\n\t\t\t\t\t_id\n\t\t\t\t\tmemberNick\n\t\t\t\t}\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n": types.AdminProductsDocument,
    "\n\tmutation AdminUpdateProduct($input: ProductUpdate!) {\n\t\tupdateProductByAdmin(input: $input) {\n\t\t\t_id\n\t\t\tproductStatus\n\t\t}\n\t}\n": types.AdminUpdateProductDocument,
    "\n\tmutation AdminRemoveProduct($productId: String!) {\n\t\tremoveProductByAdmin(productId: $productId) {\n\t\t\t_id\n\t\t}\n\t}\n": types.AdminRemoveProductDocument,
    "\n\tquery AdminBriefs($input: AllBriefsInquiry!) {\n\t\tgetAllBriefsByAdmin(input: $input) {\n\t\t\tlist {\n\t\t\t\t_id\n\t\t\t\tbriefTitle\n\t\t\t\tbriefStatus\n\t\t\t\tbriefCategory\n\t\t\t\tbriefBudget\n\t\t\t\tbriefDeadline\n\t\t\t\tbriefViews\n\t\t\t\tbriefComments\n\t\t\t\tcreatedAt\n\t\t\t\tmemberData {\n\t\t\t\t\t_id\n\t\t\t\t\tmemberNick\n\t\t\t\t}\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n": types.AdminBriefsDocument,
    "\n\tmutation AdminUpdateBrief($input: BriefUpdate!) {\n\t\tupdateBriefByAdmin(input: $input) {\n\t\t\t_id\n\t\t\tbriefStatus\n\t\t\tbriefDeadline\n\t\t}\n\t}\n": types.AdminUpdateBriefDocument,
    "\n\tmutation AdminRemoveBrief($briefId: String!) {\n\t\tremoveBriefByAdmin(briefId: $briefId) {\n\t\t\t_id\n\t\t}\n\t}\n": types.AdminRemoveBriefDocument,
    "\n\tquery AdminArticles($input: AllBoardArticlesInquiry!) {\n\t\tgetAllBoardArticlesByAdmin(input: $input) {\n\t\t\tlist {\n\t\t\t\t_id\n\t\t\t\tarticleTitle\n\t\t\t\tarticleStatus\n\t\t\t\tarticleCategory\n\t\t\t\tarticleLikes\n\t\t\t\tarticleComments\n\t\t\t\tcreatedAt\n\t\t\t\tmemberData {\n\t\t\t\t\t_id\n\t\t\t\t\tmemberNick\n\t\t\t\t}\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n": types.AdminArticlesDocument,
    "\n\tmutation AdminUpdateArticle($input: BoardArticleUpdate!) {\n\t\tupdateBoardArticleByAdmin(input: $input) {\n\t\t\t_id\n\t\t\tarticleStatus\n\t\t}\n\t}\n": types.AdminUpdateArticleDocument,
    "\n\tmutation AdminRemoveArticle($articleId: String!) {\n\t\tremoveBoardArticleByAdmin(articleId: $articleId) {\n\t\t\t_id\n\t\t}\n\t}\n": types.AdminRemoveArticleDocument,
    "\n\tquery AgentDetail($productId: String!) {\n\t\tgetProduct(productId: $productId) {\n\t\t\t_id\n\t\t\tproductTitle\n\t\t\tproductDesc\n\t\t\tproductStatus\n\t\t\tproductCategory\n\t\t\tproductPricing\n\t\t\tproductPrice\n\t\t\tproductDemoUrl\n\t\t\tproductTags\n\t\t\tproductImages\n\t\t\tproductLikes\n\t\t\tproductViews\n\t\t\tproductComments\n\t\t\tupdatedAt\n\t\t\tmemberData {\n\t\t\t\t_id\n\t\t\t\tmemberNick\n\t\t\t\tmemberFullName\n\t\t\t\tmemberImage\n\t\t\t\tmemberProducts\n\t\t\t\tmemberFollowers\n\t\t\t}\n\t\t}\n\t}\n": types.AgentDetailDocument,
    "\n\tquery AgentViewer($productId: String!) {\n\t\tgetProduct(productId: $productId) {\n\t\t\t_id\n\t\t\tproductViews\n\t\t\tmeLiked {\n\t\t\t\tmemberId\n\t\t\t\tlikeRefId\n\t\t\t\tmyFavorite\n\t\t\t}\n\t\t\tmemberData {\n\t\t\t\t_id\n\t\t\t\tmemberEmail\n\t\t\t\tmemberWhatsapp\n\t\t\t}\n\t\t}\n\t}\n": types.AgentViewerDocument,
    "\n\tmutation LikeAgent($productId: String!) {\n\t\tlikeTargetProduct(productId: $productId) {\n\t\t\t_id\n\t\t\tproductLikes\n\t\t}\n\t}\n": types.LikeAgentDocument,
    "\n\tquery OwnerAgent($productId: String!) {\n\t\tgetProduct(productId: $productId) {\n\t\t\t_id\n\t\t\tmemberId\n\t\t\tproductStatus\n\t\t\tproductTitle\n\t\t\tproductCategory\n\t\t\tproductPricing\n\t\t\tproductPrice\n\t\t\tproductDemoUrl\n\t\t\tproductTags\n\t\t\tproductImages\n\t\t\tproductDesc\n\t\t\tproductLikes\n\t\t\tproductViews\n\t\t\tupdatedAt\n\t\t}\n\t}\n": types.OwnerAgentDocument,
    "\n\tmutation CreateAgent($input: ProductInput!) {\n\t\tcreateProduct(input: $input) {\n\t\t\t_id\n\t\t\tproductTitle\n\t\t\tproductStatus\n\t\t}\n\t}\n": types.CreateAgentDocument,
    "\n\tmutation UpdateAgent($input: ProductUpdate!) {\n\t\tupdateProduct(input: $input) {\n\t\t\t_id\n\t\t\tproductStatus\n\t\t\tproductTitle\n\t\t\tproductCategory\n\t\t\tproductPricing\n\t\t\tproductPrice\n\t\t\tproductDemoUrl\n\t\t\tproductTags\n\t\t\tproductImages\n\t\t\tproductDesc\n\t\t\tupdatedAt\n\t\t}\n\t}\n": types.UpdateAgentDocument,
    "\n\tmutation UploadAgentImage($file: Upload!) {\n\t\timageUploader(file: $file, target: \"product\")\n\t}\n": types.UploadAgentImageDocument,
    "\n\tfragment AgentCard on Product {\n\t\t_id\n\t\tproductTitle\n\t\tproductCategory\n\t\tproductPricing\n\t\tproductPrice\n\t\tproductImages\n\t\tproductLikes\n\t\tproductViews\n\t\tmemberData {\n\t\t\t_id\n\t\t\tmemberNick\n\t\t}\n\t}\n": types.AgentCardFragmentDoc,
    "\n\tquery AgentsList($input: ProductsInquiry!) {\n\t\tgetProducts(input: $input) {\n\t\t\tlist {\n\t\t\t\t...AgentCard\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n": types.AgentsListDocument,
    "\n\tfragment CreatorAgentRow on Product {\n\t\t_id\n\t\tproductTitle\n\t\tproductCategory\n\t\tproductStatus\n\t\tproductPricing\n\t\tproductPrice\n\t\tproductImages\n\t\tproductViews\n\t\tproductLikes\n\t\tproductComments\n\t\tupdatedAt\n\t}\n": types.CreatorAgentRowFragmentDoc,
    "\n\tquery CreatorAgents($input: CreatorProductsInquiry!) {\n\t\tlist: getCreatorProducts(input: $input) {\n\t\t\tlist {\n\t\t\t\t...CreatorAgentRow\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t\tactive: getCreatorProducts(input: { page: 1, limit: 1, search: { productStatus: ACTIVE } }) {\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t\tpaused: getCreatorProducts(input: { page: 1, limit: 1, search: { productStatus: PAUSED } }) {\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n": types.CreatorAgentsDocument,
    "\n\tmutation UpdateAgentStatus($input: ProductUpdate!) {\n\t\tupdateProduct(input: $input) {\n\t\t\t_id\n\t\t\tproductStatus\n\t\t\tupdatedAt\n\t\t}\n\t}\n": types.UpdateAgentStatusDocument,
    "\n\tquery FavoriteAgents($input: OrdinaryInquiry!) {\n\t\tgetFavorities(input: $input) {\n\t\t\tlist {\n\t\t\t\t...AgentCard\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n": types.FavoriteAgentsDocument,
    "\n\tquery VisitedAgents($input: OrdinaryInquiry!) {\n\t\tgetVisited(input: $input) {\n\t\t\tlist {\n\t\t\t\t...AgentCard\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n": types.VisitedAgentsDocument,
    "\n\tmutation Login($input: LoginInput!) {\n\t\tlogin(input: $input) {\n\t\t\t_id\n\t\t\tmemberType\n\t\t\taccessToken\n\t\t}\n\t}\n": types.LoginDocument,
    "\n\tmutation Signup($input: MemberInput!) {\n\t\tsignup(input: $input) {\n\t\t\t_id\n\t\t\tmemberType\n\t\t\taccessToken\n\t\t}\n\t}\n": types.SignupDocument,
    "\n\tfragment BriefCard on Brief {\n\t\t_id\n\t\tbriefTitle\n\t\tbriefContent\n\t\tbriefCategory\n\t\tbriefStatus\n\t\tbriefBudget\n\t\tbriefDeadline\n\t\tbriefViews\n\t\tbriefComments\n\t\tcreatedAt\n\t\tclosedAt\n\t\tmemberData {\n\t\t\t_id\n\t\t\tmemberNick\n\t\t}\n\t}\n": types.BriefCardFragmentDoc,
    "\n\tquery BriefsList($input: BriefsInquiry!) {\n\t\tgetBriefs(input: $input) {\n\t\t\tlist {\n\t\t\t\t...BriefCard\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n": types.BriefsListDocument,
    "\n\tquery BriefDetail($briefId: String!) {\n\t\tgetBrief(briefId: $briefId) {\n\t\t\t_id\n\t\t\tbriefTitle\n\t\t\tbriefContent\n\t\t\tbriefCategory\n\t\t\tbriefStatus\n\t\t\tbriefBudget\n\t\t\tbriefDeadline\n\t\t\tbriefViews\n\t\t\tbriefComments\n\t\t\tcreatedAt\n\t\t\tupdatedAt\n\t\t\tclosedAt\n\t\t\tmemberData {\n\t\t\t\t_id\n\t\t\t\tmemberNick\n\t\t\t\tmemberFullName\n\t\t\t\tmemberImage\n\t\t\t\tmemberBriefs\n\t\t\t}\n\t\t}\n\t}\n": types.BriefDetailDocument,
    "\n\tquery BriefViewer($briefId: String!) {\n\t\tgetBrief(briefId: $briefId) {\n\t\t\t_id\n\t\t\tbriefViews\n\t\t\tmemberData {\n\t\t\t\t_id\n\t\t\t\tmemberEmail\n\t\t\t\tmemberWhatsapp\n\t\t\t}\n\t\t}\n\t}\n": types.BriefViewerDocument,
    "\n\tfragment MyBriefRow on Brief {\n\t\t_id\n\t\tbriefTitle\n\t\tbriefCategory\n\t\tbriefStatus\n\t\tbriefBudget\n\t\tbriefDeadline\n\t\tbriefViews\n\t\tbriefComments\n\t\tcreatedAt\n\t\tupdatedAt\n\t\tclosedAt\n\t}\n": types.MyBriefRowFragmentDoc,
    "\n\tquery MyBriefs($input: MyBriefsInquiry!) {\n\t\tlist: getMyBriefs(input: $input) {\n\t\t\tlist {\n\t\t\t\t...MyBriefRow\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t\topen: getMyBriefs(input: { page: 1, limit: 1, search: { briefStatus: OPEN } }) {\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t\tclosed: getMyBriefs(input: { page: 1, limit: 1, search: { briefStatus: CLOSED } }) {\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n": types.MyBriefsDocument,
    "\n\tmutation UpdateBriefStatus($input: BriefUpdate!) {\n\t\tupdateBrief(input: $input) {\n\t\t\t_id\n\t\t\tbriefStatus\n\t\t\tbriefDeadline\n\t\t\tclosedAt\n\t\t\tupdatedAt\n\t\t}\n\t}\n": types.UpdateBriefStatusDocument,
    "\n\tquery OwnerBrief($briefId: String!) {\n\t\tgetBrief(briefId: $briefId) {\n\t\t\t_id\n\t\t\tmemberId\n\t\t\tbriefStatus\n\t\t\tbriefTitle\n\t\t\tbriefCategory\n\t\t\tbriefContent\n\t\t\tbriefBudget\n\t\t\tbriefDeadline\n\t\t\tupdatedAt\n\t\t}\n\t}\n": types.OwnerBriefDocument,
    "\n\tmutation CreateBrief($input: BriefInput!) {\n\t\tcreateBrief(input: $input) {\n\t\t\t_id\n\t\t\tbriefTitle\n\t\t\tbriefStatus\n\t\t}\n\t}\n": types.CreateBriefDocument,
    "\n\tmutation UpdateBrief($input: BriefUpdate!) {\n\t\tupdateBrief(input: $input) {\n\t\t\t_id\n\t\t\tbriefStatus\n\t\t\tbriefTitle\n\t\t\tbriefCategory\n\t\t\tbriefContent\n\t\t\tbriefBudget\n\t\t\tbriefDeadline\n\t\t\tupdatedAt\n\t\t}\n\t}\n": types.UpdateBriefDocument,
    "\n\tfragment CommentItem on Comment {\n\t\t_id\n\t\tcommentContent\n\t\tcommentGroup\n\t\tcommentRefId\n\t\tmemberId\n\t\tcreatedAt\n\t\tmemberData {\n\t\t\t_id\n\t\t\tmemberNick\n\t\t\tmemberFullName\n\t\t\tmemberImage\n\t\t}\n\t}\n": types.CommentItemFragmentDoc,
    "\n\tquery Comments($input: CommentsInquiry!) {\n\t\tgetComments(input: $input) {\n\t\t\tlist {\n\t\t\t\t...CommentItem\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n": types.CommentsDocument,
    "\n\tmutation CreateComment($input: CommentInput!) {\n\t\tcreateComment(input: $input) {\n\t\t\t...CommentItem\n\t\t}\n\t}\n": types.CreateCommentDocument,
    "\n\tmutation DeleteComment($input: CommentUpdate!) {\n\t\tupdateComment(input: $input) {\n\t\t\t_id\n\t\t\tcommentStatus\n\t\t}\n\t}\n": types.DeleteCommentDocument,
    "\n\tfragment ArticleCard on BoardArticle {\n\t\t_id\n\t\tarticleCategory\n\t\tarticleStatus\n\t\tarticleTitle\n\t\tarticleContent\n\t\tarticleImage\n\t\tarticleLikes\n\t\tarticleViews\n\t\tarticleComments\n\t\tcreatedAt\n\t\tmemberData {\n\t\t\t_id\n\t\t\tmemberNick\n\t\t\tmemberFullName\n\t\t\tmemberImage\n\t\t}\n\t}\n": types.ArticleCardFragmentDoc,
    "\n\tquery ArticlesList($input: BoardArticlesInquiry!) {\n\t\tgetBoardArticles(input: $input) {\n\t\t\tlist {\n\t\t\t\t...ArticleCard\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n": types.ArticlesListDocument,
    "\n\tquery ArticleDetail($articleId: String!) {\n\t\tgetBoardArticle(articleId: $articleId) {\n\t\t\t...ArticleCard\n\t\t\tmemberId\n\t\t\tupdatedAt\n\t\t}\n\t}\n": types.ArticleDetailDocument,
    "\n\tquery ArticleViewer($articleId: String!) {\n\t\tgetBoardArticle(articleId: $articleId) {\n\t\t\t_id\n\t\t\tarticleViews\n\t\t\tmeLiked {\n\t\t\t\tmemberId\n\t\t\t\tlikeRefId\n\t\t\t\tmyFavorite\n\t\t\t}\n\t\t}\n\t}\n": types.ArticleViewerDocument,
    "\n\tmutation LikeArticle($articleId: String!) {\n\t\tlikeTargetBoardArticle(articleId: $articleId) {\n\t\t\t_id\n\t\t\tarticleLikes\n\t\t}\n\t}\n": types.LikeArticleDocument,
    "\n\tquery OwnerArticle($articleId: String!) {\n\t\tgetBoardArticle(articleId: $articleId) {\n\t\t\t_id\n\t\t\tmemberId\n\t\t\tarticleStatus\n\t\t\tarticleCategory\n\t\t\tarticleTitle\n\t\t\tarticleContent\n\t\t\tarticleImage\n\t\t\tupdatedAt\n\t\t}\n\t}\n": types.OwnerArticleDocument,
    "\n\tmutation CreateArticle($input: BoardArticleInput!) {\n\t\tcreateBoardArticle(input: $input) {\n\t\t\t_id\n\t\t\tarticleTitle\n\t\t}\n\t}\n": types.CreateArticleDocument,
    "\n\tmutation UpdateArticle($input: BoardArticleUpdate!) {\n\t\tupdateBoardArticle(input: $input) {\n\t\t\t_id\n\t\t\tarticleStatus\n\t\t\tarticleCategory\n\t\t\tarticleTitle\n\t\t\tarticleContent\n\t\t\tarticleImage\n\t\t\tupdatedAt\n\t\t}\n\t}\n": types.UpdateArticleDocument,
    "\n\tmutation UploadArticleImage($file: Upload!) {\n\t\timageUploader(file: $file, target: \"article\")\n\t}\n": types.UploadArticleImageDocument,
    "\n\tfragment CreatorCard on Member {\n\t\t_id\n\t\tmemberNick\n\t\tmemberFullName\n\t\tmemberImage\n\t\tmemberDesc\n\t\tmemberRank\n\t\tmemberProducts\n\t\tmemberFollowers\n\t\tmemberLikes\n\t}\n": types.CreatorCardFragmentDoc,
    "\n\tquery CreatorsList($input: CreatorsInquiry!) {\n\t\tgetCreators(input: $input) {\n\t\t\tlist {\n\t\t\t\t...CreatorCard\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n": types.CreatorsListDocument,
    "\n\tquery MemberProfile($memberId: String!) {\n\t\tgetMember(memberId: $memberId) {\n\t\t\t_id\n\t\t\tmemberType\n\t\t\tmemberStatus\n\t\t\tmemberNick\n\t\t\tmemberFullName\n\t\t\tmemberImage\n\t\t\tmemberDesc\n\t\t\tmemberRank\n\t\t\tmemberProducts\n\t\t\tmemberBriefs\n\t\t\tmemberArticles\n\t\t\tmemberFollowers\n\t\t\tmemberFollowings\n\t\t\tmemberLikes\n\t\t\tmemberViews\n\t\t\tcreatedAt\n\t\t}\n\t}\n": types.MemberProfileDocument,
    "\n\tquery MemberViewer($memberId: String!) {\n\t\tgetMember(memberId: $memberId) {\n\t\t\t_id\n\t\t\tmemberViews\n\t\t\tmemberEmail\n\t\t\tmemberWhatsapp\n\t\t\tmeFollowed {\n\t\t\t\tfollowingId\n\t\t\t\tfollowerId\n\t\t\t\tmyFollowing\n\t\t\t}\n\t\t}\n\t}\n": types.MemberViewerDocument,
    "\n\tquery CreatorStats {\n\t\tgetMe {\n\t\t\t_id\n\t\t\tmemberProducts\n\t\t\tmemberViews\n\t\t\tmemberLikes\n\t\t\tmemberFollowers\n\t\t}\n\t}\n": types.CreatorStatsDocument,
    "\n\tfragment FollowMember on Member {\n\t\t_id\n\t\tmemberType\n\t\tmemberNick\n\t\tmemberFullName\n\t\tmemberImage\n\t\tmemberFollowers\n\t}\n": types.FollowMemberFragmentDoc,
    "\n\tmutation Subscribe($memberId: String!) {\n\t\tsubscribe(input: $memberId) {\n\t\t\t_id\n\t\t\tfollowingId\n\t\t\tfollowerId\n\t\t}\n\t}\n": types.SubscribeDocument,
    "\n\tmutation Unsubscribe($memberId: String!) {\n\t\tunsubscribe(input: $memberId) {\n\t\t\t_id\n\t\t\tfollowingId\n\t\t\tfollowerId\n\t\t}\n\t}\n": types.UnsubscribeDocument,
    "\n\tquery MyFollowingIds($input: FollowInquiry!) {\n\t\tgetMemberFollowings(input: $input) {\n\t\t\tlist {\n\t\t\t\t_id\n\t\t\t\tfollowingId\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n": types.MyFollowingIdsDocument,
    "\n\tquery Followers($input: FollowInquiry!) {\n\t\tgetMemberFollowers(input: $input) {\n\t\t\tlist {\n\t\t\t\t_id\n\t\t\t\tfollowerId\n\t\t\t\tfollowerData {\n\t\t\t\t\t...FollowMember\n\t\t\t\t}\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n": types.FollowersDocument,
    "\n\tquery Followings($input: FollowInquiry!) {\n\t\tgetMemberFollowings(input: $input) {\n\t\t\tlist {\n\t\t\t\t_id\n\t\t\t\tfollowingId\n\t\t\t\tfollowingData {\n\t\t\t\t\t...FollowMember\n\t\t\t\t}\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n": types.FollowingsDocument,
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
export function graphql(source: "\n\tquery Account {\n\t\tgetMe {\n\t\t\t_id\n\t\t\tmemberType\n\t\t\tmemberNick\n\t\t\tmemberFullName\n\t\t\tmemberImage\n\t\t\tmemberPhone\n\t\t\tmemberEmail\n\t\t\tmemberWhatsapp\n\t\t\tmemberDesc\n\t\t}\n\t}\n"): (typeof documents)["\n\tquery Account {\n\t\tgetMe {\n\t\t\t_id\n\t\t\tmemberType\n\t\t\tmemberNick\n\t\t\tmemberFullName\n\t\t\tmemberImage\n\t\t\tmemberPhone\n\t\t\tmemberEmail\n\t\t\tmemberWhatsapp\n\t\t\tmemberDesc\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tmutation UpdateAccount($input: MemberUpdate!) {\n\t\tupdateMember(input: $input) {\n\t\t\t_id\n\t\t\tmemberNick\n\t\t\tmemberFullName\n\t\t\tmemberImage\n\t\t\tmemberPhone\n\t\t\tmemberEmail\n\t\t\tmemberWhatsapp\n\t\t\tmemberDesc\n\t\t}\n\t}\n"): (typeof documents)["\n\tmutation UpdateAccount($input: MemberUpdate!) {\n\t\tupdateMember(input: $input) {\n\t\t\t_id\n\t\t\tmemberNick\n\t\t\tmemberFullName\n\t\t\tmemberImage\n\t\t\tmemberPhone\n\t\t\tmemberEmail\n\t\t\tmemberWhatsapp\n\t\t\tmemberDesc\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tmutation ChangePassword($input: ChangePasswordInput!) {\n\t\tchangePassword(input: $input)\n\t}\n"): (typeof documents)["\n\tmutation ChangePassword($input: ChangePasswordInput!) {\n\t\tchangePassword(input: $input)\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tmutation UploadAvatar($file: Upload!) {\n\t\timageUploader(file: $file, target: \"member\")\n\t}\n"): (typeof documents)["\n\tmutation UploadAvatar($file: Upload!) {\n\t\timageUploader(file: $file, target: \"member\")\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tquery AdminMembers($input: MembersInquiry!) {\n\t\tgetAllMembersByAdmin(input: $input) {\n\t\t\tlist {\n\t\t\t\t_id\n\t\t\t\tmemberType\n\t\t\t\tmemberStatus\n\t\t\t\tmemberNick\n\t\t\t\tmemberFullName\n\t\t\t\tmemberImage\n\t\t\t\tmemberPhone\n\t\t\t\tmemberEmail\n\t\t\t\tmemberProducts\n\t\t\t\tmemberBriefs\n\t\t\t\tcreatedAt\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n"): (typeof documents)["\n\tquery AdminMembers($input: MembersInquiry!) {\n\t\tgetAllMembersByAdmin(input: $input) {\n\t\t\tlist {\n\t\t\t\t_id\n\t\t\t\tmemberType\n\t\t\t\tmemberStatus\n\t\t\t\tmemberNick\n\t\t\t\tmemberFullName\n\t\t\t\tmemberImage\n\t\t\t\tmemberPhone\n\t\t\t\tmemberEmail\n\t\t\t\tmemberProducts\n\t\t\t\tmemberBriefs\n\t\t\t\tcreatedAt\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tmutation AdminUpdateMember($input: MemberUpdateByAdmin!) {\n\t\tupdateMemberByAdmin(input: $input) {\n\t\t\t_id\n\t\t\tmemberStatus\n\t\t}\n\t}\n"): (typeof documents)["\n\tmutation AdminUpdateMember($input: MemberUpdateByAdmin!) {\n\t\tupdateMemberByAdmin(input: $input) {\n\t\t\t_id\n\t\t\tmemberStatus\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tquery AdminProducts($input: AllProductsInquiry!) {\n\t\tgetAllProductsByAdmin(input: $input) {\n\t\t\tlist {\n\t\t\t\t_id\n\t\t\t\tproductTitle\n\t\t\t\tproductStatus\n\t\t\t\tproductCategory\n\t\t\t\tproductPricing\n\t\t\t\tproductPrice\n\t\t\t\tproductLikes\n\t\t\t\tproductViews\n\t\t\t\tupdatedAt\n\t\t\t\tmemberData {\n\t\t\t\t\t_id\n\t\t\t\t\tmemberNick\n\t\t\t\t}\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n"): (typeof documents)["\n\tquery AdminProducts($input: AllProductsInquiry!) {\n\t\tgetAllProductsByAdmin(input: $input) {\n\t\t\tlist {\n\t\t\t\t_id\n\t\t\t\tproductTitle\n\t\t\t\tproductStatus\n\t\t\t\tproductCategory\n\t\t\t\tproductPricing\n\t\t\t\tproductPrice\n\t\t\t\tproductLikes\n\t\t\t\tproductViews\n\t\t\t\tupdatedAt\n\t\t\t\tmemberData {\n\t\t\t\t\t_id\n\t\t\t\t\tmemberNick\n\t\t\t\t}\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tmutation AdminUpdateProduct($input: ProductUpdate!) {\n\t\tupdateProductByAdmin(input: $input) {\n\t\t\t_id\n\t\t\tproductStatus\n\t\t}\n\t}\n"): (typeof documents)["\n\tmutation AdminUpdateProduct($input: ProductUpdate!) {\n\t\tupdateProductByAdmin(input: $input) {\n\t\t\t_id\n\t\t\tproductStatus\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tmutation AdminRemoveProduct($productId: String!) {\n\t\tremoveProductByAdmin(productId: $productId) {\n\t\t\t_id\n\t\t}\n\t}\n"): (typeof documents)["\n\tmutation AdminRemoveProduct($productId: String!) {\n\t\tremoveProductByAdmin(productId: $productId) {\n\t\t\t_id\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tquery AdminBriefs($input: AllBriefsInquiry!) {\n\t\tgetAllBriefsByAdmin(input: $input) {\n\t\t\tlist {\n\t\t\t\t_id\n\t\t\t\tbriefTitle\n\t\t\t\tbriefStatus\n\t\t\t\tbriefCategory\n\t\t\t\tbriefBudget\n\t\t\t\tbriefDeadline\n\t\t\t\tbriefViews\n\t\t\t\tbriefComments\n\t\t\t\tcreatedAt\n\t\t\t\tmemberData {\n\t\t\t\t\t_id\n\t\t\t\t\tmemberNick\n\t\t\t\t}\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n"): (typeof documents)["\n\tquery AdminBriefs($input: AllBriefsInquiry!) {\n\t\tgetAllBriefsByAdmin(input: $input) {\n\t\t\tlist {\n\t\t\t\t_id\n\t\t\t\tbriefTitle\n\t\t\t\tbriefStatus\n\t\t\t\tbriefCategory\n\t\t\t\tbriefBudget\n\t\t\t\tbriefDeadline\n\t\t\t\tbriefViews\n\t\t\t\tbriefComments\n\t\t\t\tcreatedAt\n\t\t\t\tmemberData {\n\t\t\t\t\t_id\n\t\t\t\t\tmemberNick\n\t\t\t\t}\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tmutation AdminUpdateBrief($input: BriefUpdate!) {\n\t\tupdateBriefByAdmin(input: $input) {\n\t\t\t_id\n\t\t\tbriefStatus\n\t\t\tbriefDeadline\n\t\t}\n\t}\n"): (typeof documents)["\n\tmutation AdminUpdateBrief($input: BriefUpdate!) {\n\t\tupdateBriefByAdmin(input: $input) {\n\t\t\t_id\n\t\t\tbriefStatus\n\t\t\tbriefDeadline\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tmutation AdminRemoveBrief($briefId: String!) {\n\t\tremoveBriefByAdmin(briefId: $briefId) {\n\t\t\t_id\n\t\t}\n\t}\n"): (typeof documents)["\n\tmutation AdminRemoveBrief($briefId: String!) {\n\t\tremoveBriefByAdmin(briefId: $briefId) {\n\t\t\t_id\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tquery AdminArticles($input: AllBoardArticlesInquiry!) {\n\t\tgetAllBoardArticlesByAdmin(input: $input) {\n\t\t\tlist {\n\t\t\t\t_id\n\t\t\t\tarticleTitle\n\t\t\t\tarticleStatus\n\t\t\t\tarticleCategory\n\t\t\t\tarticleLikes\n\t\t\t\tarticleComments\n\t\t\t\tcreatedAt\n\t\t\t\tmemberData {\n\t\t\t\t\t_id\n\t\t\t\t\tmemberNick\n\t\t\t\t}\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n"): (typeof documents)["\n\tquery AdminArticles($input: AllBoardArticlesInquiry!) {\n\t\tgetAllBoardArticlesByAdmin(input: $input) {\n\t\t\tlist {\n\t\t\t\t_id\n\t\t\t\tarticleTitle\n\t\t\t\tarticleStatus\n\t\t\t\tarticleCategory\n\t\t\t\tarticleLikes\n\t\t\t\tarticleComments\n\t\t\t\tcreatedAt\n\t\t\t\tmemberData {\n\t\t\t\t\t_id\n\t\t\t\t\tmemberNick\n\t\t\t\t}\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tmutation AdminUpdateArticle($input: BoardArticleUpdate!) {\n\t\tupdateBoardArticleByAdmin(input: $input) {\n\t\t\t_id\n\t\t\tarticleStatus\n\t\t}\n\t}\n"): (typeof documents)["\n\tmutation AdminUpdateArticle($input: BoardArticleUpdate!) {\n\t\tupdateBoardArticleByAdmin(input: $input) {\n\t\t\t_id\n\t\t\tarticleStatus\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tmutation AdminRemoveArticle($articleId: String!) {\n\t\tremoveBoardArticleByAdmin(articleId: $articleId) {\n\t\t\t_id\n\t\t}\n\t}\n"): (typeof documents)["\n\tmutation AdminRemoveArticle($articleId: String!) {\n\t\tremoveBoardArticleByAdmin(articleId: $articleId) {\n\t\t\t_id\n\t\t}\n\t}\n"];
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
export function graphql(source: "\n\tquery OwnerAgent($productId: String!) {\n\t\tgetProduct(productId: $productId) {\n\t\t\t_id\n\t\t\tmemberId\n\t\t\tproductStatus\n\t\t\tproductTitle\n\t\t\tproductCategory\n\t\t\tproductPricing\n\t\t\tproductPrice\n\t\t\tproductDemoUrl\n\t\t\tproductTags\n\t\t\tproductImages\n\t\t\tproductDesc\n\t\t\tproductLikes\n\t\t\tproductViews\n\t\t\tupdatedAt\n\t\t}\n\t}\n"): (typeof documents)["\n\tquery OwnerAgent($productId: String!) {\n\t\tgetProduct(productId: $productId) {\n\t\t\t_id\n\t\t\tmemberId\n\t\t\tproductStatus\n\t\t\tproductTitle\n\t\t\tproductCategory\n\t\t\tproductPricing\n\t\t\tproductPrice\n\t\t\tproductDemoUrl\n\t\t\tproductTags\n\t\t\tproductImages\n\t\t\tproductDesc\n\t\t\tproductLikes\n\t\t\tproductViews\n\t\t\tupdatedAt\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tmutation CreateAgent($input: ProductInput!) {\n\t\tcreateProduct(input: $input) {\n\t\t\t_id\n\t\t\tproductTitle\n\t\t\tproductStatus\n\t\t}\n\t}\n"): (typeof documents)["\n\tmutation CreateAgent($input: ProductInput!) {\n\t\tcreateProduct(input: $input) {\n\t\t\t_id\n\t\t\tproductTitle\n\t\t\tproductStatus\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tmutation UpdateAgent($input: ProductUpdate!) {\n\t\tupdateProduct(input: $input) {\n\t\t\t_id\n\t\t\tproductStatus\n\t\t\tproductTitle\n\t\t\tproductCategory\n\t\t\tproductPricing\n\t\t\tproductPrice\n\t\t\tproductDemoUrl\n\t\t\tproductTags\n\t\t\tproductImages\n\t\t\tproductDesc\n\t\t\tupdatedAt\n\t\t}\n\t}\n"): (typeof documents)["\n\tmutation UpdateAgent($input: ProductUpdate!) {\n\t\tupdateProduct(input: $input) {\n\t\t\t_id\n\t\t\tproductStatus\n\t\t\tproductTitle\n\t\t\tproductCategory\n\t\t\tproductPricing\n\t\t\tproductPrice\n\t\t\tproductDemoUrl\n\t\t\tproductTags\n\t\t\tproductImages\n\t\t\tproductDesc\n\t\t\tupdatedAt\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tmutation UploadAgentImage($file: Upload!) {\n\t\timageUploader(file: $file, target: \"product\")\n\t}\n"): (typeof documents)["\n\tmutation UploadAgentImage($file: Upload!) {\n\t\timageUploader(file: $file, target: \"product\")\n\t}\n"];
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
export function graphql(source: "\n\tquery FavoriteAgents($input: OrdinaryInquiry!) {\n\t\tgetFavorities(input: $input) {\n\t\t\tlist {\n\t\t\t\t...AgentCard\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n"): (typeof documents)["\n\tquery FavoriteAgents($input: OrdinaryInquiry!) {\n\t\tgetFavorities(input: $input) {\n\t\t\tlist {\n\t\t\t\t...AgentCard\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tquery VisitedAgents($input: OrdinaryInquiry!) {\n\t\tgetVisited(input: $input) {\n\t\t\tlist {\n\t\t\t\t...AgentCard\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n"): (typeof documents)["\n\tquery VisitedAgents($input: OrdinaryInquiry!) {\n\t\tgetVisited(input: $input) {\n\t\t\tlist {\n\t\t\t\t...AgentCard\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n"];
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
export function graphql(source: "\n\tfragment BriefCard on Brief {\n\t\t_id\n\t\tbriefTitle\n\t\tbriefContent\n\t\tbriefCategory\n\t\tbriefStatus\n\t\tbriefBudget\n\t\tbriefDeadline\n\t\tbriefViews\n\t\tbriefComments\n\t\tcreatedAt\n\t\tclosedAt\n\t\tmemberData {\n\t\t\t_id\n\t\t\tmemberNick\n\t\t}\n\t}\n"): (typeof documents)["\n\tfragment BriefCard on Brief {\n\t\t_id\n\t\tbriefTitle\n\t\tbriefContent\n\t\tbriefCategory\n\t\tbriefStatus\n\t\tbriefBudget\n\t\tbriefDeadline\n\t\tbriefViews\n\t\tbriefComments\n\t\tcreatedAt\n\t\tclosedAt\n\t\tmemberData {\n\t\t\t_id\n\t\t\tmemberNick\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tquery BriefsList($input: BriefsInquiry!) {\n\t\tgetBriefs(input: $input) {\n\t\t\tlist {\n\t\t\t\t...BriefCard\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n"): (typeof documents)["\n\tquery BriefsList($input: BriefsInquiry!) {\n\t\tgetBriefs(input: $input) {\n\t\t\tlist {\n\t\t\t\t...BriefCard\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tquery BriefDetail($briefId: String!) {\n\t\tgetBrief(briefId: $briefId) {\n\t\t\t_id\n\t\t\tbriefTitle\n\t\t\tbriefContent\n\t\t\tbriefCategory\n\t\t\tbriefStatus\n\t\t\tbriefBudget\n\t\t\tbriefDeadline\n\t\t\tbriefViews\n\t\t\tbriefComments\n\t\t\tcreatedAt\n\t\t\tupdatedAt\n\t\t\tclosedAt\n\t\t\tmemberData {\n\t\t\t\t_id\n\t\t\t\tmemberNick\n\t\t\t\tmemberFullName\n\t\t\t\tmemberImage\n\t\t\t\tmemberBriefs\n\t\t\t}\n\t\t}\n\t}\n"): (typeof documents)["\n\tquery BriefDetail($briefId: String!) {\n\t\tgetBrief(briefId: $briefId) {\n\t\t\t_id\n\t\t\tbriefTitle\n\t\t\tbriefContent\n\t\t\tbriefCategory\n\t\t\tbriefStatus\n\t\t\tbriefBudget\n\t\t\tbriefDeadline\n\t\t\tbriefViews\n\t\t\tbriefComments\n\t\t\tcreatedAt\n\t\t\tupdatedAt\n\t\t\tclosedAt\n\t\t\tmemberData {\n\t\t\t\t_id\n\t\t\t\tmemberNick\n\t\t\t\tmemberFullName\n\t\t\t\tmemberImage\n\t\t\t\tmemberBriefs\n\t\t\t}\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tquery BriefViewer($briefId: String!) {\n\t\tgetBrief(briefId: $briefId) {\n\t\t\t_id\n\t\t\tbriefViews\n\t\t\tmemberData {\n\t\t\t\t_id\n\t\t\t\tmemberEmail\n\t\t\t\tmemberWhatsapp\n\t\t\t}\n\t\t}\n\t}\n"): (typeof documents)["\n\tquery BriefViewer($briefId: String!) {\n\t\tgetBrief(briefId: $briefId) {\n\t\t\t_id\n\t\t\tbriefViews\n\t\t\tmemberData {\n\t\t\t\t_id\n\t\t\t\tmemberEmail\n\t\t\t\tmemberWhatsapp\n\t\t\t}\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tfragment MyBriefRow on Brief {\n\t\t_id\n\t\tbriefTitle\n\t\tbriefCategory\n\t\tbriefStatus\n\t\tbriefBudget\n\t\tbriefDeadline\n\t\tbriefViews\n\t\tbriefComments\n\t\tcreatedAt\n\t\tupdatedAt\n\t\tclosedAt\n\t}\n"): (typeof documents)["\n\tfragment MyBriefRow on Brief {\n\t\t_id\n\t\tbriefTitle\n\t\tbriefCategory\n\t\tbriefStatus\n\t\tbriefBudget\n\t\tbriefDeadline\n\t\tbriefViews\n\t\tbriefComments\n\t\tcreatedAt\n\t\tupdatedAt\n\t\tclosedAt\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tquery MyBriefs($input: MyBriefsInquiry!) {\n\t\tlist: getMyBriefs(input: $input) {\n\t\t\tlist {\n\t\t\t\t...MyBriefRow\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t\topen: getMyBriefs(input: { page: 1, limit: 1, search: { briefStatus: OPEN } }) {\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t\tclosed: getMyBriefs(input: { page: 1, limit: 1, search: { briefStatus: CLOSED } }) {\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n"): (typeof documents)["\n\tquery MyBriefs($input: MyBriefsInquiry!) {\n\t\tlist: getMyBriefs(input: $input) {\n\t\t\tlist {\n\t\t\t\t...MyBriefRow\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t\topen: getMyBriefs(input: { page: 1, limit: 1, search: { briefStatus: OPEN } }) {\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t\tclosed: getMyBriefs(input: { page: 1, limit: 1, search: { briefStatus: CLOSED } }) {\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tmutation UpdateBriefStatus($input: BriefUpdate!) {\n\t\tupdateBrief(input: $input) {\n\t\t\t_id\n\t\t\tbriefStatus\n\t\t\tbriefDeadline\n\t\t\tclosedAt\n\t\t\tupdatedAt\n\t\t}\n\t}\n"): (typeof documents)["\n\tmutation UpdateBriefStatus($input: BriefUpdate!) {\n\t\tupdateBrief(input: $input) {\n\t\t\t_id\n\t\t\tbriefStatus\n\t\t\tbriefDeadline\n\t\t\tclosedAt\n\t\t\tupdatedAt\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tquery OwnerBrief($briefId: String!) {\n\t\tgetBrief(briefId: $briefId) {\n\t\t\t_id\n\t\t\tmemberId\n\t\t\tbriefStatus\n\t\t\tbriefTitle\n\t\t\tbriefCategory\n\t\t\tbriefContent\n\t\t\tbriefBudget\n\t\t\tbriefDeadline\n\t\t\tupdatedAt\n\t\t}\n\t}\n"): (typeof documents)["\n\tquery OwnerBrief($briefId: String!) {\n\t\tgetBrief(briefId: $briefId) {\n\t\t\t_id\n\t\t\tmemberId\n\t\t\tbriefStatus\n\t\t\tbriefTitle\n\t\t\tbriefCategory\n\t\t\tbriefContent\n\t\t\tbriefBudget\n\t\t\tbriefDeadline\n\t\t\tupdatedAt\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tmutation CreateBrief($input: BriefInput!) {\n\t\tcreateBrief(input: $input) {\n\t\t\t_id\n\t\t\tbriefTitle\n\t\t\tbriefStatus\n\t\t}\n\t}\n"): (typeof documents)["\n\tmutation CreateBrief($input: BriefInput!) {\n\t\tcreateBrief(input: $input) {\n\t\t\t_id\n\t\t\tbriefTitle\n\t\t\tbriefStatus\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tmutation UpdateBrief($input: BriefUpdate!) {\n\t\tupdateBrief(input: $input) {\n\t\t\t_id\n\t\t\tbriefStatus\n\t\t\tbriefTitle\n\t\t\tbriefCategory\n\t\t\tbriefContent\n\t\t\tbriefBudget\n\t\t\tbriefDeadline\n\t\t\tupdatedAt\n\t\t}\n\t}\n"): (typeof documents)["\n\tmutation UpdateBrief($input: BriefUpdate!) {\n\t\tupdateBrief(input: $input) {\n\t\t\t_id\n\t\t\tbriefStatus\n\t\t\tbriefTitle\n\t\t\tbriefCategory\n\t\t\tbriefContent\n\t\t\tbriefBudget\n\t\t\tbriefDeadline\n\t\t\tupdatedAt\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tfragment CommentItem on Comment {\n\t\t_id\n\t\tcommentContent\n\t\tcommentGroup\n\t\tcommentRefId\n\t\tmemberId\n\t\tcreatedAt\n\t\tmemberData {\n\t\t\t_id\n\t\t\tmemberNick\n\t\t\tmemberFullName\n\t\t\tmemberImage\n\t\t}\n\t}\n"): (typeof documents)["\n\tfragment CommentItem on Comment {\n\t\t_id\n\t\tcommentContent\n\t\tcommentGroup\n\t\tcommentRefId\n\t\tmemberId\n\t\tcreatedAt\n\t\tmemberData {\n\t\t\t_id\n\t\t\tmemberNick\n\t\t\tmemberFullName\n\t\t\tmemberImage\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tquery Comments($input: CommentsInquiry!) {\n\t\tgetComments(input: $input) {\n\t\t\tlist {\n\t\t\t\t...CommentItem\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n"): (typeof documents)["\n\tquery Comments($input: CommentsInquiry!) {\n\t\tgetComments(input: $input) {\n\t\t\tlist {\n\t\t\t\t...CommentItem\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tmutation CreateComment($input: CommentInput!) {\n\t\tcreateComment(input: $input) {\n\t\t\t...CommentItem\n\t\t}\n\t}\n"): (typeof documents)["\n\tmutation CreateComment($input: CommentInput!) {\n\t\tcreateComment(input: $input) {\n\t\t\t...CommentItem\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tmutation DeleteComment($input: CommentUpdate!) {\n\t\tupdateComment(input: $input) {\n\t\t\t_id\n\t\t\tcommentStatus\n\t\t}\n\t}\n"): (typeof documents)["\n\tmutation DeleteComment($input: CommentUpdate!) {\n\t\tupdateComment(input: $input) {\n\t\t\t_id\n\t\t\tcommentStatus\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tfragment ArticleCard on BoardArticle {\n\t\t_id\n\t\tarticleCategory\n\t\tarticleStatus\n\t\tarticleTitle\n\t\tarticleContent\n\t\tarticleImage\n\t\tarticleLikes\n\t\tarticleViews\n\t\tarticleComments\n\t\tcreatedAt\n\t\tmemberData {\n\t\t\t_id\n\t\t\tmemberNick\n\t\t\tmemberFullName\n\t\t\tmemberImage\n\t\t}\n\t}\n"): (typeof documents)["\n\tfragment ArticleCard on BoardArticle {\n\t\t_id\n\t\tarticleCategory\n\t\tarticleStatus\n\t\tarticleTitle\n\t\tarticleContent\n\t\tarticleImage\n\t\tarticleLikes\n\t\tarticleViews\n\t\tarticleComments\n\t\tcreatedAt\n\t\tmemberData {\n\t\t\t_id\n\t\t\tmemberNick\n\t\t\tmemberFullName\n\t\t\tmemberImage\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tquery ArticlesList($input: BoardArticlesInquiry!) {\n\t\tgetBoardArticles(input: $input) {\n\t\t\tlist {\n\t\t\t\t...ArticleCard\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n"): (typeof documents)["\n\tquery ArticlesList($input: BoardArticlesInquiry!) {\n\t\tgetBoardArticles(input: $input) {\n\t\t\tlist {\n\t\t\t\t...ArticleCard\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tquery ArticleDetail($articleId: String!) {\n\t\tgetBoardArticle(articleId: $articleId) {\n\t\t\t...ArticleCard\n\t\t\tmemberId\n\t\t\tupdatedAt\n\t\t}\n\t}\n"): (typeof documents)["\n\tquery ArticleDetail($articleId: String!) {\n\t\tgetBoardArticle(articleId: $articleId) {\n\t\t\t...ArticleCard\n\t\t\tmemberId\n\t\t\tupdatedAt\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tquery ArticleViewer($articleId: String!) {\n\t\tgetBoardArticle(articleId: $articleId) {\n\t\t\t_id\n\t\t\tarticleViews\n\t\t\tmeLiked {\n\t\t\t\tmemberId\n\t\t\t\tlikeRefId\n\t\t\t\tmyFavorite\n\t\t\t}\n\t\t}\n\t}\n"): (typeof documents)["\n\tquery ArticleViewer($articleId: String!) {\n\t\tgetBoardArticle(articleId: $articleId) {\n\t\t\t_id\n\t\t\tarticleViews\n\t\t\tmeLiked {\n\t\t\t\tmemberId\n\t\t\t\tlikeRefId\n\t\t\t\tmyFavorite\n\t\t\t}\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tmutation LikeArticle($articleId: String!) {\n\t\tlikeTargetBoardArticle(articleId: $articleId) {\n\t\t\t_id\n\t\t\tarticleLikes\n\t\t}\n\t}\n"): (typeof documents)["\n\tmutation LikeArticle($articleId: String!) {\n\t\tlikeTargetBoardArticle(articleId: $articleId) {\n\t\t\t_id\n\t\t\tarticleLikes\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tquery OwnerArticle($articleId: String!) {\n\t\tgetBoardArticle(articleId: $articleId) {\n\t\t\t_id\n\t\t\tmemberId\n\t\t\tarticleStatus\n\t\t\tarticleCategory\n\t\t\tarticleTitle\n\t\t\tarticleContent\n\t\t\tarticleImage\n\t\t\tupdatedAt\n\t\t}\n\t}\n"): (typeof documents)["\n\tquery OwnerArticle($articleId: String!) {\n\t\tgetBoardArticle(articleId: $articleId) {\n\t\t\t_id\n\t\t\tmemberId\n\t\t\tarticleStatus\n\t\t\tarticleCategory\n\t\t\tarticleTitle\n\t\t\tarticleContent\n\t\t\tarticleImage\n\t\t\tupdatedAt\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tmutation CreateArticle($input: BoardArticleInput!) {\n\t\tcreateBoardArticle(input: $input) {\n\t\t\t_id\n\t\t\tarticleTitle\n\t\t}\n\t}\n"): (typeof documents)["\n\tmutation CreateArticle($input: BoardArticleInput!) {\n\t\tcreateBoardArticle(input: $input) {\n\t\t\t_id\n\t\t\tarticleTitle\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tmutation UpdateArticle($input: BoardArticleUpdate!) {\n\t\tupdateBoardArticle(input: $input) {\n\t\t\t_id\n\t\t\tarticleStatus\n\t\t\tarticleCategory\n\t\t\tarticleTitle\n\t\t\tarticleContent\n\t\t\tarticleImage\n\t\t\tupdatedAt\n\t\t}\n\t}\n"): (typeof documents)["\n\tmutation UpdateArticle($input: BoardArticleUpdate!) {\n\t\tupdateBoardArticle(input: $input) {\n\t\t\t_id\n\t\t\tarticleStatus\n\t\t\tarticleCategory\n\t\t\tarticleTitle\n\t\t\tarticleContent\n\t\t\tarticleImage\n\t\t\tupdatedAt\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tmutation UploadArticleImage($file: Upload!) {\n\t\timageUploader(file: $file, target: \"article\")\n\t}\n"): (typeof documents)["\n\tmutation UploadArticleImage($file: Upload!) {\n\t\timageUploader(file: $file, target: \"article\")\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tfragment CreatorCard on Member {\n\t\t_id\n\t\tmemberNick\n\t\tmemberFullName\n\t\tmemberImage\n\t\tmemberDesc\n\t\tmemberRank\n\t\tmemberProducts\n\t\tmemberFollowers\n\t\tmemberLikes\n\t}\n"): (typeof documents)["\n\tfragment CreatorCard on Member {\n\t\t_id\n\t\tmemberNick\n\t\tmemberFullName\n\t\tmemberImage\n\t\tmemberDesc\n\t\tmemberRank\n\t\tmemberProducts\n\t\tmemberFollowers\n\t\tmemberLikes\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tquery CreatorsList($input: CreatorsInquiry!) {\n\t\tgetCreators(input: $input) {\n\t\t\tlist {\n\t\t\t\t...CreatorCard\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n"): (typeof documents)["\n\tquery CreatorsList($input: CreatorsInquiry!) {\n\t\tgetCreators(input: $input) {\n\t\t\tlist {\n\t\t\t\t...CreatorCard\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tquery MemberProfile($memberId: String!) {\n\t\tgetMember(memberId: $memberId) {\n\t\t\t_id\n\t\t\tmemberType\n\t\t\tmemberStatus\n\t\t\tmemberNick\n\t\t\tmemberFullName\n\t\t\tmemberImage\n\t\t\tmemberDesc\n\t\t\tmemberRank\n\t\t\tmemberProducts\n\t\t\tmemberBriefs\n\t\t\tmemberArticles\n\t\t\tmemberFollowers\n\t\t\tmemberFollowings\n\t\t\tmemberLikes\n\t\t\tmemberViews\n\t\t\tcreatedAt\n\t\t}\n\t}\n"): (typeof documents)["\n\tquery MemberProfile($memberId: String!) {\n\t\tgetMember(memberId: $memberId) {\n\t\t\t_id\n\t\t\tmemberType\n\t\t\tmemberStatus\n\t\t\tmemberNick\n\t\t\tmemberFullName\n\t\t\tmemberImage\n\t\t\tmemberDesc\n\t\t\tmemberRank\n\t\t\tmemberProducts\n\t\t\tmemberBriefs\n\t\t\tmemberArticles\n\t\t\tmemberFollowers\n\t\t\tmemberFollowings\n\t\t\tmemberLikes\n\t\t\tmemberViews\n\t\t\tcreatedAt\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tquery MemberViewer($memberId: String!) {\n\t\tgetMember(memberId: $memberId) {\n\t\t\t_id\n\t\t\tmemberViews\n\t\t\tmemberEmail\n\t\t\tmemberWhatsapp\n\t\t\tmeFollowed {\n\t\t\t\tfollowingId\n\t\t\t\tfollowerId\n\t\t\t\tmyFollowing\n\t\t\t}\n\t\t}\n\t}\n"): (typeof documents)["\n\tquery MemberViewer($memberId: String!) {\n\t\tgetMember(memberId: $memberId) {\n\t\t\t_id\n\t\t\tmemberViews\n\t\t\tmemberEmail\n\t\t\tmemberWhatsapp\n\t\t\tmeFollowed {\n\t\t\t\tfollowingId\n\t\t\t\tfollowerId\n\t\t\t\tmyFollowing\n\t\t\t}\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tquery CreatorStats {\n\t\tgetMe {\n\t\t\t_id\n\t\t\tmemberProducts\n\t\t\tmemberViews\n\t\t\tmemberLikes\n\t\t\tmemberFollowers\n\t\t}\n\t}\n"): (typeof documents)["\n\tquery CreatorStats {\n\t\tgetMe {\n\t\t\t_id\n\t\t\tmemberProducts\n\t\t\tmemberViews\n\t\t\tmemberLikes\n\t\t\tmemberFollowers\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tfragment FollowMember on Member {\n\t\t_id\n\t\tmemberType\n\t\tmemberNick\n\t\tmemberFullName\n\t\tmemberImage\n\t\tmemberFollowers\n\t}\n"): (typeof documents)["\n\tfragment FollowMember on Member {\n\t\t_id\n\t\tmemberType\n\t\tmemberNick\n\t\tmemberFullName\n\t\tmemberImage\n\t\tmemberFollowers\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tmutation Subscribe($memberId: String!) {\n\t\tsubscribe(input: $memberId) {\n\t\t\t_id\n\t\t\tfollowingId\n\t\t\tfollowerId\n\t\t}\n\t}\n"): (typeof documents)["\n\tmutation Subscribe($memberId: String!) {\n\t\tsubscribe(input: $memberId) {\n\t\t\t_id\n\t\t\tfollowingId\n\t\t\tfollowerId\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tmutation Unsubscribe($memberId: String!) {\n\t\tunsubscribe(input: $memberId) {\n\t\t\t_id\n\t\t\tfollowingId\n\t\t\tfollowerId\n\t\t}\n\t}\n"): (typeof documents)["\n\tmutation Unsubscribe($memberId: String!) {\n\t\tunsubscribe(input: $memberId) {\n\t\t\t_id\n\t\t\tfollowingId\n\t\t\tfollowerId\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tquery MyFollowingIds($input: FollowInquiry!) {\n\t\tgetMemberFollowings(input: $input) {\n\t\t\tlist {\n\t\t\t\t_id\n\t\t\t\tfollowingId\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n"): (typeof documents)["\n\tquery MyFollowingIds($input: FollowInquiry!) {\n\t\tgetMemberFollowings(input: $input) {\n\t\t\tlist {\n\t\t\t\t_id\n\t\t\t\tfollowingId\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tquery Followers($input: FollowInquiry!) {\n\t\tgetMemberFollowers(input: $input) {\n\t\t\tlist {\n\t\t\t\t_id\n\t\t\t\tfollowerId\n\t\t\t\tfollowerData {\n\t\t\t\t\t...FollowMember\n\t\t\t\t}\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n"): (typeof documents)["\n\tquery Followers($input: FollowInquiry!) {\n\t\tgetMemberFollowers(input: $input) {\n\t\t\tlist {\n\t\t\t\t_id\n\t\t\t\tfollowerId\n\t\t\t\tfollowerData {\n\t\t\t\t\t...FollowMember\n\t\t\t\t}\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tquery Followings($input: FollowInquiry!) {\n\t\tgetMemberFollowings(input: $input) {\n\t\t\tlist {\n\t\t\t\t_id\n\t\t\t\tfollowingId\n\t\t\t\tfollowingData {\n\t\t\t\t\t...FollowMember\n\t\t\t\t}\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n"): (typeof documents)["\n\tquery Followings($input: FollowInquiry!) {\n\t\tgetMemberFollowings(input: $input) {\n\t\t\tlist {\n\t\t\t\t_id\n\t\t\t\tfollowingId\n\t\t\t\tfollowingData {\n\t\t\t\t\t...FollowMember\n\t\t\t\t}\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tquery DevApiProducts($input: ProductsInquiry!) {\n\t\tgetProducts(input: $input) {\n\t\t\tlist {\n\t\t\t\t_id\n\t\t\t\tproductTitle\n\t\t\t\tproductCategory\n\t\t\t\tproductPricing\n\t\t\t\tproductPrice\n\t\t\t\tproductLikes\n\t\t\t\tproductViews\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n"): (typeof documents)["\n\tquery DevApiProducts($input: ProductsInquiry!) {\n\t\tgetProducts(input: $input) {\n\t\t\tlist {\n\t\t\t\t_id\n\t\t\t\tproductTitle\n\t\t\t\tproductCategory\n\t\t\t\tproductPricing\n\t\t\t\tproductPrice\n\t\t\t\tproductLikes\n\t\t\t\tproductViews\n\t\t\t}\n\t\t\tmetaCounter {\n\t\t\t\ttotal\n\t\t\t}\n\t\t}\n\t}\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;