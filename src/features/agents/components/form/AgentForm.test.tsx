import { ApolloError } from '@apollo/client';
import type { MockedResponse } from '@apollo/client/testing';
import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Me } from '@/auth';
import { renderWithProviders } from '@/test/renderWithProviders';
import { CreateAgentMutation, UploadAgentImageMutation } from '../../graphql/agentForm';
import { IMAGE_MAX_BYTES } from '../../lib/imageFiles';
import { NewAgent } from './AgentFormPages';

const creator = { _id: '6ac7992dd87bde19b9216c99', memberType: 'CREATOR', memberStatus: 'ACTIVE', memberNick: 'nova_labs' } as Me;

const png = (name: string) => new File(['png'], name, { type: 'image/png' });

const uploadMock = (file: File, path: string, extra: Partial<MockedResponse> = {}): MockedResponse => ({
	request: { query: UploadAgentImageMutation, variables: { file } },
	result: { data: { imageUploader: path } },
	...extra,
});

const DESC = 'Answers customer questions in Telegram and hands hard cases to your team.';

const setup = (mocks: MockedResponse[]) => {
	const user = userEvent.setup({ applyAccept: false });
	renderWithProviders(<NewAgent />, { auth: { status: 'member', me: creator }, mocks });
	return user;
};

const fillBasics = async (user: ReturnType<typeof userEvent.setup>) => {
	await user.type(screen.getByRole('textbox', { name: /^Title/ }), 'SupportPilot');
	await user.selectOptions(screen.getByRole('combobox', { name: /^Category/ }), 'Customer support');
	await user.click(screen.getByRole('radio', { name: /Subscription/ }));
	await user.type(screen.getByRole('spinbutton', { name: /Price per month/ }), '49');
	// Pasted: typing 70+ characters one by one only slows the test down.
	await user.click(screen.getByRole('textbox', { name: /^Description/ }));
	await user.paste(DESC);
};

const addFiles = (user: ReturnType<typeof userEvent.setup>, ...files: File[]) => user.upload(screen.getByTestId('image-input'), files);

