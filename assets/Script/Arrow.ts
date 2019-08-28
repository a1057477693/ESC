/**
 * 实体（箭头）
 */
import {Entity} from "../ECS/Entity";
import MoveComponent from "./MoveComponent";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Arrow extends cc.Component {

    entity: Entity;
    move: MoveComponent;

    onLoad() {

    }

    update(dt: number) {
        this.node.x = this.move.x;
        this.node.y = this.move.y;
        this.node.rotation = this.move.rotation;
    }
}
