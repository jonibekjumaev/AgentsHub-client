/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type AbaiSearch = {
  articleCategory?: BoardArticleCategory | null | undefined;
  articleStatus?: BoardArticleStatus | null | undefined;
};

export type AlbiSearch = {
  briefStatus?: BriefStatus | null | undefined;
  categoryList?: Array<AgentCategory> | null | undefined;
  memberId?: string | null | undefined;
  text?: string | null | undefined;
};

export type AlpiSearch = {
  categoryList?: Array<AgentCategory> | null | undefined;
  memberId?: string | null | undefined;
  periodsRange?: PeriodsRange | null | undefined;
  pricesRange?: PricesRange | null | undefined;
  pricingList?: Array<ProductPricing> | null | undefined;
  productStatus?: ProductStatus | null | undefined;
  tagList?: Array<string> | null | undefined;
  text?: string | null | undefined;
};

export type AgentCategory =
  | 'AUTOMATION'
  | 'CONTENT'
  | 'CUSTOMER_SUPPORT'
  | 'DATA_ANALYSIS'
  | 'EDUCATION'
  | 'MARKETING'
  | 'OTHER'
  | 'SALES';

export type AllBoardArticlesInquiry = {
  direction?: Direction | null | undefined;
  limit: number;
  page: number;
  search: AbaiSearch;
  sort?: string | null | undefined;
};

export type AllBriefsInquiry = {
  direction?: Direction | null | undefined;
  limit: number;
  page: number;
  search: AlbiSearch;
  sort?: string | null | undefined;
};

export type AllProductsInquiry = {
  direction?: Direction | null | undefined;
  limit: number;
  page: number;
  search: AlpiSearch;
  sort?: string | null | undefined;
};

export type BaiSearch = {
  articleCategory?: BoardArticleCategory | null | undefined;
  memberId?: string | null | undefined;
  text?: string | null | undefined;
};

export type BiSearch = {
  briefStatus?: BriefStatus | null | undefined;
  categoryList?: Array<AgentCategory> | null | undefined;
  memberId?: string | null | undefined;
  text?: string | null | undefined;
};

export type BoardArticleCategory =
  | 'FREE'
  | 'HUMOR'
  | 'NEWS'
  | 'RECOMMEND';

export type BoardArticleInput = {
  articleCategory: BoardArticleCategory;
  articleContent: string;
  articleImage?: string | null | undefined;
  articleTitle: string;
};

export type BoardArticleStatus =
  | 'ACTIVE'
  | 'DELETE';

export type BoardArticleUpdate = {
  _id: string;
  articleContent?: string | null | undefined;
  articleImage?: string | null | undefined;
  articleStatus?: BoardArticleStatus | null | undefined;
  articleTitle?: string | null | undefined;
};

export type BoardArticlesInquiry = {
  direction?: Direction | null | undefined;
  limit: number;
  page: number;
  search: BaiSearch;
  sort?: string | null | undefined;
};

export type BriefInput = {
  briefBudget?: number | null | undefined;
  briefCategory: AgentCategory;
  briefContent: string;
  briefDeadline?: string | null | undefined;
  briefTitle: string;
};

export type BriefStatus =
  | 'CLOSED'
  | 'DELETE'
  | 'OPEN';

export type BriefUpdate = {
  _id: string;
  briefBudget?: number | null | undefined;
  briefCategory?: AgentCategory | null | undefined;
  briefContent?: string | null | undefined;
  briefDeadline?: string | null | undefined;
  briefStatus?: BriefStatus | null | undefined;
  briefTitle?: string | null | undefined;
};

export type BriefsInquiry = {
  direction?: Direction | null | undefined;
  limit: number;
  page: number;
  search: BiSearch;
  sort?: string | null | undefined;
};

export type CiSearch = {
  commentGroup: CommentGroup;
  commentRefId: string;
};

export type CpiSearch = {
  categoryList?: Array<AgentCategory> | null | undefined;
  pricesRange?: PricesRange | null | undefined;
  pricingList?: Array<ProductPricing> | null | undefined;
  productStatus?: ProductStatus | null | undefined;
  tagList?: Array<string> | null | undefined;
  text?: string | null | undefined;
};

export type CriSearch = {
  text?: string | null | undefined;
};

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export type CommentGroup =
  | 'ARTICLE'
  | 'BRIEF'
  | 'MEMBER'
  | 'PRODUCT';

export type CommentInput = {
  commentContent: string;
  commentGroup: CommentGroup;
  commentRefId: string;
};

export type CommentStatus =
  | 'ACTIVE'
  | 'DELETE';

export type CommentUpdate = {
  _id: string;
  commentContent?: string | null | undefined;
  commentStatus?: CommentStatus | null | undefined;
};

export type CommentsInquiry = {
  direction?: Direction | null | undefined;
  limit: number;
  page: number;
  search: CiSearch;
  sort?: string | null | undefined;
};

export type CreatorProductsInquiry = {
  direction?: Direction | null | undefined;
  limit: number;
  page: number;
  search: CpiSearch;
  sort?: string | null | undefined;
};

export type CreatorsInquiry = {
  direction?: Direction | null | undefined;
  limit: number;
  page: number;
  search: CriSearch;
  sort?: string | null | undefined;
};

export type Direction =
  | 'ASC'
  | 'DESC';

export type FollowInquiry = {
  limit: number;
  page: number;
  search: FollowSearch;
};

export type FollowSearch = {
  followerId?: string | null | undefined;
  followingId?: string | null | undefined;
};

export type LoginInput = {
  memberNick: string;
  memberPassword: string;
};

export type MbiSearch = {
  briefStatus?: BriefStatus | null | undefined;
  categoryList?: Array<AgentCategory> | null | undefined;
  text?: string | null | undefined;
};

