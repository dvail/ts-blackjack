import { Add, Length, LT, Modulo, Unshift } from './math-utils';

type CardValues = {
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  'J': 10,
  'Q': 10,
  'K': 10,
  'A': 11,
};

type Card = keyof CardValues;

// Create a deck of 52 Cards in random order
type Deck = [
  'Q', 'K', '6', '7', '8', '9', '10', 'J', 'A', '2', '3', '4', '5',
  '7', '8', '9', '10', 'J', '6',  'K', 'A', '7', '8', '9', '10', '4', '5', '6',
  'Q', '2', '3', '4', '5', 'J', '2', '3', 'Q', 'K', 'A', '9', '10', '8',
  '2', '3', '4', '6',  'K', 'A', '7', 'Q', '5', 'J',
];

type ShoeSeed = Modulo<125, Length<Deck>>;

type GetCard<Seed extends number> = Deck[Modulo<Seed, Length<Deck>>];

type HitPlayer<State extends GameState> = {
  shoeIndex: Add<State['shoeIndex'], 1>,
  player: [...State['player'], GetCard<State['shoeIndex']>],
  dealer: State['dealer'],
};

type HitDealer<State extends GameState> = {
  shoeIndex: Add<State['shoeIndex'], 1>,
  player: State['player'],
  dealer: [...State['dealer'], GetCard<State['shoeIndex']>],
};

type GetHandValue<Hand extends Card[], Value extends number = 0> =
  Length<Hand> extends 0
    ? Value
    : Add<CardValues[Hand[0]], GetHandValue<Unshift<Hand>, Value>>;

type GameState = {
  shoeIndex: number;
  player: Card[],
  dealer: Card[],
};

export type Deal<Seed extends number> = {
  shoeIndex: Add<Seed, 4>,
  player: [GetCard<Seed>, GetCard<Add<Seed, 1>>],
  dealer: [GetCard<Add<Seed, 2>>, GetCard<Add<Seed, 3>>],
}

export type Hit<State extends GameState> = {
  shoeIndex: Add<State['shoeIndex'], 1>,
  player: HitPlayer<State>['player'],
  dealer: State['dealer'],
  status: LT<GetHandValue<HitPlayer<State>['player']>, 22> extends true 
    ? `Player turn, you have ${GetHandValue<HitPlayer<State>['player']>}` 
    : `PLAYER BUST! (${GetHandValue<HitPlayer<State>['player']>})`,
};

export type Stand<State extends GameState> =
  LT<GetHandValue<HitDealer<State>['dealer']>, 16> extends true
    ? Stand<HitDealer<State>>
    : {
      shoeIndex: Add<State['shoeIndex'], 1>,
      player: State['player'],
      dealer: HitDealer<State>['dealer'],
      status: LT<GetHandValue<HitDealer<State>['dealer']>, 22> extends false 
        ? `DEALER BUST, YOU WIN! (Dealer: ${GetHandValue<HitDealer<State>['dealer']>}, You: ${GetHandValue<State['player']>})`
        : LT<GetHandValue<HitDealer<State>['dealer']>, GetHandValue<State['player']>> extends true
          ? `YOU WIN! (Dealer: ${GetHandValue<HitDealer<State>['dealer']>}, You: ${GetHandValue<State['player']>})`
          : `YOU LOSE! (Dealer: ${GetHandValue<HitDealer<State>['dealer']>}, You: ${GetHandValue<State['player']>})`
    }

type Test = Stand<{
  shoeIndex: 0,
  player: ['K', '9'],
  dealer: ['3', '5'],
}>