describe('AgentForm (create)', () => {
	beforeEach(() => {
		mockRouter.setCurrentUrl('/dashboard/agents/new');
		vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: vi.fn(() => 'blob:preview'), revokeObjectURL: vi.fn() }));
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('publishes with exactly the API input and goes back to My agents', async () => {
		const cover = png('cover.png');
		const user = setup([
			uploadMock(cover, 'uploads/product/cover.png'),
			{
				request: {
					query: CreateAgentMutation,
					variables: {
						input: {
							productTitle: 'SupportPilot',
							productCategory: 'CUSTOMER_SUPPORT',
							productPricing: 'SUBSCRIPTION',
							productPrice: 49,
							productImages: ['uploads/product/cover.png'],
							productDesc: DESC,
						},
					},
				},
				result: { data: { createProduct: { __typename: 'Product', _id: '6ac7992dd87bde19b9216d01', productTitle: 'SupportPilot', productStatus: 'ACTIVE' } } },
			},
		]);

		await fillBasics(user);
		await addFiles(user, cover);
		await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());
		await user.click(screen.getByRole('button', { name: 'Publish agent' }));

		await waitFor(() => expect(mockRouter.asPath).toBe('/dashboard/agents/6ac7992dd87bde19b9216d01'));
		expect(screen.getByText('“SupportPilot” is published.')).toBeInTheDocument();
	});

	it('shows every field error on submit and sends nothing', async () => {
		const user = setup([]);
		await user.click(screen.getByRole('button', { name: 'Publish agent' }));

		expect(await screen.findByText('Enter a title.')).toBeInTheDocument();
		expect(screen.getByText('Choose a category.')).toBeInTheDocument();
		expect(screen.getByText('Choose how the agent is priced.')).toBeInTheDocument();
		expect(screen.getByText('Add at least one image.')).toBeInTheDocument();
		expect(screen.getByText('Enter a description.')).toBeInTheDocument();
		expect(screen.getByRole('textbox', { name: /^Title/ })).toHaveFocus();
	});

	it('D-03: asks for a price only for one-time and subscription', async () => {
		const user = setup([]);
		expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();

		await user.click(screen.getByRole('radio', { name: /Free/ }));
		expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();

		await user.click(screen.getByRole('radio', { name: /One-time/ }));
		expect(screen.getByRole('spinbutton', { name: /^Price \(USD\)/ })).toBeInTheDocument();

		await user.click(screen.getByRole('radio', { name: /Subscription/ }));
		const price = screen.getByRole('spinbutton', { name: /Price per month \(USD\)/ });
		await user.type(price, '0');
		await user.click(screen.getByRole('button', { name: 'Publish agent' }));
		expect(await screen.findByText('The price must be a number greater than 0.')).toBeInTheDocument();
	});

	it('never uploads a refused file and says why', async () => {
		// No upload mock: an upload request would fail the "no error tile" check below.
		const user = setup([]);
		const gif = new File(['gif'], 'anim.gif', { type: 'image/gif' });
		const huge = png('huge.png');
		// one byte over the limit, whatever the limit is (10 MB since D-41)
		Object.defineProperty(huge, 'size', { value: IMAGE_MAX_BYTES + 1 });

		await addFiles(user, gif, huge);

		const alert = screen.getByRole('alert');
		expect(alert).toHaveTextContent('anim.gif: only JPG and PNG images can be uploaded.');
		expect(alert).toHaveTextContent(`huge.png: larger than ${IMAGE_MAX_BYTES / 1_000_000} MB.`);
		expect(screen.queryByRole('listitem', { name: /^Image 1/ })).not.toBeInTheDocument();
	});

	it('marks the first image as cover and reorders with buttons, announcing it', async () => {
		const first = png('first.png');
		const second = png('second.png');
		const user = setup([uploadMock(first, 'uploads/product/1.png'), uploadMock(second, 'uploads/product/2.png')]);

		await addFiles(user, first, second);
		await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());

		const tile = (index: number) => screen.getByRole('listitem', { name: `Image ${index} of 2` });
		expect(within(tile(1)).getByText('Cover')).toBeInTheDocument();
		expect(within(tile(1)).getByRole('button', { name: 'Move image 1 earlier' })).toBeDisabled();

		await user.click(within(tile(2)).getByRole('button', { name: 'Move image 2 earlier' }));
		expect(screen.getByRole('status')).toHaveTextContent('Image 2 moved to position 1.');
		// The moved image keeps keyboard focus (its "earlier" button is now disabled, so focus moves to "later").
		expect(within(tile(1)).getByRole('button', { name: 'Move image 1 later' })).toHaveFocus();
		expect(within(tile(1)).getByText('Cover')).toBeInTheDocument();
	});

	it('shows a failed upload with a working retry', async () => {
		const image = png('flaky.png');
		const user = setup([
			{ request: { query: UploadAgentImageMutation, variables: { file: image } }, error: new TypeError('Failed to fetch') },
			uploadMock(image, 'uploads/product/ok.png'),
		]);

		await addFiles(user, image);
		const failed = await screen.findByText('Image 1 didn’t upload.');
		await user.click(within(failed).getByRole('button', { name: 'Retry' }));
		await waitFor(() => expect(screen.queryByText('Image 1 didn’t upload.')).not.toBeInTheDocument());
		expect(screen.getByRole('listitem', { name: 'Image 1 of 1' })).toBeInTheDocument();
	});

	it('removes an image', async () => {
		const image = png('a.png');
		const user = setup([uploadMock(image, 'uploads/product/a.png')]);
		await addFiles(user, image);
		await user.click(await screen.findByRole('button', { name: 'Remove image 1' }));
		expect(screen.queryByRole('listitem', { name: /^Image 1/ })).not.toBeInTheDocument();
		expect(screen.getByRole('status')).toHaveTextContent('Image 1 removed.');
	});

	it('puts a duplicate title (CONFLICT) under the title field', async () => {
		const cover = png('cover.png');
		const user = setup([
			uploadMock(cover, 'uploads/product/cover.png'),
			{
				request: {
					query: CreateAgentMutation,
					variables: {
						input: {
							productTitle: 'SupportPilot',
							productCategory: 'CUSTOMER_SUPPORT',
							productPricing: 'SUBSCRIPTION',
							productPrice: 49,
							productImages: ['uploads/product/cover.png'],
							productDesc: DESC,
						},
					},
				},
				error: new ApolloError({
					graphQLErrors: [{ message: 'A product with this title already exists for this creator!', extensions: { code: 'CONFLICT' } }],
				}),
			},
		]);

		await fillBasics(user);
		await addFiles(user, cover);
		await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());
		await user.click(screen.getByRole('button', { name: 'Publish agent' }));

		expect(await screen.findByText('You already have an agent with this title. Choose another one.')).toBeInTheDocument();
		expect(screen.getByRole('textbox', { name: /^Title/ })).toHaveFocus();
		expect(mockRouter.asPath).toBe('/dashboard/agents/new');
	});

	it('asks before leaving with unsaved changes', async () => {
		const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
		const user = setup([]);

		await user.type(screen.getByRole('textbox', { name: /^Title/ }), 'Draft');
		// next/link needs Next's RouterContext, which tests don't have; navigate through the router instead.
		await act(async () => {
			await mockRouter.push('/dashboard/agents').catch(() => undefined);
		});

		expect(confirm).toHaveBeenCalledWith('You have unsaved changes. Leave this page and lose them?');
		expect(mockRouter.asPath).toBe('/dashboard/agents/new');
	});

	it('mirrors the form in a live preview card', async () => {
		const user = setup([]);
		const preview = screen.getByRole('complementary', { name: 'Preview' });
		expect(within(preview).getByText('Your agent title')).toBeInTheDocument();

		await user.type(screen.getByRole('textbox', { name: /^Title/ }), 'LeadCatcher');
		await user.click(screen.getByRole('radio', { name: /One-time/ }));
		await user.type(screen.getByRole('spinbutton'), '29');

		expect(within(preview).getByText('LeadCatcher')).toBeInTheDocument();
		expect(within(preview).getByText('$29')).toBeInTheDocument();
		expect(within(preview).getByText('by @nova_labs')).toBeInTheDocument();
	});
});
