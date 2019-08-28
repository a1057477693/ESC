/**
 * 输入系统
 */
import {World} from "../ECS/World";
import {SystemType} from "../ECS/Config";
import {System} from "../ECS/System";
import SingletonComponent from "./SingletonComponent";
import MoveComponent from "./MoveComponent";
import {Entity} from "../ECS/Entity";

export default class InputSystem implements System {

    world: World;

    type: SystemType = SystemType.Input;

    onUpdate() {
        let singLeton = this.world.getSingletonEntityComponent(SingletonComponent);
        if (singLeton.pressSpace) {
            this.world.forEach([MoveComponent], ((entity: Entity, move: MoveComponent) => {
                 move.isMoving=!move.isMoving;
            }));
            singLeton.pressSpace=false;

        }
    }
}