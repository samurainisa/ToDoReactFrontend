import { useSystemStore } from "./system-store";

describe("system-store", () => {
  beforeEach(() => {
    useSystemStore.getState().resetLoading();
  });

  test("increments/decrements with counter semantics", () => {
    const store = useSystemStore.getState();

    expect(store.loading).toBe(false);

    store.incrementLoadingCounter();
    expect(useSystemStore.getState().loading).toBe(true);

    store.incrementLoadingCounter();
    expect(useSystemStore.getState().loading).toBe(true);

    store.decrementLoadingCounter();
    expect(useSystemStore.getState().loading).toBe(true);

    store.decrementLoadingCounter();
    expect(useSystemStore.getState().loading).toBe(false);
  });

  test("resetLoading clears the counter", () => {
    const store = useSystemStore.getState();
    store.incrementLoadingCounter();
    store.incrementLoadingCounter();

    expect(useSystemStore.getState().loading).toBe(true);

    store.resetLoading();
    expect(useSystemStore.getState().loading).toBe(false);

    store.decrementLoadingCounter();
    expect(useSystemStore.getState().loading).toBe(false);
  });
});

