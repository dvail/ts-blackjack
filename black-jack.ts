import { Deal, Hit, Stand } from "./cards-utils";

type RandomSeed = 9;

type Hand = Deal<RandomSeed>;

type Round1 = Hit<Hand>;
type Round2 = Hit<Round1>;

type Round3 = Stand<Round2>;

type Round3 = Hit<Round2>;



