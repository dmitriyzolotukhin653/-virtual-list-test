export const values: Array<{ value: number; number: number; key: string }> =
  Array.from({ length: 10000 }).map((_, index) => ({
    value: Math.floor(Math.random() * 10000),
    number: index + 1,
    key: `key-${index}`,
  }));
