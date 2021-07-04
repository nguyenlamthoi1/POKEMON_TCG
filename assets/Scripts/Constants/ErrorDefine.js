window.ERROR_TYPE = {
    SUCCESS: "success",
    LOGIN: {
        WRONG_USERNAME: "wrongusername",
        WRONG_PASSWORD: "wrongpassword"
    }
}
window.NW_REQUEST = {
    CONNECT_TO_SERVER: "connecttoserver",
    CLIENT_SEND_PACKAGE: "clientsendpackage",
    SERVER_SEND_PACKAGE: "serversendpackage",
    //CMD
    CMD_GET_PLAYER_DATA: "GET_USER_DATA",
    CMD_SAVE_DECK: "SAVE_DECK",
    CMD_FIND_GAME: "FIND_GAME",
    CMD_FOUND_GAME: "FOUND_GAME",
    //Room CMD
    CMD_ROOM: "CMD_ROOM",
    CMD_ROOM_READY: "CMD_ROOM_READY",
    CMD_ROOM_START: "CMD_ROOM_START",
    CMD_ROOM_START_PHASE: "CMD_ROOM_START_PHASE",
    CMD_ROOM_PLAY_PHASE: "CMD_ROOM_PLAY_PHASE",
    CMD_ROOM_END_TURN: "CMD_ROOM_END_TURN",
    
    CMD_ROOM_DROP_CARD: "CMD_ROOM_DROP_CARD",
    CMD_ROOM_DO_ACTION: "CMD_ROOM_OPP_ACTION"


    //--
}
window.NETWORK = {
    CMD:{
        LOGIN: 0
    }
}