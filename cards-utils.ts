import { Add, Length, LT, Modulo, Push, Subtract, Unshift } from './math-utils';

type CardValues = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 10, 'Q': 10, 'K': 10, 'A': 11 };

type Card = keyof CardValues;

// Create a deck of 52 Cards in "random" order
type Deck = [
  'Q', 'K', '6', '7', '8', '9', '10', 'J', 'A', '2', '3', '4', '5',
  '7', '8', '9', '10', 'J', '6',  'K', 'A', '7', '8', '9', '10', '4', '5', '6',
  'Q', '2', '3', '4', '5', 'J', '2', '3', 'Q', 'K', 'A', '9', '10', '8',
  '2', '3', '4', '6',  'K', 'A', '7', 'Q', '5', 'J',
];

// @ts-expect-error - Ignore possible infinite recursion
type GetCard<Seed extends number> = Deck[Modulo<Seed, Length<Deck>>];

type HitPlayer<State extends GameState> = {
  winBonus: State['winBonus'],
  currentPoints: State['currentPoints'],
  shoeIndex: Add<State['shoeIndex'], 1>,
  player: [...State['player'], GetCard<State['shoeIndex']>],
  dealer: State['dealer'],
};

type HitDealer<State extends GameState> = {
  winBonus: State['winBonus'],
  currentPoints: State['currentPoints'],
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
  winBonus: number;
  currentPoints: number;
  shoeIndex: number;
  player: Card[],
  dealer: Card[],
};

export type BlackJack = ['A', ('10' | 'J' | 'Q' | 'K')] | [('10' | 'J' | 'Q' | 'K'), 'A'];

type Init<Seed extends number, Bet extends number> = {
    winBonus: Bet,
    currentPoints: 20,
    shoeIndex: Add<Seed, 4>,
    player: [GetCard<Seed>, GetCard<Add<Seed, 1>>],
    dealer: [GetCard<Add<Seed, 2>>, GetCard<Add<Seed, 3>>]
};

export type Play<Seed extends number, Bet extends number = 1, State extends GameState = Init<Seed, Bet>> = {
    winBonus: State['player'] extends BlackJack ? 0 : Bet,
    currentPoints: State['player'] extends BlackJack
      ? Add<State['currentPoints'], Bet>
      : Subtract<State['currentPoints'], Bet>,
    shoeIndex: State['shoeIndex'],
    player: State['player'],
    dealer: State['dealer'],
    status: State['player'] extends BlackJack
      ? 'BLACKJACK! You win!' 
      : `Player turn, hit or stand?`;
}

export type Deal<
  State extends GameState, Bet extends number = 1,
  PlayerCards = [GetCard<State['shoeIndex']>, GetCard<Add<State['shoeIndex'], 1>>],
  DealerCards = [GetCard<Add<State['shoeIndex'], 2>>, GetCard<Add<State['shoeIndex'], 3>>]
> = {
    winBonus: PlayerCards extends BlackJack ? 0 : Bet,
    currentPoints: PlayerCards extends BlackJack
      ? Add<State['currentPoints'], Bet>
      : Subtract<State['currentPoints'], Bet>,
    shoeIndex: Add<State['shoeIndex'], 4>,
    player: PlayerCards,
    dealer: DealerCards,
    status: PlayerCards extends BlackJack
      ? 'BLACKJACK! You win!' 
      : `Player turn, hit or stand?`;
}


export type Hit<
  State extends GameState,
  NextState extends GameState = HitPlayer<State>,
  PlayerHandValue extends number = GetHandValue<NextState['player']>,
  DealerHandValue extends number = GetHandValue<NextState['dealer']>,
  PlayerBust = LT<PlayerHandValue, 22> extends true ? false : true,
> = {
  winBonus: PlayerBust extends true ? 0 : State['winBonus'],
  currentPoints: State['currentPoints'],
  shoeIndex: Add<State['shoeIndex'], 1>,
  player: NextState['player'],
  dealer: State['dealer'],
  status: PlayerBust extends true 
    ? `PLAYER BUST! (Dealer: ${DealerHandValue}, You: ${PlayerHandValue})`
    : `Player turn, (Dealer: ${DealerHandValue}, You: ${PlayerHandValue})` 
};

// WIP
export type Double<
  State extends GameState,
  NextState extends GameState = Hit<{
    winBonus: Add<State['winBonus'], State['winBonus']>,
    currentPoints: Subtract<State['currentPoints'], State['winBonus']>,
    shoeIndex: State['shoeIndex'],
    player: State['player'],
    dealer: State['dealer'],
  }>,
  PlayerHandValue extends number = GetHandValue<NextState['player']>,
  PlayerBust = LT<PlayerHandValue, 22> extends true ? false : true,
> = PlayerBust extends true
? NextState
: Stand<NextState> ;

export type Stand<
  State extends GameState,
  PlayerHandValue extends number = GetHandValue<State['player']>,
  DealerHandValue extends number = GetHandValue<State['dealer']>,
  DealerUnder17 = LT<DealerHandValue, 17>,
  DealerBust = LT<DealerHandValue, 22> extends true ? false : true,
  PlayerBeatsDealer = LT<DealerHandValue, PlayerHandValue>,
  WinAmount = Add<State['winBonus'], State['winBonus']>
> =
  DealerUnder17 extends true
    ? Stand<HitDealer<State>>
    : {
      winBonus: 0,
      currentPoints: DealerBust extends true 
        ? Add<State['currentPoints'], WinAmount>
        : PlayerBeatsDealer extends true
          ? Add<State['currentPoints'], WinAmount>
          : State['currentPoints']
      shoeIndex: Add<State['shoeIndex'], 1>,
      player: State['player'],
      dealer: State['dealer'],
      status: DealerBust extends true 
        ? `DEALER BUST, YOU WIN! (Dealer: ${DealerHandValue}, You: ${PlayerHandValue})`
        : PlayerBeatsDealer extends true
          ? `YOU WIN! (Dealer: ${DealerHandValue}, You: ${PlayerHandValue})`
          : `YOU LOSE! (Dealer: ${DealerHandValue}, You: ${PlayerHandValue})`
    }
