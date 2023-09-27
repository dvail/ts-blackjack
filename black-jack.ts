import { Deal, Double, Play, Hit, Stand } from "./cards-utils";

type StartingSeed = 9;

type Hand = Play<StartingSeed>;

type Round1 = Hit<Hand>;
type Round2 = Hit<Round1>;
type Round3 = Stand<Round2>;

type Hand2 = Deal<Round3>;
type Round4 = Hit<Hand2>;

type Hand3 = Deal<Round4>;
type Round5 = Stand<Hand3>;

type Hand4 = Deal<Round5>;
type Round6 = Stand<Hand4>;

type Hand5 = Deal<Round6>;
type Round7 = Hit<Hand5>;

type Hand6 = Deal<Round7>;
type Round8 = Stand<Hand6>;

type Hand7 = Deal<Round8>;
type Round9 = Stand<Hand7>;

type Hand8 = Deal<Round9>;
type Round10 = Stand<Hand8>;

type Hand9 = Deal<Round10>;

type Hand10 = Deal<Hand9>;
type Round11 = Double<Hand10>;

type Hand11 = Deal<Round11>;
type Round12 = Double<Hand11>;

type Hand12 = Deal<Round12>;
type Round13 = Double<Hand12>;





