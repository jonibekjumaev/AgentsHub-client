import type { MockedResponse } from '@apollo/client/testing';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Me } from '@/auth';
import { renderWithProviders } from '@/test/renderWithProviders';
import { FavoriteAgentsQuery } from '../../graphql/saved';
import { makeAgent } from '../../test/fixtures';
import { SAVED_PAGE_SIZE, SavedAgents } from './SavedAgents';

const me = { _id: '6ac7992dd87bde19b9216c11', memberType: 'USER', memberStatus: 'ACTIVE', memberNick: 'dilnoza' } as Me;

const favoritesMock = (agents: ReturnType<typeof makeAgent>[]): MockedResponse => ({
	request: { query: FavoriteAgentsQuery, variables: { input: { page: 1, limit: SAVED_PAGE_SIZE } } },
	result: { data: { getFavorities: { __typename: 'Products', list: agents, metaCounter: [{ __typename: 'TotalCounter', total: agents.length }] } } },
});

describe('SavedAgents (S7)', () => {
	it('lists liked agents', async () => {
		renderWithProviders(<SavedAgents kind="favorites" />, { auth: { status: 'member', me }, mocks: [favoritesMock([makeAgent()])] });
		expect(await screen.findByRole('link', { name: /SupportPilot 0/ })).toBeInTheDocument();
	});

	it('explains an empty list with a way out', async () => {
		renderWithProviders(<SavedAgents kind="favorites" />, { auth: { status: 'member', me }, mocks: [favoritesMock([])] });
		expect(await screen.findByRole('heading', { name: 'No favorites yet' })).toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'Browse agents' })).toHaveAttribute('href', '/agents');
	});
});
