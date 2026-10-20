import type { MockedResponse } from '@apollo/client/testing';
import { screen, within } from '@testing-library/react';
import mockRouter from 'next-router-mock';
import { beforeEach, describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/test/renderWithProviders';
import { CreatorsListQuery } from '../graphql/creators';
import { DEFAULT_CREATOR_FILTERS, creatorsListVariables } from '../lib/creatorsQuery';
import { CREATOR_ID, makeCreator } from '../test/fixtures';
import { CreatorsCatalog } from './CreatorsCatalog';

const listMock = (creators: ReturnType<typeof makeCreator>[], filters = DEFAULT_CREATOR_FILTERS): MockedResponse => ({
	request: { query: CreatorsListQuery, variables: creatorsListVariables(filters) },
	result: { data: { getCreators: { __typename: 'Members', list: creators, metaCounter: [{ __typename: 'TotalCounter', total: creators.length }] } } },
});

describe('CreatorsCatalog (S6)', () => {
	beforeEach(() => {
		mockRouter.setCurrentUrl('/creators');
	});

	it('shows creator cards per Creators.html, with Follow for guests', async () => {
		renderWithProviders(<CreatorsCatalog />, { mocks: [listMock([makeCreator(), makeCreator({}, 1)])], auth: { status: 'guest' } });

		const list = await screen.findByRole('list', { name: 'Creators' });
		const [first] = within(list).getAllByRole('listitem');
		expect(within(first).getByRole('link', { name: 'Nova Labs' })).toHaveAttribute('href', `/members/${CREATOR_ID}`);
		expect(within(first).getByText('#1')).toBeInTheDocument();
		expect(within(first).getByText('@nova_labs')).toBeInTheDocument();
		expect(within(first).getByText('1,204')).toBeInTheDocument();
		expect(within(first).getByRole('button', { name: 'Follow @nova_labs' })).toHaveAttribute('aria-pressed', 'false');
		expect(screen.getByText('2')).toBeInTheDocument();
	});

	it('explains an empty search', async () => {
		mockRouter.setCurrentUrl('/creators?q=zzz');
		renderWithProviders(<CreatorsCatalog />, { mocks: [listMock([], { ...DEFAULT_CREATOR_FILTERS, text: 'zzz' })], auth: { status: 'guest' } });
		expect(await screen.findByRole('heading', { name: 'No creators match' })).toBeInTheDocument();
	});
});
