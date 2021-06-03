

cc.Class({
    extends: cc.Component,

    properties: {
        svAll: cc.Node,
        svSelected: cc.Node,
        touchArea: cc.Node,
        background: cc.Node,
        dragSlot: cc.Node,
        //Template
        smallPokemonCardTemplate: cc.Prefab,
        smallEnergyCardTemplate: cc.Prefab,
        //Label
        numCardInDeck: cc.Label,
    },
    init: function () {
        this.LOG_TAG = "[DECK]";

        this._cardUI = [];
        this._selectedCard = {}; //your Deck
        this._selectedCardNum = 0; //num card in deck
        //Init UI
        this.numCardInDeck.string = this._selectedCardNum + "/" + RULES.NUM_CARD_IN_DECK;
        //Init Scroll Views
        this._initScrollView(this.svAll);
        this._initScrollView(this.svSelected);
        this.background.on(cc.Node.EventType.TOUCH_START, this._onTouchExit, this);
    },
    showUI: function () {
        this.deckList = {
            "1": 9,
            "2": 9,
            "3": 9,
            "4": 9,
            "5": 9,
            "6": 9,
            "7": 9,
            "8": 9,
            "9": 9,
            "energy_0": 9,
            "energy_1": 9,
            "energy_2": 9,
            "energy_3": 9,
            "energy_4": 9
        };
        this._loadAllScrollView(this.deckList);
    },
    _loadAllScrollView: function (deckList) {
        this._allCardUI = {};
        var svAll = this.svAll.getComponent(cc.ScrollView);
        var content = svAll.content; //Layout contains small cards
        var idx = 0;
        for (const cardId in deckList) {
            cc.log(this.LOG_TAG, "INIT_CARD", cardId, deckList[cardId]);
            var cardUI = this._initSmallCard(cardId, idx);
            content.addChild(cardUI);
            this._cardUI.push(cardUI);

            var cardComp = this._getCardComponent(cardUI);
            cardComp.setStackNumberEnabled(true);
            cardComp.setStackNumber(deckList[cardId]);
            this._allCardUI[cardId] = cardUI;
        }
    },
    
    _initSmallCard: function (cardId, idx) {
        cardData = JARVIS.getCardData(cardId);
        cc.log(this.LOG_TAG, JSON.stringify(cardData));
        var cardUI;
        switch (cardData.category) {
            case CONST.CARD.CAT.PKM: {
                cardUI = cc.instantiate(this.smallPokemonCardTemplate);
                cardUI.getComponent("SmallPokemonCard").init(cardData, idx, null, null, cardId, false);
                break;
            }
            case CONST.CARD.CAT.ENERGY: {
                cardUI = cc.instantiate(this.smallEnergyCardTemplate);
                cardUI.getComponent("SmallEnergyCard").init(cardData, idx, null, null, cardId, false);
                break;
            }
        }
        cardUI.on(cc.Node.EventType.TOUCH_START, this._onTouchSmallCard.bind(this, cardUI));
        cardUI.on(cc.Node.EventType.TOUCH_END, this._onCardUnTouchSmallCard.bind(this, cardId));
        cardUI.on(cc.Node.EventType.TOUCH_CANCEL, this._onCardUnTouchSmallCard.bind(this, cardId));
        cardUI.on(cc.Node.EventType.TOUCH_MOVE, this._onCardMoveSmallCard, this);
        //cardUI.position = cc.v2(0, 0);

        return cardUI;
    },
    
    _addSelectedSmallCard: function (cardId) {
        //Check if we can select this card
        if (this.deckList[cardId] <= 0 || this._selectedCardNum + 1 > RULES.NUM_CARD_IN_DECK) return;
        //Otherwise
        if (!this._selectedCard[cardId]) {
            //Add cloned card UI If we dont have one
            this._selectedCard[cardId] = {};
            var cardUI = this.dragSlot.getChildByName("clonedCard"); //Get cloned Card UI
            cardUI.removeFromParent(); //Remove from parent(drag slot)
            var svSelected = this.svSelected.getComponent(cc.ScrollView);
            var content = svSelected.content; //Layout contains small cards
            content.addChild(cardUI); //Add cloned card to new scroll view
            var cardComp = this._getCardComponent(cardUI);
            cardComp.setStackNumberEnabled(true);
            cardComp.setStackNumber(1);
            //Add unselect listeners
            cardUI.on(cc.Node.EventType.TOUCH_START, this._unSelectSmallCard.bind(this, cardId, cardUI));
            //Add Ref
            this._selectedCard[cardId].cardUI = cardUI;
            this._selectedCard[cardId].num = 1;
        } else {// If we already have one
            var cardComp = this._getCardComponent(this._selectedCard[cardId].cardUI);
            this._selectedCard[cardId].num += 1;
            cardComp.setStackNumber(this._selectedCard[cardId].num);
        }
        //Update deck list
        this._selectedCardNum += 1; //Num card in deck
        this.deckList[cardId] -= 1; //Num card in all
        this._setStackNumberForCardUI(this.deckList[cardId], cardId, this.svAll);
        this.numCardInDeck.string = this._selectedCardNum + "/" + RULES.NUM_CARD_IN_DECK;
        this.svSelected.getComponent(cc.ScrollView).content.getComponent(cc.Layout).updateLayout();
    },
    _unSelectSmallCard: function (cardId, cardUI) {
        //Update deck list
        this._selectedCardNum -= 1; //Num card in deck
        this._selectedCard[cardId].num -= 1; // Num of card have cardId in deck
        this.deckList[cardId] += 1; // Num of card have cardId in all
        this._setStackNumberForCardUI(this._selectedCard[cardId].num, cardId, this.svSelected);
        this._setStackNumberForCardUI(this.deckList[cardId], cardId, this.svAll);
        this.numCardInDeck.string = this._selectedCardNum + "/" + RULES.NUM_CARD_IN_DECK;

        //If have no remaining card
        if (this._selectedCard[cardId].num <= 0) {
            var destroyCardUI = this._selectedCard[cardId].cardUI;
            this._selectedCard[cardId].cardUI = null;
            destroyCardUI.destroy();
            delete this._selectedCard[cardId];
        }
        this.idxAllScrolling = 0;
        this.idxSelectedScrolling = 0;

    },
    _getCardUIFromPool: function (cardData) {
        //Try get card UI from pool

    },
    //Utils
    _initScrollView: function (sv) {
        
        var contentLayout = sv.getComponent(cc.ScrollView).content.getComponent(cc.Layout);
        const NUM_CARD_SCROLL = 1; 
        this.viewW = (NUM_CARD_SCROLL) * this.smallPokemonCardTemplate.data.width + 1 * contentLayout.spacingX;

        var leftBtn = sv.getChildByName("leftBtn");
        var rightBtn = sv.getChildByName("rightBtn");
        if (sv == this.svAll) {
            //  -   Scroll View Listener
            var svEventHandler = new cc.Component.EventHandler();
            svEventHandler.target = this.node;
            svEventHandler.component = "DeckUI";
            svEventHandler.handler = "processScrollViewAll";
            svEventHandler.customEventData = "ALL_CARD";
            sv.getComponent(cc.ScrollView).scrollEvents.push(svEventHandler);

            //  - Scroll View button
            leftBtn.on("click", this._onTouchLeftBtnAllSV.bind(this, sv));
            rightBtn.on("click", this._onTouchRightBtnAllSV.bind(this, sv));
            //var n = Math.floor(this.svAll.getChildByName("view").width / this.smallPokemonCardTemplate.data.width);

            //  - Idx used for scroll
           this.idxAllScrolling = 0;
        }
        else {
            //   -   Scroll View Listener
            var svEventHandler = new cc.Component.EventHandler();
            svEventHandler.target = this.node;
            svEventHandler.component = "DeckUI";
            svEventHandler.handler = "processScrollViewAll";
            svEventHandler.customEventData = "SELECTED_CARD";
            sv.getComponent(cc.ScrollView).scrollEvents.push(svEventHandler);
            //  - Scroll View button
            leftBtn.on("click", this._onTouchLeftBtnSelectedSV.bind(this, sv));
            rightBtn.on("click", this._onTouchRightBtnSelectedSV.bind(this, sv));
            //  - Idx used for scroll
            this.idxSelectedScrolling = 0;
        }
    },
    _getCardComponent: function (cardUI) {
        var cardComp = cardUI.getComponent("SmallPokemonCard");
        if (cardComp == null) cardComp = cardUI.getComponent("SmallEnergyCard");
        return cardComp;
    },
    _setStackNumberForCardUI: function (num, cardId, scrollView) {
        if (scrollView == this.svAll) {
            var cardComp = this._getCardComponent(this._allCardUI[cardId]);
            cardComp.setStackNumber(num);
        } else {
            var cardComp = this._getCardComponent(this._selectedCard[cardId].cardUI);
            cardComp.setStackNumber(num);
        }
    },
    //--
    //Callbacks For Button
    _onTouchLeftBtnSelectedSV: function (sv) {
        var scrollView = sv.getComponent(cc.ScrollView);
        scrollView.horizontal = true;
        this.idxSelectedScrolling--;
        if (this.idxSelectedScrolling < 0) this.idxSelectedScrolling = 0;
        scrollView.scrollToOffset(cc.v2(this.viewW * this.idxSelectedScrolling, 0), 2);
    },
    _onTouchRightBtnSelectedSV: function (sv) {
        var scrollView = sv.getComponent(cc.ScrollView);
        scrollView.horizontal = true;
        if (this.viewW * (this.idxSelectedScrolling) < scrollView.getMaxScrollOffset().x) this.idxSelectedScrolling++;
        scrollView.scrollToOffset(cc.v2(this.viewW * this.idxSelectedScrolling, 0), 2);
    },
    _onTouchLeftBtnAllSV: function (sv) {
        var scrollView = sv.getComponent(cc.ScrollView);
        scrollView.horizontal = true;
        this.idxAllScrolling--;
        if (this.idxAllScrolling < 0) this.idxAllScrolling = 0;
        scrollView.scrollToOffset(cc.v2(this.viewW * this.idxAllScrolling, 0), 2);
    },
    _onTouchRightBtnAllSV: function (sv) {
        var scrollView = sv.getComponent(cc.ScrollView);
        scrollView.horizontal = true;
        if (this.viewW * (this.idxAllScrolling) < scrollView.getMaxScrollOffset().x) this.idxAllScrolling++;
        scrollView.scrollToOffset(cc.v2(this.viewW * this.idxAllScrolling, 0), 2);
    },
    //--
    //Callbacks For Small Card
    _onTouchSmallCard: function (cardUI, touchEvent) {
        if (!this._isHolding && !this._isSVScrolling) {
            this._isHolding = true;
            var clonedCard = cc.instantiate(cardUI);
            cc.log(this.LOG_TAG, "TOUCH_START_CLONED", clonedCard);

            clonedCard.position = cc.v2(0, 0);
            this.dragSlot.addChild(clonedCard);
            clonedCard.name = "clonedCard";
            this.dragSlot.active = true;
            this.dragSlot.position = this.dragSlot.parent.convertToNodeSpaceAR(touchEvent.getLocation());

        }
    },
    _onCardMoveSmallCard: function (touchEvent) {
        if (!this._isHolding) return; //Not move any card
        if (this._isHolding) {
            if (this._isSVScrolling) {
                this._isHolding = false;
                this.dragSlot.destroyAllChildren();
            }
            else {
                this.dragSlot.position = this.dragSlot.parent.convertToNodeSpaceAR(touchEvent.getLocation());
            }
        }
    },
    _onCardUnTouchSmallCard: function (cardId, touchEvent) {
        var localPosOfTouch = this.touchArea.convertToNodeSpaceAR(touchEvent.getLocation());
        if (localPosOfTouch.y > 0 && localPosOfTouch.y < this.touchArea.height && localPosOfTouch.x > 0 && localPosOfTouch.x < this.touchArea.width) {
            this._addSelectedSmallCard(cardId);
        }
        this._isHolding = false;
        this.dragSlot.active = false;
        this.dragSlot.destroyAllChildren();
    },
    //--
    //Callbacks For Scroll View
    processScrollViewAll: function (scrollview, eventType, customEventData) {
        switch (eventType) {
            case cc.ScrollView.EventType.SCROLL_BEGAN:
                this._isSVScrolling = true;
                break;
            case cc.ScrollView.EventType.SCROLL_ENDED:
                this._isSVScrolling = false;
                var scrollView = scrollview.getComponent(cc.ScrollView);
                scrollView.horizontal = false;
                this._toOffset = null;
                break;
        }
    },
    //--
    //Callbacks for others
    _onTouchExit: function () {
        while (this._cardUI.length > 0) {
            var destroyCard = this._cardUI.pop();
            destroyCard.removeFromParent();
            destroyCard.destroy();
        }

        this.node.active = false;
    }
});
