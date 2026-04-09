/**
 * React Native mock for Jest test environment.
 */
export const Platform = {
  OS: 'android',
  select: (obj: Record<string, unknown>) => obj.android ?? obj.default,
};

export const Linking = {
  openURL: jest.fn(),
  openSettings: jest.fn(),
};

export const Dimensions = {
  get: () => ({ width: 390, height: 844 }),
};

export default {
  Platform,
  Linking,
  Dimensions,
};
