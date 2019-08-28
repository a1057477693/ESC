

import MoveComponent from "./MoveComponent";
import {ComponentType, EntityType} from "../ECS/Config";
import {World} from "../ECS/World";
import MoveSystem from "./MoveSystem";
import InputSystem from "./InputSystem";
import SingletonComponent from "./SingletonComponent";

export default class GameService {
    static initWorld() {
        MoveComponent.prototype.type = ComponentType.Move;
        SingletonComponent.prototype.type = ComponentType.Singleton;
    }

    static gameStart() {
        let world = World.getInstance();
        //添加系统
        world.addSystemToCyle(new MoveSystem());
        world.addSystemToCyle(new InputSystem());
        world.fixedUpdateInterval = 1 / 60 * 1000;

        let entity = world.getNewEntity(EntityType.Arrow);
        let move = entity.addCompont(MoveComponent);
        move.moveSpeed = 1;
        move.isMoving = false;

        world.addEntityToWorld(entity);


        world.startCyle();
        setInterval(() => {
            world.cycle();
        }, 1 / 30 * 1000);

    }
}