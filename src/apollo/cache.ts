import { InMemoryCache } from '@apollo/client';

/** Every entity has a MongoDB `_id`, which Apollo's default dataIdFromObject already uses. */
export const createCache = () => new InMemoryCache();
