import GameService from "./GameService";
import {World} from "../ECS/World";
import SingletonComponent from "./SingletonComponent";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Helloworld extends cc.Component {


    isPressingSpace: boolean = false;

    onLoad() {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    }

    update(dt: number) {
        if (this.isPressingSpace) {
            let singleton = World.getInstance().getSingletonEntityComponent(SingletonComponent);
            singleton.pressSpace = true;
            this.isPressingSpace = false;
        }
    }

    gameStart() {
        GameService.initWorld();
        GameService.gameStart();
    }


    onKeyDown(event: cc.Event.EventCustom) {
        if (event.keyCode == cc.macro.KEY.space) {
            this.isPressingSpace = true;
        }
    }

    onKeyUp(event: cc.Event.EventCustom) {
        if (event.keyCode == cc.macro.KEY.space) {
            this.isPressingSpace = false;
        }
    }
}
