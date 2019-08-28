/**
 * 移动系统
 */
import {System} from "../ECS/System";
import {World} from "../ECS/World";
import {SystemType} from "../ECS/Config";
import MoveComponent from "./MoveComponent";
import {Entity} from "../ECS/Entity";

export default class MoveSystem implements System {

    world: World;

    type: SystemType = SystemType.Physics;

    onUpdate() {
        this.world.forEach([MoveComponent], (entity: Entity, move: MoveComponent) => {
            if (move.isMoving) {
                let dir = cc.v2(Math.cos(cc.misc.degreesToRadians(-move.rotation)));
                move.x += move.moveSpeed * dir.x;
                move.y += move.moveSpeed * dir.y;
            }else{
                move.rotation++;
            }
        });
    }
}