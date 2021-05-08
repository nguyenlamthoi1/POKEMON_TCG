window.POKEMON = {
    FIRE_TYPE: "fire_type",
    GRASS_TYPE: "grass_type",
    WATER_TYPE: "water_type",
    ELECTRIC_TYPE: "elec_type"
}
window.CONST = {
    GAME_PHASE: {
        SETUP: -1,
        START_GAME: 0,
        RUN_TIME: 1,
        END_GAME: 2,
        ON_GAME_START: "ongamestart",
        ON_TURN_START: "onturnstart",
        ON_TURN_END: "onturnend",
    },
    BATTLE_SLOT: {
        ACTIVE_TYPE: 0,
        BENCH_TYPE: 1,
    },
    CARD: {
        CAT:{
            PKM: "Pokemon",
            Energy: "Energy",
            Supporter: "Supporter",
            Item: "Item"
        },
        EVOL: {
            BASIC: 1,
            STAGE_1: 2,
            STAGE_2: 3
        }
       
    }
}
window.SELECTION = {
    TYPE: {
        PLAYER_EMPTY_ACTIVE: 0,
        PLAYER_EMPTY_BENCH: 1
    },
    CB_TYPE:{
        SHOW_PKM: 0
    }
};
