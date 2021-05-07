// Global teardown for testing. This is always called when tests end.
export default async () => {
  // close testing server for test
  await global.testingSever.close();
};
