import { graphql } from '@/gql';

/**
 * The agent to edit, asked for with the token: the API also returns the owner's PAUSED agent (D-16).
 * It returns other creators' ACTIVE agents too, so the page compares memberId with the signed-in member.
 */
export const OwnerAgentQuery = graphql(`
	query OwnerAgent($productId: String!) {
		getProduct(productId: $productId) {
			_id
			memberId
			productStatus
			productTitle
			productCategory
			productPricing
			productPrice
			productDemoUrl
			productTags
			productImages
			productDesc
			productLikes
			productViews
			updatedAt
		}
	}
`);

export const CreateAgentMutation = graphql(`
	mutation CreateAgent($input: ProductInput!) {
		createProduct(input: $input) {
			_id
			productTitle
			productStatus
		}
	}
`);

/** Returns the stored values (tags come back trimmed, lowercased, de-duplicated by the API). */
export const UpdateAgentMutation = graphql(`
	mutation UpdateAgent($input: ProductUpdate!) {
		updateProduct(input: $input) {
			_id
			productStatus
			productTitle
			productCategory
			productPricing
			productPrice
			productDemoUrl
			productTags
			productImages
			productDesc
			updatedAt
		}
	}
`);

/**
 * One file per request (not imagesUploader): each image gets its own progress, its own error and
 * retry, and can be cancelled — imagesUploader is all-or-nothing for the whole batch.
 * Returns the stored path, e.g. "uploads/product/<uuid>.png".
 */
export const UploadAgentImageMutation = graphql(`
	mutation UploadAgentImage($file: Upload!) {
		imageUploader(file: $file, target: "product")
	}
`);
