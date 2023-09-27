// Lots of help via https://itnext.io/implementing-arithmetic-within-typescripts-type-system-a1ef140a6f6f

// Convert a tuple type to a numeric literal of its length
export type Length<T extends any[]> = 
    T extends { length: infer L } 
      ? L 
      : never;

// Convert a numeric literal to a tuple type of that length
export type BuildTuple<L extends number, T extends any[] = []> = 
    T extends { length: L } 
      ? T 
      : BuildTuple<L, [...T, any]>;


// Add two numeric literals together
export type Add<A extends number, B extends number> = 
    Length<[...BuildTuple<A>, ...BuildTuple<B>]>;

// Surprise! Subtracts two numbers
export type Subtract<A extends number, B extends number> = 
    BuildTuple<A> extends [...(infer U), ...BuildTuple<B>]
        ? Length<U>
        : never;


// Are two types equal?
export type EQ<A, B> =
    A extends B
        ? (B extends A ? true : false)
        : false;

// Is either number zero?
export type AtTerminus<A extends number, B extends number> = 
    A extends 0
        ? true
        : (B extends 0 ? true : false);


// Compares two numbers
export type LT<A extends number, B extends number> = 
    AtTerminus<A, B> extends true
        ? EQ<A, B> extends true
            ? false
            : (A extends 0 ? true : false)
        : LT<Subtract<A, 1>, Subtract<B, 1>>;

// Gets the remainder of A / B
export type Modulo<A extends number, B extends number> = 
    LT<A, B> extends true 
      ? A 
      : Modulo<Subtract<A, B>, B>;

// Adds an item to the tuple
export type Push<T extends any[], V> = [...T, V];

// Remove the first element of a tuple
export type Unshift<T extends any[]> =
  T extends [infer _, ...infer Rest] 
    ? Rest 
    : [];
