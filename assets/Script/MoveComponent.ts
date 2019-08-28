/**
 * 移动的数据构成
 */
import Component from "../ECS/Component";
import {ComponentType} from "../ECS/Config";

export default class MoveComponent extends Component {

    type = ComponentType.Move;

    x: number = 0;
    y: number = 0;
    rotation: number = 0;
    moveSpeed: number = 0;
    isMoving: boolean = false;

}
