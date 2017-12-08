"use strict";

const derivable = require("../dist/derivable");
const { atom, derive, lens } = derivable;

test("__Reactor call passed function on derivable change after starting", () => {
  const a = atom(1);
  const b = derive(() => a.get() + 100);
  const c = lens({
    get: () => a.get() + 1,
    set: d => a.set(d - 1)
  });

  const react = jest.fn();

  const ar = new derivable.__Reactor(a, d => react("atom", d));
  const br = new derivable.__Reactor(b, d => react("derivation", d));
  const cr = new derivable.__Reactor(c, d => react("lens", d));

  a.set(10);

  ar.start();
  br.start();
  cr.start();

  a.set(20);

  expect(react.mock.calls).toEqual([
    ["atom", 20],
    ["derivation", 120],
    ["lens", 21]
  ]);
});

test("__Reactor not call passed function on derivable change after stopping", () => {
  const a = derivable.atom(1);

  const react = jest.fn();

  const ar = new derivable.__Reactor(a, d => react("atom", d));
  ar.start();

  a.set(10);

  ar.stop();

  a.set(20);

  expect(react.mock.calls).toEqual([["atom", 10]]);
});

test("__Reactor call passed function with current value on forcing", () => {
  const a = derivable.atom(1);

  const react = jest.fn();

  const ar = new derivable.__Reactor(a, d => react("atom", d));
  ar.start();
  ar.force();

  expect(react.mock.calls).toEqual([["atom", 1]]);
});

test("__captureDereferences executes the given function, returning an array of captured dereferences", () => {
  const a = derivable.atom("a");
  const b = derivable.atom("b");
  const c = a.derive(d => d.length);

  const _a = derivable.__captureDereferences(() => {
    a.get();
  });
  expect(_a).toEqual([a]);

  const _ab = derivable.__captureDereferences(() => {
    a.get();
    b.get();
  });
  expect(_ab).toEqual([a, b]);

  const _ba = derivable.__captureDereferences(() => {
    b.get();
    a.get();
  });
  expect(_ba).toEqual([b, a]);

  const _c = derivable.__captureDereferences(() => {
    c.get();
  });
  expect(_c).toEqual([c]);

  const _ca = derivable.__captureDereferences(() => {
    c.get();
    a.get();
  });
  expect(_ca).toEqual([c, a]);

  const _cab = derivable.__captureDereferences(() => {
    c.get();
    a.get();
    b.get();
  });
  expect(_cab).toEqual([c, a, b]);
});

test("__captureDereferences also capture reactor controller", () => {
  const a = derivable.atom(1);
  const captured = derivable.__captureDereferences(() => {
    a.react(() => {});
  });
  expect(captured.length).toBe(2);
  expect(captured[0].get()).toEqual({
    from: true,
    until: false,
    when: true
  });
  expect(captured[1]).toBe(a);
});
