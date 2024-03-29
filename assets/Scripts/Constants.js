window.COLLIDER_TAG = {
    CARD: 0,
    CARD_CHECKER: 1,
}
window.BOARD = {
    ACTIVE_PLACE: "active",
    BENCH: "bench",
    BENCH_SLOT: "bench_slot",
    MAX_BENCH: 5
},
window.POKEMON = {
    FIRE_TYPE: "fire",
    GRASS_TYPE: "grass",
    WATER_TYPE: "water",
    ELECTRIC_TYPE: "electric",
    NORMAL: "normal"
}
window.CONST = {
    EVENT: {
        //Network
        ON_CONNECT: "onconnect",
        ON_FOUND_GAME: "on_found_game",
        //UI
        TOUCH_HOLD: "ontouchhold",
        DOUBLE_TOUCH: "ondoubletouch",
        SHORT_CLICK: "shorclick"
        //COLLIDER
        
    },
    GAME_PHASE: {
        SETUP: -1,
        START: 0,
        PLAY: 1,
        END_GAME: 2,
        ON_GAME_START: "ongamestart",
        ON_GAME_START_PLAY: "ongamestartplay",
        ON_TURN_START: "onturnstart",
        ON_TURN_END: "onturnend",
        ON_SELECT_CANCEL: "select-canceled",
        ON_SELECT_DONE: "select-done"
    },
    BATTLE_SLOT: {
        ACTIVE_TYPE: 0,
        BENCH_TYPE: 1,
        ON_SLOT_SELECTED: "on-slot-selected"
    },
    CARD: {
        CAT: {
            PKM: "Pokemon",
            ENERGY: "Energy",
            SPTER: "Supporter",
            Item: "Item"
        },
        STAGE: {
            BASIC: 0,
            STAGE_1: 1,
            STAGE_2: 2
        }
    },
    ENERGY: {
        FIRE: "fire",
        WATER: "water",
        GRASS: "grass",
        ELECTRIC: "electric",
        NORMAL: "normal"
    },
    ACTION:{
        EVENT:{
            ON_FINISH: 0
        },
        TYPE:{
            DRAW: 0,
            PLAY_CARD: 1,
            END_TURN: 2,
        }
    }
}
window.SELECTION = {
    TYPE: {
        PLAYER_EMPTY_ACTIVE: 0,
        PLAYER_EMPTY_BENCH: 1,
        PLAYER_ALL_PKM: 2,
        ALL_PKM_TO_EVOLVE: 3
    },
    CB_TYPE: {
        SHOW_PKM: 0
    }
};

window.RULES = {
    NUM_CARD_IN_DECK: 10
}

