import { Add, Length, LT, Modulo, Subtract } from './math-utils';

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


// Recurse and subtract 10 for each ace until the aces are gone or the value is under 22
type HandleAcesValue<Value extends number, Aces extends 'A'[] = []> =
  LT<Value, 22> extends true                           ? Value :
  Aces extends [infer _, ...infer Rest extends 'A'[]]  ? HandleAcesValue<Subtract<Value, 10>, Rest> :
  /* otherwise */                                        Value;


type SumHand<T extends Card[], Value extends number = 0> =
  T extends [infer A extends Card, infer B extends Card, ...infer Rest extends Card[]] ? SumHand<[B, ...Rest], Add<CardValues[A], Value>> :
  T extends [infer A extends Card, infer B extends Card]                               ? SumHand<[B],          Add<CardValues[A], Value>> :
  T extends [infer A extends Card]                                                     ? Add<CardValues[A], Value> :
  /* otherwise */                                                                        Value;


type CollectAces<Hand extends Card[], Aces extends 'A'[] = []> =
  Hand extends [infer _ extends 'A', ...infer Rest extends Card[]] ? CollectAces<Rest, [...Aces, 'A']> :
  Hand extends [infer _,             ...infer Rest extends Card[]] ? CollectAces<Rest, Aces> :
  /* otherwise */                                                    Aces;

type GetHandValue<Hand extends Card[]> = HandleAcesValue<SumHand<Hand>, CollectAces<Hand>>;

type BlackJack = ['A', ('10' | 'J' | 'Q' | 'K')] | [('10' | 'J' | 'Q' | 'K'), 'A'];

// TODO No implementation for "Push"
// TODO No implementation for "Split"
// TODO No implementation for "Surrender"
// TODO No implementation for "Insurance"
// TODO No implementation for BlackJack bonus
// TODO No handling of dealer BlackJack

type GameState = {
  winBonus: number;
  currentPoints: number;
  shoeIndex: number;
  player: Card[];
  dealer: Card[];
  status?: string;
};

type Init<Seed extends number, Bet extends number> = {
    winBonus: Bet,
    currentPoints: 20,
    shoeIndex: Add<Seed, 4>,
    player: [GetCard<Seed>, GetCard<Add<Seed, 1>>],
    dealer: [GetCard<Add<Seed, 2>>, GetCard<Add<Seed, 3>>]
};

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

export type Play<Seed extends number, Bet extends number = 1, State extends GameState = Init<Seed, Bet>> = {
    winBonus: State['player'] extends BlackJack ? 0 : Bet,
    currentPoints: 
      State['player'] extends BlackJack ? Add<State['currentPoints'], Bet> :
      /* otherwise */                     Subtract<State['currentPoints'], Bet>,
    shoeIndex: State['shoeIndex'],
    player: State['player'],
    dealer: State['dealer'],
    status: 
      State['player'] extends BlackJack ? 'BLACKJACK! You win!' :
      /* otherwise */                     `Player turn, hit or stand?`;
}

export type Deal<
  State extends GameState, Bet extends number = 1,
  PlayerCards = [GetCard<State['shoeIndex']>, GetCard<Add<State['shoeIndex'], 1>>],
  DealerCards = [GetCard<Add<State['shoeIndex'], 2>>, GetCard<Add<State['shoeIndex'], 3>>]
> = {
    winBonus: PlayerCards extends BlackJack ? 0 : Bet,
    currentPoints: 
      PlayerCards extends BlackJack ? Add<State['currentPoints'], Bet> :
      /* otherwise */                 Subtract<State['currentPoints'], Bet>,
    shoeIndex: Add<State['shoeIndex'], 4>,
    player: PlayerCards,
    dealer: DealerCards,
    status: 
      PlayerCards extends BlackJack ? 'BLACKJACK! You win!' :
      /* otherwise */                 `Player turn, hit or stand?`;
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
  status: 
    PlayerBust extends true ? `PLAYER BUST! (Dealer: ${DealerHandValue}, You: ${PlayerHandValue})` :
    /* otherwise */           `Player turn, (Dealer: ${DealerHandValue}, You: ${PlayerHandValue})` 
};

export type Stand<
  State extends GameState,
  PlayerHandValue extends number = GetHandValue<State['player']>,
  DealerHandValue extends number = GetHandValue<State['dealer']>,
  DealerUnder17 = LT<DealerHandValue, 17>,
  DealerBust = LT<DealerHandValue, 22> extends true ? false : true,
  PlayerBeatsDealer = LT<DealerHandValue, PlayerHandValue>,
  WinAmount = Add<State['winBonus'], State['winBonus']>
> =
  DealerUnder17 extends true ? Stand<HitDealer<State>> :
 /* otherwise */             {
                                winBonus: 0,
                                currentPoints: 
                                  DealerBust extends true        ? Add<State['currentPoints'], WinAmount> :
                                  PlayerBeatsDealer extends true ? Add<State['currentPoints'], WinAmount> :
                                  /* otherwise */                  State['currentPoints']
                                shoeIndex: Add<State['shoeIndex'], 1>,
                                player: State['player'],
                                dealer: State['dealer'],
                                status: 
                                  DealerBust extends true        ? `DEALER BUST, YOU WIN! (Dealer: ${DealerHandValue}, You: ${PlayerHandValue})` :
                                  PlayerBeatsDealer extends true ? `YOU WIN! (Dealer: ${DealerHandValue}, You: ${PlayerHandValue})` :
                                  /* otherwise */                  `YOU LOSE! (Dealer: ${DealerHandValue}, You: ${PlayerHandValue})`
                              }

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
> =
  PlayerBust extends true ? NextState : // If the player busts, forfeiting the win bonus will occur during the Hit
  /* otherwise */           Stand<NextState> ;

