import { Add, Length, LT, Modulo, Push, Subtract, Unshift } from './math-utils';

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

// Recurse and subtract 10 for each ace until the aces are gone or the value is under 22
type HandleAcesValue<Value extends number, Aces extends 'A'[] = []> =
  LT<Value, 22> extends true
    ? Value
    : Length<Aces> extends 0
      ? Value
      : HandleAcesValue<Subtract<Value, 10>, Unshift<Aces>>;

type SumHand<Hand extends Card[], Value extends number = 0> =
  Length<Hand> extends 0
    ? Value
    : SumHand<Unshift<Hand>, Add<CardValues[Hand[0]], Value>>;

type CollectAces<Hand extends Card[], Aces extends 'A'[] = []> =
  Length<Hand> extends 0
    ? Aces
    : CollectAces<
          Unshift<Hand>, 
          Hand[0] extends 'A' ? Push<Aces, 'A'> : Aces
      >;

type GetHandValue<Hand extends Card[]> = 
  HandleAcesValue<SumHand<Hand>, CollectAces<Hand>>;

type GameState = {
  shoeIndex: number;
  player: Card[],
  dealer: Card[],
};

type BlackJack = ['A', ('10' | 'J' | 'Q' | 'K')] | [('10' | 'J' | 'Q' | 'K'), 'A'];

export type Deal<Seed extends number> = {
    shoeIndex: Add<Seed, 4>,
    player: [GetCard<Seed>, GetCard<Add<Seed, 1>>],
    dealer: [GetCard<Add<Seed, 2>>, GetCard<Add<Seed, 3>>],
    status: GameState['player'] extends BlackJack
      ? 'BLACKJACK! You win!' 
      : `Player turn, hit or stand?`;
}

export type Hit<
  State extends GameState,
  NextState extends GameState = HitPlayer<State>,
  PlayerHandValue extends number = GetHandValue<NextState['player']>,
  DealerHandValue extends number = GetHandValue<NextState['dealer']>,
> = {
  shoeIndex: Add<State['shoeIndex'], 1>,
  player: NextState['player'],
  dealer: State['dealer'],
  status: LT<PlayerHandValue, 22> extends true 
    ? `Player turn, (Dealer: ${DealerHandValue}, You: ${PlayerHandValue})` 
    : `PLAYER BUST! (Dealer: ${DealerHandValue}, You: ${PlayerHandValue})`,
};

export type Stand<
  State extends GameState,
  PlayerHandValue extends number = GetHandValue<State['player']>,
  DealerHandValue extends number = GetHandValue<State['dealer']>,
  DealerUnder17 extends boolean = LT<DealerHandValue, 17>,
> =
  DealerUnder17 extends true
    ? Stand<HitDealer<State>>
    : {
      shoeIndex: Add<State['shoeIndex'], 1>,
      player: State['player'],
      dealer: State['dealer'],
      status: LT<DealerHandValue, 22> extends false 
        ? `DEALER BUST, YOU WIN! (Dealer: ${DealerHandValue}, You: ${PlayerHandValue})`
        : LT<DealerHandValue, PlayerHandValue> extends true
          ? `YOU WIN! (Dealer: ${DealerHandValue}, You: ${PlayerHandValue})`
          : `YOU LOSE! (Dealer: ${DealerHandValue}, You: ${PlayerHandValue})`
    }

    /*
type Test = Stand<{
  shoeIndex: 0,
  player: ['K', '7'],
  dealer: ['3', '5'],
}>

type Test2 = Stand<{
  shoeIndex: 0,
  player: ['K', '7'],
  dealer: ['K', '5'],
}>

type Test3 = Stand<{
  shoeIndex: 0,
  player: ['K', '7'],
  dealer: ['K', '8'],
}>
*/
