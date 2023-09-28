Simple implementation of blackjack in the TypeScript type system.

Example usage:

```ts
import { Deal, Double, Play, Hit, Stand } from "./cards-utils";

// Seed for "random", "shuffling" of deck
type StartingSeed = 9;

type Hand = Play<StartingSeed>;
/*
type Hand = {
    winBonus: 1;
    currentPoints: 19;
    shoeIndex: 13;
    player: ["2", "3"];
    dealer: ["4", "5"];
    status: "Player turn, hit or stand?";
}
*/

type Round1 = Hit<Hand>;
type Round2 = Hit<Round1>;
type Round3 = Stand<Round2>;

/*
type Round3 = {
    winBonus: 0;
    currentPoints: 21;
    shoeIndex: 17;
    player: ["2", "3", "7", "8"];
    dealer: ["4", "5", "9"];
    status: "YOU WIN! (Dealer: 18, You: 20)";
}
*/

type Hand2 = Deal<Round3>;
type Round4 = Hit<Hand2>;

/*
type Round4 = {
    winBonus: 0;
    currentPoints: 20;
    shoeIndex: 22;
    player: ["J", "6", "7"];
    dealer: ["K", "A"];
    status: "PLAYER BUST! (Dealer: 21, You: 23)";
}
*/

type Hand3 = Deal<Round4>;
type Round5 = Stand<Hand3>;

/*
type Round5 = {
    winBonus: 0;
    currentPoints: 19;
    shoeIndex: 28;
    player: ["8", "9"];
    dealer: ["10", "4", "5"];
    status: "YOU LOSE! (Dealer: 19, You: 17)";
}
*/
```

