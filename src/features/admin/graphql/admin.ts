import { graphql } from '@/gql';

// FRONTEND_MIGRATION §3.12. Every operation here needs an ADMIN token.

export const AdminMembersQuery = graphql(`
	query AdminMembers($input: MembersInquiry!) {
		getAllMembersByAdmin(input: $input) {
			list {
				_id
				memberType
				memberStatus
				memberNick
				memberFullName
				memberImage
				memberPhone
				memberEmail
				memberProducts
				memberBriefs
				createdAt
			}
			metaCounter {
				total
			}
		}
	}
`);

/** Status only from this screen (memberType and password can't be changed, D-14 / D-24). */
export const AdminUpdateMemberMutation = graphql(`
	mutation AdminUpdateMember($input: MemberUpdateByAdmin!) {
		updateMemberByAdmin(input: $input) {
			_id
			memberStatus
		}
	}
`);

export const AdminProductsQuery = graphql(`
	query AdminProducts($input: AllProductsInquiry!) {
		getAllProductsByAdmin(input: $input) {
			list {
				_id
				productTitle
				productStatus
				productCategory
				productPricing
				productPrice
				productLikes
				productViews
				updatedAt
				memberData {
					_id
					memberNick
				}
			}
			metaCounter {
				total
			}
		}
	}
`);

export const AdminUpdateProductMutation = graphql(`
	mutation AdminUpdateProduct($input: ProductUpdate!) {
		updateProductByAdmin(input: $input) {
			_id
			productStatus
		}
	}
`);

/** Only items already in DELETE (D-28). */
export const AdminRemoveProductMutation = graphql(`
	mutation AdminRemoveProduct($productId: String!) {
		removeProductByAdmin(productId: $productId) {
			_id
		}
	}
`);

export const AdminBriefsQuery = graphql(`
	query AdminBriefs($input: AllBriefsInquiry!) {
		getAllBriefsByAdmin(input: $input) {
			list {
				_id
				briefTitle
				briefStatus
				briefCategory
				briefBudget
				briefDeadline
				briefViews
				briefComments
				createdAt
				memberData {
					_id
					memberNick
				}
			}
			metaCounter {
				total
			}
		}
	}
`);

export const AdminUpdateBriefMutation = graphql(`
	mutation AdminUpdateBrief($input: BriefUpdate!) {
		updateBriefByAdmin(input: $input) {
			_id
			briefStatus
			briefDeadline
		}
	}
`);

export const AdminRemoveBriefMutation = graphql(`
	mutation AdminRemoveBrief($briefId: String!) {
		removeBriefByAdmin(briefId: $briefId) {
			_id
		}
	}
`);

export const AdminArticlesQuery = graphql(`
	query AdminArticles($input: AllBoardArticlesInquiry!) {
		getAllBoardArticlesByAdmin(input: $input) {
			list {
				_id
				articleTitle
				articleStatus
				articleCategory
				articleLikes
				articleComments
				createdAt
				memberData {
					_id
					memberNick
				}
			}
			metaCounter {
				total
			}
		}
	}
`);

export const AdminUpdateArticleMutation = graphql(`
	mutation AdminUpdateArticle($input: BoardArticleUpdate!) {
		updateBoardArticleByAdmin(input: $input) {
			_id
			articleStatus
		}
	}
`);

export const AdminRemoveArticleMutation = graphql(`
	mutation AdminRemoveArticle($articleId: String!) {
		removeBoardArticleByAdmin(articleId: $articleId) {
			_id
		}
	}
`);
