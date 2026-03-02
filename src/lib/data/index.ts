// Data service export point
// Swap mock <-> real implementation by changing the import here

import { MockCityDataService } from './mock';

export { MockCityDataService } from './mock';
export { mockDebateStream } from './mock-debate-service';
export { MOCK_DEBATES } from './mock-debates';
export type { CityDataService } from './types';

export const cityDataService: import('./types').CityDataService = new MockCityDataService();
