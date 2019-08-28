/**
 * 渲染系统
 */
import {System} from "../ECS/System";
import {World} from "../ECS/World";
import {EntityType, SystemType} from "../ECS/Config";
import Arrow from "./Arrow";
import MoveComponent from "./MoveComponent";

const {ccclass, property} = cc._decorator;

@ccclass
export default class RenderSystem extends cc.Component implements System {

    world: World;

    type: SystemType = SystemType.Render;

    @property(cc.Prefab)
    prefabArrow: cc.Prefab = null;

    onLoad() {
        World.getInstance().addSystemToCyle(this);
    }

    onUpdate() {

        let entites = this.world.newEntitiesInThisCyle;
        for (let i = 0; i < entites.length; i++) {
            let entity = entites[i];

            if(entity.type==EntityType.Arrow){
                let arrow = cc.instantiate(this.prefabArrow).getComponent("Arrow") as Arrow;
                arrow.entity = entity;
                arrow.move = entity.getCompont(MoveComponent);
                arrow.node.parent=this.node;
            }
        }
    }

}
