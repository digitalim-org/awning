export default class TestRunner {
  #tests: Record<string, Test[]> = {};
  #focused = false;
  #beforeEach: HookBucket = {
    global: noOpHookPromise,
  };
  #afterEach: HookBucket = {
    global: noOpHookPromise,
  };

  setBeforeEach(fn: HookPromise, group: string) {
    this.#beforeEach[group] = fn;
  }

  setAfterEach(fn: HookPromise, group: string) {
    this.#afterEach[group] = fn;
  }

  addTest(test: Test, group: string, { focus = false } = {}) {
    console.log("focused", this.#focused);
    console.log("focus", focus);
    if (this.#focused) return;

    if (focus) {
      this.#focused = true;
      this.#tests = {};
      this.#tests[group] = [];
    } else {
      this.#tests[group] = this.#tests[group] || [];
    }

    this.#tests[group].push(test);
  }

  async runGroup(group: string) {
    console.log("running group", group);
    console.log("tests", this.#tests);
    if (!this.#tests[group]) return;

    await Promise.all(
      this.#tests[group].map((test) =>
        this.testWrapper(
          test,
          this.#beforeEach[group] || noOpHookPromise,
          this.#afterEach[group] || noOpHookPromise,
        )
      ),
    );
  }

  testWrapper(test: Test, _beforeEach: HookPromise, _afterEach: HookPromise) {
    Deno.test(test.name, async (t) => {
      await this.#beforeEach.global();
      await _beforeEach();
      const res = test.fn(t);
      if (res instanceof Promise) {
        await res;
      }
      await _afterEach();
      await this.#afterEach.global();
    });
  }
}
