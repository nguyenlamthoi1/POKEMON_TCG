window.GAME_ACTION = {
    TYPE: {
        SUMMON_A_POKEMON: 0,
        EVOLVE_A_POKEMON: 1,
        ATTACH_ENERGY: 2,
        DEAL_ACTIVE_OPP_PKM: 0
    },
    DEAL_ACTIVE_OPP_PKM: 0,
    DRAW: 1,
    ATTACK_OPP_ACTIVE_POKEMON: "A0",
};
window.COND = {
    NONE: 0
};
window.VALUE_TYPE = {
    DEFAULT: 0,
    NUM_HEAD: 1
};
window.MOVE = {
    "M0": {//Override: move_name, energy_cost, dmg_value, cond
        0: {
            cond: COND.NONE,
            actionType: GAME_ACTION.DEAL_ACTIVE_OPP_PKM,
            valueType: VALUE_TYPE.DEFAULT
        }

    },
    "M1": {//Override: move_name, energy_cost, dmg_value, cond
        "0": {
            COND: {
                FLIP_COIN_HEAD: 1
            },
            ACTION: GAME_ACTION.DEAL_ACTIVE_OPP_PKM,
            VALUE_TYPE: VALUE_TYPE.DEFAULT
        },
        "1": {
            COND: {
                FLIP_COIN_HEAD: 1
            },
            ACTION: GAME_ACTION.DRAW,
            VALUE_TYPE: 1
        },

    },
};