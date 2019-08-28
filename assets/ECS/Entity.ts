import Component from "./Component";
import {convertComponentTypeIdToIndex, isContainSubBit} from "./Utils";
import {World} from "./World";
import {EntityType} from "./Config";


export class Entity {


    compontBits: number = 0;

    componts: Component[] = [];

    id: number = 0;

    type: EntityType = 0;

    componentsDirty: boolean = false;  //标记当前component是否是脏的

    oldBits: number = 0;

    addCompont<T extends Component>(type: { new(): T }): T {
        let compn = new type();

        this.componts[convertComponentTypeIdToIndex(compn.type)] = compn;

        this.compontBits |= compn.type;

        return compn;
    }

    getCompont<T extends Component>(type: { prototype: T }): T {
        return this.componts[convertComponentTypeIdToIndex(type.prototype.type)] as T;
    }

    hasComponent<T extends Component>(type: { prototype: T }): boolean {
        return (this.compontBits & type.prototype.type) != 0;
    }

    hasComponentBits(bits: number) {
        return isContainSubBit(bits, this.compontBits);
    }

    getCompontsByIndex(indexs: number[]): Component[] {
        let compnArr: Component[] = [];
        for (let i = 0; i < indexs.length; i++) {
            let index = indexs[i];
            compnArr.push(this.componts[index]);
        }
        return compnArr;
    }

    /**
     * 脏标记
     * @param {number} oldBits
     */
    markComponentDirty(oldBits: number) {
        if (!this.componentsDirty) {
            this.oldBits = oldBits;

            World.getInstance().notifyEntityComponentsDirty(this);
            this.componentsDirty = true;
        }

    }

    /**
     * 取消标记
     */
    cancleDirty() {
        this.componentsDirty = false;
    }

}