export type MiSearch = {
  memberStatus?: MemberStatus | null | undefined;
  memberType?: MemberType | null | undefined;
  text?: string | null | undefined;
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

export type MemberUpdate = {
  memberDesc?: string | null | undefined;
  memberEmail?: string | null | undefined;
  memberFullName?: string | null | undefined;
  memberImage?: string | null | undefined;
  memberNick?: string | null | undefined;
  memberPhone?: string | null | undefined;
  memberWhatsapp?: string | null | undefined;
};

export type MemberUpdateByAdmin = {
  _id: string;
  memberDesc?: string | null | undefined;
  memberEmail?: string | null | undefined;
  memberFullName?: string | null | undefined;
  memberImage?: string | null | undefined;
  memberNick?: string | null | undefined;
  memberPhone?: string | null | undefined;
  memberStatus?: MemberStatus | null | undefined;
  memberWhatsapp?: string | null | undefined;
};

export type MembersInquiry = {
  direction?: Direction | null | undefined;
  limit: number;
  page: number;
  search: MiSearch;
  sort?: string | null | undefined;
};

export type MyBriefsInquiry = {
  direction?: Direction | null | undefined;
  limit: number;
  page: number;
  search: MbiSearch;
  sort?: string | null | undefined;
};

export type OrdinaryInquiry = {
  limit: number;
  page: number;
};

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

export type ProductInput = {
  productCategory: AgentCategory;
  productDemoUrl?: string | null | undefined;
  productDesc: string;
  productImages: Array<string>;
  productPrice?: number | null | undefined;
  productPricing: ProductPricing;
  productTags?: Array<string> | null | undefined;
  productTitle: string;
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

export type AccountQueryVariables = Exact<{ [key: string]: never; }>;


export type AccountQuery = { getMe: { _id: string, memberType: MemberType, memberNick: string, memberFullName: string | null, memberImage: string, memberPhone: string, memberEmail: string | null, memberWhatsapp: string | null, memberDesc: string | null } };

export type UpdateAccountMutationVariables = Exact<{
  input: MemberUpdate;
}>;


export type UpdateAccountMutation = { updateMember: { _id: string, memberNick: string, memberFullName: string | null, memberImage: string, memberPhone: string, memberEmail: string | null, memberWhatsapp: string | null, memberDesc: string | null } };

export type ChangePasswordMutationVariables = Exact<{
  input: ChangePasswordInput;
}>;


export type ChangePasswordMutation = { changePassword: boolean };

export type UploadAvatarMutationVariables = Exact<{
  file: File;
}>;


export type UploadAvatarMutation = { imageUploader: string };

export type AdminMembersQueryVariables = Exact<{
  input: MembersInquiry;
}>;


export type AdminMembersQuery = { getAllMembersByAdmin: { list: Array<{ _id: string, memberType: MemberType, memberStatus: MemberStatus, memberNick: string, memberFullName: string | null, memberImage: string, memberPhone: string, memberEmail: string | null, memberProducts: number, memberBriefs: number, createdAt: string }>, metaCounter: Array<{ total: number | null }> | null } };

export type AdminUpdateMemberMutationVariables = Exact<{
  input: MemberUpdateByAdmin;
}>;


export type AdminUpdateMemberMutation = { updateMemberByAdmin: { _id: string, memberStatus: MemberStatus } };

export type AdminProductsQueryVariables = Exact<{
  input: AllProductsInquiry;
}>;


export type AdminProductsQuery = { getAllProductsByAdmin: { list: Array<{ _id: string, productTitle: string, productStatus: ProductStatus, productCategory: AgentCategory, productPricing: ProductPricing, productPrice: number | null, productLikes: number, productViews: number, updatedAt: string, memberData: { _id: string, memberNick: string } | null }>, metaCounter: Array<{ total: number | null }> | null } };

export type AdminUpdateProductMutationVariables = Exact<{
  input: ProductUpdate;
}>;


export type AdminUpdateProductMutation = { updateProductByAdmin: { _id: string, productStatus: ProductStatus } };

export type AdminRemoveProductMutationVariables = Exact<{
  productId: string;
}>;


export type AdminRemoveProductMutation = { removeProductByAdmin: { _id: string } };

export type AdminBriefsQueryVariables = Exact<{
  input: AllBriefsInquiry;
}>;


export type AdminBriefsQuery = { getAllBriefsByAdmin: { list: Array<{ _id: string, briefTitle: string, briefStatus: BriefStatus, briefCategory: AgentCategory, briefBudget: number | null, briefDeadline: string | null, briefViews: number, briefComments: number, createdAt: string, memberData: { _id: string, memberNick: string } | null }>, metaCounter: Array<{ total: number | null }> | null } };

export type AdminUpdateBriefMutationVariables = Exact<{
  input: BriefUpdate;
}>;


export type AdminUpdateBriefMutation = { updateBriefByAdmin: { _id: string, briefStatus: BriefStatus, briefDeadline: string | null } };

export type AdminRemoveBriefMutationVariables = Exact<{
  briefId: string;
}>;


export type AdminRemoveBriefMutation = { removeBriefByAdmin: { _id: string } };

export type AdminArticlesQueryVariables = Exact<{
  input: AllBoardArticlesInquiry;
}>;


export type AdminArticlesQuery = { getAllBoardArticlesByAdmin: { list: Array<{ _id: string, articleTitle: string, articleStatus: BoardArticleStatus, articleCategory: BoardArticleCategory, articleLikes: number, articleComments: number, createdAt: string, memberData: { _id: string, memberNick: string } | null }>, metaCounter: Array<{ total: number | null }> | null } };

export type AdminUpdateArticleMutationVariables = Exact<{
  input: BoardArticleUpdate;
}>;


export type AdminUpdateArticleMutation = { updateBoardArticleByAdmin: { _id: string, articleStatus: BoardArticleStatus } };

export type AdminRemoveArticleMutationVariables = Exact<{
  articleId: string;
}>;


export type AdminRemoveArticleMutation = { removeBoardArticleByAdmin: { _id: string } };

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

export type OwnerAgentQueryVariables = Exact<{
  productId: string;
}>;


export type OwnerAgentQuery = { getProduct: { _id: string, memberId: string, productStatus: ProductStatus, productTitle: string, productCategory: AgentCategory, productPricing: ProductPricing, productPrice: number | null, productDemoUrl: string | null, productTags: Array<string> | null, productImages: Array<string>, productDesc: string, productLikes: number, productViews: number, updatedAt: string } };

export type CreateAgentMutationVariables = Exact<{
  input: ProductInput;
}>;


export type CreateAgentMutation = { createProduct: { _id: string, productTitle: string, productStatus: ProductStatus } };

export type UpdateAgentMutationVariables = Exact<{
  input: ProductUpdate;
}>;


export type UpdateAgentMutation = { updateProduct: { _id: string, productStatus: ProductStatus, productTitle: string, productCategory: AgentCategory, productPricing: ProductPricing, productPrice: number | null, productDemoUrl: string | null, productTags: Array<string> | null, productImages: Array<string>, productDesc: string, updatedAt: string } };

export type UploadAgentImageMutationVariables = Exact<{
  file: File;
}>;


export type UploadAgentImageMutation = { imageUploader: string };

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

export type FavoriteAgentsQueryVariables = Exact<{
  input: OrdinaryInquiry;
}>;


export type FavoriteAgentsQuery = { getFavorities: { list: Array<{ _id: string, productTitle: string, productCategory: AgentCategory, productPricing: ProductPricing, productPrice: number | null, productImages: Array<string>, productLikes: number, productViews: number, memberData: { _id: string, memberNick: string } | null }>, metaCounter: Array<{ total: number | null }> | null } };

export type VisitedAgentsQueryVariables = Exact<{
  input: OrdinaryInquiry;
}>;


export type VisitedAgentsQuery = { getVisited: { list: Array<{ _id: string, productTitle: string, productCategory: AgentCategory, productPricing: ProductPricing, productPrice: number | null, productImages: Array<string>, productLikes: number, productViews: number, memberData: { _id: string, memberNick: string } | null }>, metaCounter: Array<{ total: number | null }> | null } };

export type LoginMutationVariables = Exact<{
  input: LoginInput;
}>;


export type LoginMutation = { login: { _id: string, memberType: MemberType, accessToken: string | null } };

export type SignupMutationVariables = Exact<{
  input: MemberInput;
}>;


export type SignupMutation = { signup: { _id: string, memberType: MemberType, accessToken: string | null } };

export type BriefCardFragment = { _id: string, briefTitle: string, briefContent: string, briefCategory: AgentCategory, briefStatus: BriefStatus, briefBudget: number | null, briefDeadline: string | null, briefViews: number, briefComments: number, createdAt: string, closedAt: string | null, memberData: { _id: string, memberNick: string } | null };

export type BriefsListQueryVariables = Exact<{
  input: BriefsInquiry;
}>;


export type BriefsListQuery = { getBriefs: { list: Array<{ _id: string, briefTitle: string, briefContent: string, briefCategory: AgentCategory, briefStatus: BriefStatus, briefBudget: number | null, briefDeadline: string | null, briefViews: number, briefComments: number, createdAt: string, closedAt: string | null, memberData: { _id: string, memberNick: string } | null }>, metaCounter: Array<{ total: number | null }> | null } };

export type BriefDetailQueryVariables = Exact<{
  briefId: string;
}>;


export type BriefDetailQuery = { getBrief: { _id: string, briefTitle: string, briefContent: string, briefCategory: AgentCategory, briefStatus: BriefStatus, briefBudget: number | null, briefDeadline: string | null, briefViews: number, briefComments: number, createdAt: string, updatedAt: string, closedAt: string | null, memberData: { _id: string, memberNick: string, memberFullName: string | null, memberImage: string, memberBriefs: number } | null } };

export type BriefViewerQueryVariables = Exact<{
  briefId: string;
}>;


export type BriefViewerQuery = { getBrief: { _id: string, briefViews: number, memberData: { _id: string, memberEmail: string | null, memberWhatsapp: string | null } | null } };

export type MyBriefRowFragment = { _id: string, briefTitle: string, briefCategory: AgentCategory, briefStatus: BriefStatus, briefBudget: number | null, briefDeadline: string | null, briefViews: number, briefComments: number, createdAt: string, updatedAt: string, closedAt: string | null };

export type MyBriefsQueryVariables = Exact<{
  input: MyBriefsInquiry;
}>;


export type MyBriefsQuery = { list: { list: Array<{ _id: string, briefTitle: string, briefCategory: AgentCategory, briefStatus: BriefStatus, briefBudget: number | null, briefDeadline: string | null, briefViews: number, briefComments: number, createdAt: string, updatedAt: string, closedAt: string | null }>, metaCounter: Array<{ total: number | null }> | null }, open: { metaCounter: Array<{ total: number | null }> | null }, closed: { metaCounter: Array<{ total: number | null }> | null } };

export type UpdateBriefStatusMutationVariables = Exact<{
  input: BriefUpdate;
}>;


export type UpdateBriefStatusMutation = { updateBrief: { _id: string, briefStatus: BriefStatus, briefDeadline: string | null, closedAt: string | null, updatedAt: string } };

export type OwnerBriefQueryVariables = Exact<{
  briefId: string;
}>;


export type OwnerBriefQuery = { getBrief: { _id: string, memberId: string, briefStatus: BriefStatus, briefTitle: string, briefCategory: AgentCategory, briefContent: string, briefBudget: number | null, briefDeadline: string | null, updatedAt: string } };

export type CreateBriefMutationVariables = Exact<{
  input: BriefInput;
}>;


export type CreateBriefMutation = { createBrief: { _id: string, briefTitle: string, briefStatus: BriefStatus } };

export type UpdateBriefMutationVariables = Exact<{
  input: BriefUpdate;
}>;


export type UpdateBriefMutation = { updateBrief: { _id: string, briefStatus: BriefStatus, briefTitle: string, briefCategory: AgentCategory, briefContent: string, briefBudget: number | null, briefDeadline: string | null, updatedAt: string } };

export type CommentItemFragment = { _id: string, commentContent: string, commentGroup: CommentGroup, commentRefId: string, memberId: string, createdAt: string, memberData: { _id: string, memberNick: string, memberFullName: string | null, memberImage: string } | null };

export type CommentsQueryVariables = Exact<{
  input: CommentsInquiry;
}>;


export type CommentsQuery = { getComments: { list: Array<{ _id: string, commentContent: string, commentGroup: CommentGroup, commentRefId: string, memberId: string, createdAt: string, memberData: { _id: string, memberNick: string, memberFullName: string | null, memberImage: string } | null }>, metaCounter: Array<{ total: number | null }> | null } };

export type CreateCommentMutationVariables = Exact<{
  input: CommentInput;
}>;


export type CreateCommentMutation = { createComment: { _id: string, commentContent: string, commentGroup: CommentGroup, commentRefId: string, memberId: string, createdAt: string, memberData: { _id: string, memberNick: string, memberFullName: string | null, memberImage: string } | null } };

export type DeleteCommentMutationVariables = Exact<{
  input: CommentUpdate;
}>;


export type DeleteCommentMutation = { updateComment: { _id: string, commentStatus: CommentStatus } };

export type ArticleCardFragment = { _id: string, articleCategory: BoardArticleCategory, articleStatus: BoardArticleStatus, articleTitle: string, articleContent: string, articleImage: string | null, articleLikes: number, articleViews: number, articleComments: number, createdAt: string, memberData: { _id: string, memberNick: string, memberFullName: string | null, memberImage: string } | null };

export type ArticlesListQueryVariables = Exact<{
  input: BoardArticlesInquiry;
}>;


export type ArticlesListQuery = { getBoardArticles: { list: Array<{ _id: string, articleCategory: BoardArticleCategory, articleStatus: BoardArticleStatus, articleTitle: string, articleContent: string, articleImage: string | null, articleLikes: number, articleViews: number, articleComments: number, createdAt: string, memberData: { _id: string, memberNick: string, memberFullName: string | null, memberImage: string } | null }>, metaCounter: Array<{ total: number | null }> | null } };

export type ArticleDetailQueryVariables = Exact<{
  articleId: string;
}>;


export type ArticleDetailQuery = { getBoardArticle: { memberId: string, updatedAt: string, _id: string, articleCategory: BoardArticleCategory, articleStatus: BoardArticleStatus, articleTitle: string, articleContent: string, articleImage: string | null, articleLikes: number, articleViews: number, articleComments: number, createdAt: string, memberData: { _id: string, memberNick: string, memberFullName: string | null, memberImage: string } | null } };

export type ArticleViewerQueryVariables = Exact<{
  articleId: string;
}>;


export type ArticleViewerQuery = { getBoardArticle: { _id: string, articleViews: number, meLiked: Array<{ memberId: string, likeRefId: string, myFavorite: boolean }> | null } };

export type LikeArticleMutationVariables = Exact<{
  articleId: string;
}>;


export type LikeArticleMutation = { likeTargetBoardArticle: { _id: string, articleLikes: number } };

export type OwnerArticleQueryVariables = Exact<{
  articleId: string;
}>;


export type OwnerArticleQuery = { getBoardArticle: { _id: string, memberId: string, articleStatus: BoardArticleStatus, articleCategory: BoardArticleCategory, articleTitle: string, articleContent: string, articleImage: string | null, updatedAt: string } };

export type CreateArticleMutationVariables = Exact<{
  input: BoardArticleInput;
}>;


export type CreateArticleMutation = { createBoardArticle: { _id: string, articleTitle: string } };

export type UpdateArticleMutationVariables = Exact<{
  input: BoardArticleUpdate;
}>;


export type UpdateArticleMutation = { updateBoardArticle: { _id: string, articleStatus: BoardArticleStatus, articleCategory: BoardArticleCategory, articleTitle: string, articleContent: string, articleImage: string | null, updatedAt: string } };

export type UploadArticleImageMutationVariables = Exact<{
  file: File;
}>;


export type UploadArticleImageMutation = { imageUploader: string };

export type CreatorCardFragment = { _id: string, memberNick: string, memberFullName: string | null, memberImage: string, memberDesc: string | null, memberRank: number, memberProducts: number, memberFollowers: number, memberLikes: number };

export type CreatorsListQueryVariables = Exact<{
  input: CreatorsInquiry;
}>;


export type CreatorsListQuery = { getCreators: { list: Array<{ _id: string, memberNick: string, memberFullName: string | null, memberImage: string, memberDesc: string | null, memberRank: number, memberProducts: number, memberFollowers: number, memberLikes: number }>, metaCounter: Array<{ total: number | null }> | null } };

export type MemberProfileQueryVariables = Exact<{
  memberId: string;
}>;


export type MemberProfileQuery = { getMember: { _id: string, memberType: MemberType, memberStatus: MemberStatus, memberNick: string, memberFullName: string | null, memberImage: string, memberDesc: string | null, memberRank: number, memberProducts: number, memberBriefs: number, memberArticles: number, memberFollowers: number, memberFollowings: number, memberLikes: number, memberViews: number, createdAt: string } };

export type MemberViewerQueryVariables = Exact<{
  memberId: string;
}>;


export type MemberViewerQuery = { getMember: { _id: string, memberViews: number, memberEmail: string | null, memberWhatsapp: string | null, meFollowed: Array<{ followingId: string, followerId: string, myFollowing: boolean }> | null } };

export type CreatorStatsQueryVariables = Exact<{ [key: string]: never; }>;


export type CreatorStatsQuery = { getMe: { _id: string, memberProducts: number, memberViews: number, memberLikes: number, memberFollowers: number } };

export type FollowMemberFragment = { _id: string, memberType: MemberType, memberNick: string, memberFullName: string | null, memberImage: string, memberFollowers: number };

export type SubscribeMutationVariables = Exact<{
  memberId: string;
}>;


export type SubscribeMutation = { subscribe: { _id: string, followingId: string, followerId: string } };

export type UnsubscribeMutationVariables = Exact<{
  memberId: string;
}>;


export type UnsubscribeMutation = { unsubscribe: { _id: string, followingId: string, followerId: string } };

export type MyFollowingIdsQueryVariables = Exact<{
  input: FollowInquiry;
}>;


export type MyFollowingIdsQuery = { getMemberFollowings: { list: Array<{ _id: string, followingId: string }>, metaCounter: Array<{ total: number | null }> | null } };

export type FollowersQueryVariables = Exact<{
  input: FollowInquiry;
}>;


export type FollowersQuery = { getMemberFollowers: { list: Array<{ _id: string, followerId: string, followerData: { _id: string, memberType: MemberType, memberNick: string, memberFullName: string | null, memberImage: string, memberFollowers: number } | null }>, metaCounter: Array<{ total: number | null }> | null } };

export type FollowingsQueryVariables = Exact<{
  input: FollowInquiry;
}>;


export type FollowingsQuery = { getMemberFollowings: { list: Array<{ _id: string, followingId: string, followingData: { _id: string, memberType: MemberType, memberNick: string, memberFullName: string | null, memberImage: string, memberFollowers: number } | null }>, metaCounter: Array<{ total: number | null }> | null } };

export type DevApiProductsQueryVariables = Exact<{
  input: ProductsInquiry;
}>;


export type DevApiProductsQuery = { getProducts: { list: Array<{ _id: string, productTitle: string, productCategory: AgentCategory, productPricing: ProductPricing, productPrice: number | null, productLikes: number, productViews: number }>, metaCounter: Array<{ total: number | null }> | null } };

export const AgentCardFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AgentCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"productTitle"}},{"kind":"Field","name":{"kind":"Name","value":"productCategory"}},{"kind":"Field","name":{"kind":"Name","value":"productPricing"}},{"kind":"Field","name":{"kind":"Name","value":"productPrice"}},{"kind":"Field","name":{"kind":"Name","value":"productImages"}},{"kind":"Field","name":{"kind":"Name","value":"productLikes"}},{"kind":"Field","name":{"kind":"Name","value":"productViews"}},{"kind":"Field","name":{"kind":"Name","value":"memberData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"memberNick"}}]}}]}}]} as unknown as DocumentNode<AgentCardFragment, unknown>;
export const CreatorAgentRowFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CreatorAgentRow"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"productTitle"}},{"kind":"Field","name":{"kind":"Name","value":"productCategory"}},{"kind":"Field","name":{"kind":"Name","value":"productStatus"}},{"kind":"Field","name":{"kind":"Name","value":"productPricing"}},{"kind":"Field","name":{"kind":"Name","value":"productPrice"}},{"kind":"Field","name":{"kind":"Name","value":"productImages"}},{"kind":"Field","name":{"kind":"Name","value":"productViews"}},{"kind":"Field","name":{"kind":"Name","value":"productLikes"}},{"kind":"Field","name":{"kind":"Name","value":"productComments"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<CreatorAgentRowFragment, unknown>;
export const BriefCardFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"BriefCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Brief"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"briefTitle"}},{"kind":"Field","name":{"kind":"Name","value":"briefContent"}},{"kind":"Field","name":{"kind":"Name","value":"briefCategory"}},{"kind":"Field","name":{"kind":"Name","value":"briefStatus"}},{"kind":"Field","name":{"kind":"Name","value":"briefBudget"}},{"kind":"Field","name":{"kind":"Name","value":"briefDeadline"}},{"kind":"Field","name":{"kind":"Name","value":"briefViews"}},{"kind":"Field","name":{"kind":"Name","value":"briefComments"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"closedAt"}},{"kind":"Field","name":{"kind":"Name","value":"memberData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"memberNick"}}]}}]}}]} as unknown as DocumentNode<BriefCardFragment, unknown>;
export const MyBriefRowFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MyBriefRow"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Brief"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"briefTitle"}},{"kind":"Field","name":{"kind":"Name","value":"briefCategory"}},{"kind":"Field","name":{"kind":"Name","value":"briefStatus"}},{"kind":"Field","name":{"kind":"Name","value":"briefBudget"}},{"kind":"Field","name":{"kind":"Name","value":"briefDeadline"}},{"kind":"Field","name":{"kind":"Name","value":"briefViews"}},{"kind":"Field","name":{"kind":"Name","value":"briefComments"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"closedAt"}}]}}]} as unknown as DocumentNode<MyBriefRowFragment, unknown>;
export const CommentItemFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CommentItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Comment"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"commentContent"}},{"kind":"Field","name":{"kind":"Name","value":"commentGroup"}},{"kind":"Field","name":{"kind":"Name","value":"commentRefId"}},{"kind":"Field","name":{"kind":"Name","value":"memberId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"memberData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"memberNick"}},{"kind":"Field","name":{"kind":"Name","value":"memberFullName"}},{"kind":"Field","name":{"kind":"Name","value":"memberImage"}}]}}]}}]} as unknown as DocumentNode<CommentItemFragment, unknown>;
export const ArticleCardFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ArticleCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BoardArticle"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"articleCategory"}},{"kind":"Field","name":{"kind":"Name","value":"articleStatus"}},{"kind":"Field","name":{"kind":"Name","value":"articleTitle"}},{"kind":"Field","name":{"kind":"Name","value":"articleContent"}},{"kind":"Field","name":{"kind":"Name","value":"articleImage"}},{"kind":"Field","name":{"kind":"Name","value":"articleLikes"}},{"kind":"Field","name":{"kind":"Name","value":"articleViews"}},{"kind":"Field","name":{"kind":"Name","value":"articleComments"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"memberData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"memberNick"}},{"kind":"Field","name":{"kind":"Name","value":"memberFullName"}},{"kind":"Field","name":{"kind":"Name","value":"memberImage"}}]}}]}}]} as unknown as DocumentNode<ArticleCardFragment, unknown>;
export const CreatorCardFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CreatorCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Member"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"memberNick"}},{"kind":"Field","name":{"kind":"Name","value":"memberFullName"}},{"kind":"Field","name":{"kind":"Name","value":"memberImage"}},{"kind":"Field","name":{"kind":"Name","value":"memberDesc"}},{"kind":"Field","name":{"kind":"Name","value":"memberRank"}},{"kind":"Field","name":{"kind":"Name","value":"memberProducts"}},{"kind":"Field","name":{"kind":"Name","value":"memberFollowers"}},{"kind":"Field","name":{"kind":"Name","value":"memberLikes"}}]}}]} as unknown as DocumentNode<CreatorCardFragment, unknown>;
export const FollowMemberFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FollowMember"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Member"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"memberType"}},{"kind":"Field","name":{"kind":"Name","value":"memberNick"}},{"kind":"Field","name":{"kind":"Name","value":"memberFullName"}},{"kind":"Field","name":{"kind":"Name","value":"memberImage"}},{"kind":"Field","name":{"kind":"Name","value":"memberFollowers"}}]}}]} as unknown as DocumentNode<FollowMemberFragment, unknown>;
export const MeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getMe"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"memberType"}},{"kind":"Field","name":{"kind":"Name","value":"memberStatus"}},{"kind":"Field","name":{"kind":"Name","value":"memberNick"}},{"kind":"Field","name":{"kind":"Name","value":"memberFullName"}},{"kind":"Field","name":{"kind":"Name","value":"memberImage"}},{"kind":"Field","name":{"kind":"Name","value":"memberPhone"}},{"kind":"Field","name":{"kind":"Name","value":"memberEmail"}},{"kind":"Field","name":{"kind":"Name","value":"memberWhatsapp"}}]}}]}}]} as unknown as DocumentNode<MeQuery, MeQueryVariables>;
export const AccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Account"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getMe"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"memberType"}},{"kind":"Field","name":{"kind":"Name","value":"memberNick"}},{"kind":"Field","name":{"kind":"Name","value":"memberFullName"}},{"kind":"Field","name":{"kind":"Name","value":"memberImage"}},{"kind":"Field","name":{"kind":"Name","value":"memberPhone"}},{"kind":"Field","name":{"kind":"Name","value":"memberEmail"}},{"kind":"Field","name":{"kind":"Name","value":"memberWhatsapp"}},{"kind":"Field","name":{"kind":"Name","value":"memberDesc"}}]}}]}}]} as unknown as DocumentNode<AccountQuery, AccountQueryVariables>;
export const UpdateAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateAccount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MemberUpdate"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMember"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"memberNick"}},{"kind":"Field","name":{"kind":"Name","value":"memberFullName"}},{"kind":"Field","name":{"kind":"Name","value":"memberImage"}},{"kind":"Field","name":{"kind":"Name","value":"memberPhone"}},{"kind":"Field","name":{"kind":"Name","value":"memberEmail"}},{"kind":"Field","name":{"kind":"Name","value":"memberWhatsapp"}},{"kind":"Field","name":{"kind":"Name","value":"memberDesc"}}]}}]}}]} as unknown as DocumentNode<UpdateAccountMutation, UpdateAccountMutationVariables>;
export const ChangePasswordDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ChangePassword"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ChangePasswordInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"changePassword"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<ChangePasswordMutation, ChangePasswordMutationVariables>;
export const UploadAvatarDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UploadAvatar"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"file"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Upload"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"imageUploader"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"file"},"value":{"kind":"Variable","name":{"kind":"Name","value":"file"}}},{"kind":"Argument","name":{"kind":"Name","value":"target"},"value":{"kind":"StringValue","value":"member","block":false}}]}]}}]} as unknown as DocumentNode<UploadAvatarMutation, UploadAvatarMutationVariables>;
export const AdminMembersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminMembers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MembersInquiry"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getAllMembersByAdmin"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"list"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"memberType"}},{"kind":"Field","name":{"kind":"Name","value":"memberStatus"}},{"kind":"Field","name":{"kind":"Name","value":"memberNick"}},{"kind":"Field","name":{"kind":"Name","value":"memberFullName"}},{"kind":"Field","name":{"kind":"Name","value":"memberImage"}},{"kind":"Field","name":{"kind":"Name","value":"memberPhone"}},{"kind":"Field","name":{"kind":"Name","value":"memberEmail"}},{"kind":"Field","name":{"kind":"Name","value":"memberProducts"}},{"kind":"Field","name":{"kind":"Name","value":"memberBriefs"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"metaCounter"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}}]}}]} as unknown as DocumentNode<AdminMembersQuery, AdminMembersQueryVariables>;
export const AdminUpdateMemberDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminUpdateMember"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MemberUpdateByAdmin"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMemberByAdmin"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"memberStatus"}}]}}]}}]} as unknown as DocumentNode<AdminUpdateMemberMutation, AdminUpdateMemberMutationVariables>;
export const AdminProductsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminProducts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AllProductsInquiry"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getAllProductsByAdmin"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"list"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"productTitle"}},{"kind":"Field","name":{"kind":"Name","value":"productStatus"}},{"kind":"Field","name":{"kind":"Name","value":"productCategory"}},{"kind":"Field","name":{"kind":"Name","value":"productPricing"}},{"kind":"Field","name":{"kind":"Name","value":"productPrice"}},{"kind":"Field","name":{"kind":"Name","value":"productLikes"}},{"kind":"Field","name":{"kind":"Name","value":"productViews"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"memberData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"memberNick"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"metaCounter"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}}]}}]} as unknown as DocumentNode<AdminProductsQuery, AdminProductsQueryVariables>;
export const AdminUpdateProductDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminUpdateProduct"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ProductUpdate"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProductByAdmin"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"productStatus"}}]}}]}}]} as unknown as DocumentNode<AdminUpdateProductMutation, AdminUpdateProductMutationVariables>;
export const AdminRemoveProductDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminRemoveProduct"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"productId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeProductByAdmin"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"productId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"productId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}}]}}]}}]} as unknown as DocumentNode<AdminRemoveProductMutation, AdminRemoveProductMutationVariables>;
export const AdminBriefsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminBriefs"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AllBriefsInquiry"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getAllBriefsByAdmin"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"list"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"briefTitle"}},{"kind":"Field","name":{"kind":"Name","value":"briefStatus"}},{"kind":"Field","name":{"kind":"Name","value":"briefCategory"}},{"kind":"Field","name":{"kind":"Name","value":"briefBudget"}},{"kind":"Field","name":{"kind":"Name","value":"briefDeadline"}},{"kind":"Field","name":{"kind":"Name","value":"briefViews"}},{"kind":"Field","name":{"kind":"Name","value":"briefComments"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"memberData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"memberNick"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"metaCounter"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}}]}}]} as unknown as DocumentNode<AdminBriefsQuery, AdminBriefsQueryVariables>;
export const AdminUpdateBriefDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminUpdateBrief"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"BriefUpdate"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateBriefByAdmin"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"briefStatus"}},{"kind":"Field","name":{"kind":"Name","value":"briefDeadline"}}]}}]}}]} as unknown as DocumentNode<AdminUpdateBriefMutation, AdminUpdateBriefMutationVariables>;
export const AdminRemoveBriefDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminRemoveBrief"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"briefId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeBriefByAdmin"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"briefId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"briefId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}}]}}]}}]} as unknown as DocumentNode<AdminRemoveBriefMutation, AdminRemoveBriefMutationVariables>;
export const AdminArticlesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminArticles"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AllBoardArticlesInquiry"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getAllBoardArticlesByAdmin"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"list"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"articleTitle"}},{"kind":"Field","name":{"kind":"Name","value":"articleStatus"}},{"kind":"Field","name":{"kind":"Name","value":"articleCategory"}},{"kind":"Field","name":{"kind":"Name","value":"articleLikes"}},{"kind":"Field","name":{"kind":"Name","value":"articleComments"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"memberData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"memberNick"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"metaCounter"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}}]}}]} as unknown as DocumentNode<AdminArticlesQuery, AdminArticlesQueryVariables>;
export const AdminUpdateArticleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminUpdateArticle"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"BoardArticleUpdate"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateBoardArticleByAdmin"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"articleStatus"}}]}}]}}]} as unknown as DocumentNode<AdminUpdateArticleMutation, AdminUpdateArticleMutationVariables>;
export const AdminRemoveArticleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminRemoveArticle"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"articleId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeBoardArticleByAdmin"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"articleId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"articleId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}}]}}]}}]} as unknown as DocumentNode<AdminRemoveArticleMutation, AdminRemoveArticleMutationVariables>;
export const AgentDetailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AgentDetail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"productId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getProduct"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"productId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"productId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"productTitle"}},{"kind":"Field","name":{"kind":"Name","value":"productDesc"}},{"kind":"Field","name":{"kind":"Name","value":"productStatus"}},{"kind":"Field","name":{"kind":"Name","value":"productCategory"}},{"kind":"Field","name":{"kind":"Name","value":"productPricing"}},{"kind":"Field","name":{"kind":"Name","value":"productPrice"}},{"kind":"Field","name":{"kind":"Name","value":"productDemoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"productTags"}},{"kind":"Field","name":{"kind":"Name","value":"productImages"}},{"kind":"Field","name":{"kind":"Name","value":"productLikes"}},{"kind":"Field","name":{"kind":"Name","value":"productViews"}},{"kind":"Field","name":{"kind":"Name","value":"productComments"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"memberData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"memberNick"}},{"kind":"Field","name":{"kind":"Name","value":"memberFullName"}},{"kind":"Field","name":{"kind":"Name","value":"memberImage"}},{"kind":"Field","name":{"kind":"Name","value":"memberProducts"}},{"kind":"Field","name":{"kind":"Name","value":"memberFollowers"}}]}}]}}]}}]} as unknown as DocumentNode<AgentDetailQuery, AgentDetailQueryVariables>;
export const AgentViewerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AgentViewer"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"productId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getProduct"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"productId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"productId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"productViews"}},{"kind":"Field","name":{"kind":"Name","value":"meLiked"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"memberId"}},{"kind":"Field","name":{"kind":"Name","value":"likeRefId"}},{"kind":"Field","name":{"kind":"Name","value":"myFavorite"}}]}},{"kind":"Field","name":{"kind":"Name","value":"memberData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"memberEmail"}},{"kind":"Field","name":{"kind":"Name","value":"memberWhatsapp"}}]}}]}}]}}]} as unknown as DocumentNode<AgentViewerQuery, AgentViewerQueryVariables>;
export const LikeAgentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"LikeAgent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"productId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"likeTargetProduct"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"productId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"productId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"productLikes"}}]}}]}}]} as unknown as DocumentNode<LikeAgentMutation, LikeAgentMutationVariables>;
export const OwnerAgentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OwnerAgent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"productId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getProduct"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"productId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"productId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"memberId"}},{"kind":"Field","name":{"kind":"Name","value":"productStatus"}},{"kind":"Field","name":{"kind":"Name","value":"productTitle"}},{"kind":"Field","name":{"kind":"Name","value":"productCategory"}},{"kind":"Field","name":{"kind":"Name","value":"productPricing"}},{"kind":"Field","name":{"kind":"Name","value":"productPrice"}},{"kind":"Field","name":{"kind":"Name","value":"productDemoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"productTags"}},{"kind":"Field","name":{"kind":"Name","value":"productImages"}},{"kind":"Field","name":{"kind":"Name","value":"productDesc"}},{"kind":"Field","name":{"kind":"Name","value":"productLikes"}},{"kind":"Field","name":{"kind":"Name","value":"productViews"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<OwnerAgentQuery, OwnerAgentQueryVariables>;
export const CreateAgentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateAgent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ProductInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createProduct"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"productTitle"}},{"kind":"Field","name":{"kind":"Name","value":"productStatus"}}]}}]}}]} as unknown as DocumentNode<CreateAgentMutation, CreateAgentMutationVariables>;
export const UpdateAgentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateAgent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ProductUpdate"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProduct"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"productStatus"}},{"kind":"Field","name":{"kind":"Name","value":"productTitle"}},{"kind":"Field","name":{"kind":"Name","value":"productCategory"}},{"kind":"Field","name":{"kind":"Name","value":"productPricing"}},{"kind":"Field","name":{"kind":"Name","value":"productPrice"}},{"kind":"Field","name":{"kind":"Name","value":"productDemoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"productTags"}},{"kind":"Field","name":{"kind":"Name","value":"productImages"}},{"kind":"Field","name":{"kind":"Name","value":"productDesc"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpdateAgentMutation, UpdateAgentMutationVariables>;
export const UploadAgentImageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UploadAgentImage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"file"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Upload"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"imageUploader"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"file"},"value":{"kind":"Variable","name":{"kind":"Name","value":"file"}}},{"kind":"Argument","name":{"kind":"Name","value":"target"},"value":{"kind":"StringValue","value":"product","block":false}}]}]}}]} as unknown as DocumentNode<UploadAgentImageMutation, UploadAgentImageMutationVariables>;
export const AgentsListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AgentsList"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ProductsInquiry"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getProducts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"list"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AgentCard"}}]}},{"kind":"Field","name":{"kind":"Name","value":"metaCounter"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AgentCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"productTitle"}},{"kind":"Field","name":{"kind":"Name","value":"productCategory"}},{"kind":"Field","name":{"kind":"Name","value":"productPricing"}},{"kind":"Field","name":{"kind":"Name","value":"productPrice"}},{"kind":"Field","name":{"kind":"Name","value":"productImages"}},{"kind":"Field","name":{"kind":"Name","value":"productLikes"}},{"kind":"Field","name":{"kind":"Name","value":"productViews"}},{"kind":"Field","name":{"kind":"Name","value":"memberData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"memberNick"}}]}}]}}]} as unknown as DocumentNode<AgentsListQuery, AgentsListQueryVariables>;
export const CreatorAgentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CreatorAgents"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreatorProductsInquiry"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"list"},"name":{"kind":"Name","value":"getCreatorProducts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"list"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CreatorAgentRow"}}]}},{"kind":"Field","name":{"kind":"Name","value":"metaCounter"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"active"},"name":{"kind":"Name","value":"getCreatorProducts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"page"},"value":{"kind":"IntValue","value":"1"}},{"kind":"ObjectField","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"1"}},{"kind":"ObjectField","name":{"kind":"Name","value":"search"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"productStatus"},"value":{"kind":"EnumValue","value":"ACTIVE"}}]}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"metaCounter"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"paused"},"name":{"kind":"Name","value":"getCreatorProducts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"page"},"value":{"kind":"IntValue","value":"1"}},{"kind":"ObjectField","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"1"}},{"kind":"ObjectField","name":{"kind":"Name","value":"search"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"productStatus"},"value":{"kind":"EnumValue","value":"PAUSED"}}]}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"metaCounter"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CreatorAgentRow"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"productTitle"}},{"kind":"Field","name":{"kind":"Name","value":"productCategory"}},{"kind":"Field","name":{"kind":"Name","value":"productStatus"}},{"kind":"Field","name":{"kind":"Name","value":"productPricing"}},{"kind":"Field","name":{"kind":"Name","value":"productPrice"}},{"kind":"Field","name":{"kind":"Name","value":"productImages"}},{"kind":"Field","name":{"kind":"Name","value":"productViews"}},{"kind":"Field","name":{"kind":"Name","value":"productLikes"}},{"kind":"Field","name":{"kind":"Name","value":"productComments"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<CreatorAgentsQuery, CreatorAgentsQueryVariables>;
export const UpdateAgentStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateAgentStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ProductUpdate"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProduct"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"productStatus"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpdateAgentStatusMutation, UpdateAgentStatusMutationVariables>;
export const FavoriteAgentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FavoriteAgents"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"OrdinaryInquiry"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getFavorities"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"list"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AgentCard"}}]}},{"kind":"Field","name":{"kind":"Name","value":"metaCounter"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AgentCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"productTitle"}},{"kind":"Field","name":{"kind":"Name","value":"productCategory"}},{"kind":"Field","name":{"kind":"Name","value":"productPricing"}},{"kind":"Field","name":{"kind":"Name","value":"productPrice"}},{"kind":"Field","name":{"kind":"Name","value":"productImages"}},{"kind":"Field","name":{"kind":"Name","value":"productLikes"}},{"kind":"Field","name":{"kind":"Name","value":"productViews"}},{"kind":"Field","name":{"kind":"Name","value":"memberData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"memberNick"}}]}}]}}]} as unknown as DocumentNode<FavoriteAgentsQuery, FavoriteAgentsQueryVariables>;
export const VisitedAgentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"VisitedAgents"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"OrdinaryInquiry"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getVisited"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"list"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AgentCard"}}]}},{"kind":"Field","name":{"kind":"Name","value":"metaCounter"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AgentCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"productTitle"}},{"kind":"Field","name":{"kind":"Name","value":"productCategory"}},{"kind":"Field","name":{"kind":"Name","value":"productPricing"}},{"kind":"Field","name":{"kind":"Name","value":"productPrice"}},{"kind":"Field","name":{"kind":"Name","value":"productImages"}},{"kind":"Field","name":{"kind":"Name","value":"productLikes"}},{"kind":"Field","name":{"kind":"Name","value":"productViews"}},{"kind":"Field","name":{"kind":"Name","value":"memberData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"memberNick"}}]}}]}}]} as unknown as DocumentNode<VisitedAgentsQuery, VisitedAgentsQueryVariables>;
export const LoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Login"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LoginInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"memberType"}},{"kind":"Field","name":{"kind":"Name","value":"accessToken"}}]}}]}}]} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;
export const SignupDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Signup"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MemberInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"signup"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"memberType"}},{"kind":"Field","name":{"kind":"Name","value":"accessToken"}}]}}]}}]} as unknown as DocumentNode<SignupMutation, SignupMutationVariables>;
export const BriefsListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"BriefsList"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"BriefsInquiry"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getBriefs"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"list"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"BriefCard"}}]}},{"kind":"Field","name":{"kind":"Name","value":"metaCounter"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"BriefCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Brief"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"briefTitle"}},{"kind":"Field","name":{"kind":"Name","value":"briefContent"}},{"kind":"Field","name":{"kind":"Name","value":"briefCategory"}},{"kind":"Field","name":{"kind":"Name","value":"briefStatus"}},{"kind":"Field","name":{"kind":"Name","value":"briefBudget"}},{"kind":"Field","name":{"kind":"Name","value":"briefDeadline"}},{"kind":"Field","name":{"kind":"Name","value":"briefViews"}},{"kind":"Field","name":{"kind":"Name","value":"briefComments"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"closedAt"}},{"kind":"Field","name":{"kind":"Name","value":"memberData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"memberNick"}}]}}]}}]} as unknown as DocumentNode<BriefsListQuery, BriefsListQueryVariables>;
export const BriefDetailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"BriefDetail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"briefId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getBrief"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"briefId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"briefId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"briefTitle"}},{"kind":"Field","name":{"kind":"Name","value":"briefContent"}},{"kind":"Field","name":{"kind":"Name","value":"briefCategory"}},{"kind":"Field","name":{"kind":"Name","value":"briefStatus"}},{"kind":"Field","name":{"kind":"Name","value":"briefBudget"}},{"kind":"Field","name":{"kind":"Name","value":"briefDeadline"}},{"kind":"Field","name":{"kind":"Name","value":"briefViews"}},{"kind":"Field","name":{"kind":"Name","value":"briefComments"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"closedAt"}},{"kind":"Field","name":{"kind":"Name","value":"memberData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"memberNick"}},{"kind":"Field","name":{"kind":"Name","value":"memberFullName"}},{"kind":"Field","name":{"kind":"Name","value":"memberImage"}},{"kind":"Field","name":{"kind":"Name","value":"memberBriefs"}}]}}]}}]}}]} as unknown as DocumentNode<BriefDetailQuery, BriefDetailQueryVariables>;
export const BriefViewerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"BriefViewer"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"briefId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getBrief"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"briefId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"briefId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"briefViews"}},{"kind":"Field","name":{"kind":"Name","value":"memberData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"memberEmail"}},{"kind":"Field","name":{"kind":"Name","value":"memberWhatsapp"}}]}}]}}]}}]} as unknown as DocumentNode<BriefViewerQuery, BriefViewerQueryVariables>;
export const MyBriefsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyBriefs"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MyBriefsInquiry"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"list"},"name":{"kind":"Name","value":"getMyBriefs"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"list"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MyBriefRow"}}]}},{"kind":"Field","name":{"kind":"Name","value":"metaCounter"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"open"},"name":{"kind":"Name","value":"getMyBriefs"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"page"},"value":{"kind":"IntValue","value":"1"}},{"kind":"ObjectField","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"1"}},{"kind":"ObjectField","name":{"kind":"Name","value":"search"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"briefStatus"},"value":{"kind":"EnumValue","value":"OPEN"}}]}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"metaCounter"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"closed"},"name":{"kind":"Name","value":"getMyBriefs"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"page"},"value":{"kind":"IntValue","value":"1"}},{"kind":"ObjectField","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"1"}},{"kind":"ObjectField","name":{"kind":"Name","value":"search"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"briefStatus"},"value":{"kind":"EnumValue","value":"CLOSED"}}]}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"metaCounter"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MyBriefRow"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Brief"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"briefTitle"}},{"kind":"Field","name":{"kind":"Name","value":"briefCategory"}},{"kind":"Field","name":{"kind":"Name","value":"briefStatus"}},{"kind":"Field","name":{"kind":"Name","value":"briefBudget"}},{"kind":"Field","name":{"kind":"Name","value":"briefDeadline"}},{"kind":"Field","name":{"kind":"Name","value":"briefViews"}},{"kind":"Field","name":{"kind":"Name","value":"briefComments"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"closedAt"}}]}}]} as unknown as DocumentNode<MyBriefsQuery, MyBriefsQueryVariables>;
export const UpdateBriefStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateBriefStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"BriefUpdate"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateBrief"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"briefStatus"}},{"kind":"Field","name":{"kind":"Name","value":"briefDeadline"}},{"kind":"Field","name":{"kind":"Name","value":"closedAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpdateBriefStatusMutation, UpdateBriefStatusMutationVariables>;
export const OwnerBriefDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OwnerBrief"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"briefId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getBrief"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"briefId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"briefId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"memberId"}},{"kind":"Field","name":{"kind":"Name","value":"briefStatus"}},{"kind":"Field","name":{"kind":"Name","value":"briefTitle"}},{"kind":"Field","name":{"kind":"Name","value":"briefCategory"}},{"kind":"Field","name":{"kind":"Name","value":"briefContent"}},{"kind":"Field","name":{"kind":"Name","value":"briefBudget"}},{"kind":"Field","name":{"kind":"Name","value":"briefDeadline"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<OwnerBriefQuery, OwnerBriefQueryVariables>;
export const CreateBriefDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateBrief"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"BriefInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createBrief"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"briefTitle"}},{"kind":"Field","name":{"kind":"Name","value":"briefStatus"}}]}}]}}]} as unknown as DocumentNode<CreateBriefMutation, CreateBriefMutationVariables>;
export const UpdateBriefDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateBrief"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"BriefUpdate"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateBrief"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"briefStatus"}},{"kind":"Field","name":{"kind":"Name","value":"briefTitle"}},{"kind":"Field","name":{"kind":"Name","value":"briefCategory"}},{"kind":"Field","name":{"kind":"Name","value":"briefContent"}},{"kind":"Field","name":{"kind":"Name","value":"briefBudget"}},{"kind":"Field","name":{"kind":"Name","value":"briefDeadline"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpdateBriefMutation, UpdateBriefMutationVariables>;
export const CommentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Comments"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CommentsInquiry"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getComments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"list"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CommentItem"}}]}},{"kind":"Field","name":{"kind":"Name","value":"metaCounter"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CommentItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Comment"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"commentContent"}},{"kind":"Field","name":{"kind":"Name","value":"commentGroup"}},{"kind":"Field","name":{"kind":"Name","value":"commentRefId"}},{"kind":"Field","name":{"kind":"Name","value":"memberId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"memberData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"memberNick"}},{"kind":"Field","name":{"kind":"Name","value":"memberFullName"}},{"kind":"Field","name":{"kind":"Name","value":"memberImage"}}]}}]}}]} as unknown as DocumentNode<CommentsQuery, CommentsQueryVariables>;
export const CreateCommentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateComment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CommentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createComment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CommentItem"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CommentItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Comment"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"commentContent"}},{"kind":"Field","name":{"kind":"Name","value":"commentGroup"}},{"kind":"Field","name":{"kind":"Name","value":"commentRefId"}},{"kind":"Field","name":{"kind":"Name","value":"memberId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"memberData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"memberNick"}},{"kind":"Field","name":{"kind":"Name","value":"memberFullName"}},{"kind":"Field","name":{"kind":"Name","value":"memberImage"}}]}}]}}]} as unknown as DocumentNode<CreateCommentMutation, CreateCommentMutationVariables>;
export const DeleteCommentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteComment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CommentUpdate"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateComment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"commentStatus"}}]}}]}}]} as unknown as DocumentNode<DeleteCommentMutation, DeleteCommentMutationVariables>;
export const ArticlesListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ArticlesList"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"BoardArticlesInquiry"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getBoardArticles"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"list"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ArticleCard"}}]}},{"kind":"Field","name":{"kind":"Name","value":"metaCounter"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ArticleCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BoardArticle"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"articleCategory"}},{"kind":"Field","name":{"kind":"Name","value":"articleStatus"}},{"kind":"Field","name":{"kind":"Name","value":"articleTitle"}},{"kind":"Field","name":{"kind":"Name","value":"articleContent"}},{"kind":"Field","name":{"kind":"Name","value":"articleImage"}},{"kind":"Field","name":{"kind":"Name","value":"articleLikes"}},{"kind":"Field","name":{"kind":"Name","value":"articleViews"}},{"kind":"Field","name":{"kind":"Name","value":"articleComments"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"memberData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"memberNick"}},{"kind":"Field","name":{"kind":"Name","value":"memberFullName"}},{"kind":"Field","name":{"kind":"Name","value":"memberImage"}}]}}]}}]} as unknown as DocumentNode<ArticlesListQuery, ArticlesListQueryVariables>;
export const ArticleDetailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ArticleDetail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"articleId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getBoardArticle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"articleId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"articleId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ArticleCard"}},{"kind":"Field","name":{"kind":"Name","value":"memberId"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ArticleCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BoardArticle"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"articleCategory"}},{"kind":"Field","name":{"kind":"Name","value":"articleStatus"}},{"kind":"Field","name":{"kind":"Name","value":"articleTitle"}},{"kind":"Field","name":{"kind":"Name","value":"articleContent"}},{"kind":"Field","name":{"kind":"Name","value":"articleImage"}},{"kind":"Field","name":{"kind":"Name","value":"articleLikes"}},{"kind":"Field","name":{"kind":"Name","value":"articleViews"}},{"kind":"Field","name":{"kind":"Name","value":"articleComments"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"memberData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"memberNick"}},{"kind":"Field","name":{"kind":"Name","value":"memberFullName"}},{"kind":"Field","name":{"kind":"Name","value":"memberImage"}}]}}]}}]} as unknown as DocumentNode<ArticleDetailQuery, ArticleDetailQueryVariables>;
export const ArticleViewerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ArticleViewer"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"articleId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getBoardArticle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"articleId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"articleId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"articleViews"}},{"kind":"Field","name":{"kind":"Name","value":"meLiked"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"memberId"}},{"kind":"Field","name":{"kind":"Name","value":"likeRefId"}},{"kind":"Field","name":{"kind":"Name","value":"myFavorite"}}]}}]}}]}}]} as unknown as DocumentNode<ArticleViewerQuery, ArticleViewerQueryVariables>;
export const LikeArticleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"LikeArticle"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"articleId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"likeTargetBoardArticle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"articleId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"articleId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"articleLikes"}}]}}]}}]} as unknown as DocumentNode<LikeArticleMutation, LikeArticleMutationVariables>;
export const OwnerArticleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OwnerArticle"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"articleId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getBoardArticle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"articleId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"articleId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"memberId"}},{"kind":"Field","name":{"kind":"Name","value":"articleStatus"}},{"kind":"Field","name":{"kind":"Name","value":"articleCategory"}},{"kind":"Field","name":{"kind":"Name","value":"articleTitle"}},{"kind":"Field","name":{"kind":"Name","value":"articleContent"}},{"kind":"Field","name":{"kind":"Name","value":"articleImage"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<OwnerArticleQuery, OwnerArticleQueryVariables>;
export const CreateArticleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateArticle"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"BoardArticleInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createBoardArticle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"articleTitle"}}]}}]}}]} as unknown as DocumentNode<CreateArticleMutation, CreateArticleMutationVariables>;
export const UpdateArticleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateArticle"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"BoardArticleUpdate"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateBoardArticle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"articleStatus"}},{"kind":"Field","name":{"kind":"Name","value":"articleCategory"}},{"kind":"Field","name":{"kind":"Name","value":"articleTitle"}},{"kind":"Field","name":{"kind":"Name","value":"articleContent"}},{"kind":"Field","name":{"kind":"Name","value":"articleImage"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpdateArticleMutation, UpdateArticleMutationVariables>;
export const UploadArticleImageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UploadArticleImage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"file"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Upload"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"imageUploader"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"file"},"value":{"kind":"Variable","name":{"kind":"Name","value":"file"}}},{"kind":"Argument","name":{"kind":"Name","value":"target"},"value":{"kind":"StringValue","value":"article","block":false}}]}]}}]} as unknown as DocumentNode<UploadArticleImageMutation, UploadArticleImageMutationVariables>;
export const CreatorsListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CreatorsList"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreatorsInquiry"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getCreators"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"list"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CreatorCard"}}]}},{"kind":"Field","name":{"kind":"Name","value":"metaCounter"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CreatorCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Member"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"memberNick"}},{"kind":"Field","name":{"kind":"Name","value":"memberFullName"}},{"kind":"Field","name":{"kind":"Name","value":"memberImage"}},{"kind":"Field","name":{"kind":"Name","value":"memberDesc"}},{"kind":"Field","name":{"kind":"Name","value":"memberRank"}},{"kind":"Field","name":{"kind":"Name","value":"memberProducts"}},{"kind":"Field","name":{"kind":"Name","value":"memberFollowers"}},{"kind":"Field","name":{"kind":"Name","value":"memberLikes"}}]}}]} as unknown as DocumentNode<CreatorsListQuery, CreatorsListQueryVariables>;
export const MemberProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MemberProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"memberId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getMember"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"memberId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"memberId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"memberType"}},{"kind":"Field","name":{"kind":"Name","value":"memberStatus"}},{"kind":"Field","name":{"kind":"Name","value":"memberNick"}},{"kind":"Field","name":{"kind":"Name","value":"memberFullName"}},{"kind":"Field","name":{"kind":"Name","value":"memberImage"}},{"kind":"Field","name":{"kind":"Name","value":"memberDesc"}},{"kind":"Field","name":{"kind":"Name","value":"memberRank"}},{"kind":"Field","name":{"kind":"Name","value":"memberProducts"}},{"kind":"Field","name":{"kind":"Name","value":"memberBriefs"}},{"kind":"Field","name":{"kind":"Name","value":"memberArticles"}},{"kind":"Field","name":{"kind":"Name","value":"memberFollowers"}},{"kind":"Field","name":{"kind":"Name","value":"memberFollowings"}},{"kind":"Field","name":{"kind":"Name","value":"memberLikes"}},{"kind":"Field","name":{"kind":"Name","value":"memberViews"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<MemberProfileQuery, MemberProfileQueryVariables>;
export const MemberViewerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MemberViewer"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"memberId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getMember"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"memberId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"memberId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"memberViews"}},{"kind":"Field","name":{"kind":"Name","value":"memberEmail"}},{"kind":"Field","name":{"kind":"Name","value":"memberWhatsapp"}},{"kind":"Field","name":{"kind":"Name","value":"meFollowed"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"followingId"}},{"kind":"Field","name":{"kind":"Name","value":"followerId"}},{"kind":"Field","name":{"kind":"Name","value":"myFollowing"}}]}}]}}]}}]} as unknown as DocumentNode<MemberViewerQuery, MemberViewerQueryVariables>;
export const CreatorStatsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CreatorStats"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getMe"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"memberProducts"}},{"kind":"Field","name":{"kind":"Name","value":"memberViews"}},{"kind":"Field","name":{"kind":"Name","value":"memberLikes"}},{"kind":"Field","name":{"kind":"Name","value":"memberFollowers"}}]}}]}}]} as unknown as DocumentNode<CreatorStatsQuery, CreatorStatsQueryVariables>;
export const SubscribeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Subscribe"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"memberId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subscribe"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"memberId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"followingId"}},{"kind":"Field","name":{"kind":"Name","value":"followerId"}}]}}]}}]} as unknown as DocumentNode<SubscribeMutation, SubscribeMutationVariables>;
export const UnsubscribeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Unsubscribe"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"memberId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unsubscribe"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"memberId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"followingId"}},{"kind":"Field","name":{"kind":"Name","value":"followerId"}}]}}]}}]} as unknown as DocumentNode<UnsubscribeMutation, UnsubscribeMutationVariables>;
export const MyFollowingIdsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyFollowingIds"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"FollowInquiry"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getMemberFollowings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"list"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"followingId"}}]}},{"kind":"Field","name":{"kind":"Name","value":"metaCounter"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}}]}}]} as unknown as DocumentNode<MyFollowingIdsQuery, MyFollowingIdsQueryVariables>;
export const FollowersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Followers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"FollowInquiry"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getMemberFollowers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"list"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"followerId"}},{"kind":"Field","name":{"kind":"Name","value":"followerData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FollowMember"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"metaCounter"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FollowMember"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Member"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"memberType"}},{"kind":"Field","name":{"kind":"Name","value":"memberNick"}},{"kind":"Field","name":{"kind":"Name","value":"memberFullName"}},{"kind":"Field","name":{"kind":"Name","value":"memberImage"}},{"kind":"Field","name":{"kind":"Name","value":"memberFollowers"}}]}}]} as unknown as DocumentNode<FollowersQuery, FollowersQueryVariables>;
export const FollowingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Followings"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"FollowInquiry"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getMemberFollowings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"list"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"followingId"}},{"kind":"Field","name":{"kind":"Name","value":"followingData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FollowMember"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"metaCounter"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FollowMember"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Member"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"memberType"}},{"kind":"Field","name":{"kind":"Name","value":"memberNick"}},{"kind":"Field","name":{"kind":"Name","value":"memberFullName"}},{"kind":"Field","name":{"kind":"Name","value":"memberImage"}},{"kind":"Field","name":{"kind":"Name","value":"memberFollowers"}}]}}]} as unknown as DocumentNode<FollowingsQuery, FollowingsQueryVariables>;
export const DevApiProductsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DevApiProducts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ProductsInquiry"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getProducts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"list"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"productTitle"}},{"kind":"Field","name":{"kind":"Name","value":"productCategory"}},{"kind":"Field","name":{"kind":"Name","value":"productPricing"}},{"kind":"Field","name":{"kind":"Name","value":"productPrice"}},{"kind":"Field","name":{"kind":"Name","value":"productLikes"}},{"kind":"Field","name":{"kind":"Name","value":"productViews"}}]}},{"kind":"Field","name":{"kind":"Name","value":"metaCounter"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}}]}}]} as unknown as DocumentNode<DevApiProductsQuery, DevApiProductsQueryVariables>;