/**
 * 单例实体的数据构成
 */
import Component from "../ECS/Component";
import {ComponentType} from "../ECS/Config";

export default class SingletonComponent extends Component {
    type: ComponentType = ComponentType.Singleton;

    pressSpace: boolean = false;
}