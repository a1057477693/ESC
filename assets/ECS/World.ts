/**
 * ECS的入口
 */
import Component from "./Component";
import {Entity} from "./Entity";
import {convertComponentTypeIdToIndex, getCompontsProtoBits, isContainSubBit} from "./Utils";
import {System} from "./System";
import {EntityType, SystemType} from "./Config";

export class World {
    private static _instance: World = null;

    static getInstance(): World {
        if (!World._instance) {
            World._instance = new World();
        }
        return World._instance;
    }

    private allEntitys: Entity[] = [];
    private entityByForEach: Map<number, Set<Entity>> = new Map<number, Set<Entity>>();
    useEntityId: number = 0;
    private systemInCyle: System[][] = [];
    newEntitiesInThisCyle: Entity[] = [];  //这一帧新创建的Entity;

    private entitiesCommponentsDirtyInThisCyle: Entity[] = [];//存放标记脏的Entity

    singletonEntity: Entity = null;

    lastLogicRemainTime: number = 0; //上一个逻辑的剩余时间
    lastFrameUTC: number = 0;//上一帧的时间

    fixedUpdateInterval: number = 0;//每一逻辑帧的时间间隔

    framDt: number = 0;//渲染的时间间隔

    logicCycleCount: number = 0;//逻辑循环次数

    cycleCount: number = 0;//大循环次数

    worldInCyle: boolean = false;//标记系统在不在循环中


    forEach(types: { prototype: Component }[], fn: (entity: Entity, ...components: Component[]) => void): void {
        let bits = getCompontsProtoBits(types);

        let entitys = this.entityByForEach.get(bits);

        if (!entitys) {
            entitys = this.onRegistNewForeach(bits);
        }

        let positions: number[] = [];

        for (let i = 0; i < types.length; i++) {

            let type = types[i];
            positions.push(convertComponentTypeIdToIndex(type.prototype.type));
        }

        entitys.forEach(function (e: Entity) {
            fn(e, ...e.getCompontsByIndex(positions));
        });

    }

    private onRegistNewForeach(bits: number): Set<Entity> {

        let entitys = new Set<Entity>();

        for (let i = 0; i < this.allEntitys.length; i++) {

            let entity = this.allEntitys[i];
            if (entity.hasComponentBits(bits)) {
                entitys.add(entity);
            }

        }
        this.entityByForEach.set(bits, entitys);
        return entitys;

    }

    addEntityToWorld(entity: Entity): void {
        this.useEntityId++;
        entity.id = this.useEntityId;
        this.allEntitys.push(entity);
        this.newEntitiesInThisCyle.push(entity);

    }

    getNewEntity(entityType: EntityType): Entity {
        let entity = new Entity()
        entity.type = entityType;
        return entity;
    }

    /**
     * 启动Cyle
     */
    startCyle() {
        this.lastFrameUTC = new Date().getTime();
        this.worldInCyle = true;
        this.cycleCount = 0;
        this.logicCycleCount = 0;
    }

    /**
     * 获取单例实体
     * @returns {Entity}
     */
    getSingletonEntity(): Entity {
        if (!this.singletonEntity) {
            this.singletonEntity = this.getNewEntity(EntityType.Singleton);
            this.addEntityToWorld(this.singletonEntity);
        }
        return this.singletonEntity;
    }
    /**
     * 获取单例实体的Component
     * @returns {Entity}
     */
    getSingletonEntityComponent<T extends Component>(type:{prototype:T,new():T}):T{

            let entity=this.getSingletonEntity();
            if(!entity.hasComponent<T>(type)){
                entity.addCompont<T>(type);
            }
            return entity.getCompont<T>(type);
    }

    addSystemToCyle(system: System): void {
        system.world = this;

        if (!this.systemInCyle[system.type]) {
            this.systemInCyle[system.type] = [];
        }
        this.systemInCyle[system.type].push(system);
    }

    cycle(): void {
        let currentUTC = new Date().getTime();

        let framTotalTime = this.getThisFrameTime(currentUTC);
        // 需要执行的逻辑帧次数
        let logicUpdateCount = Math.floor(framTotalTime / this.fixedUpdateInterval);

        //渲染的时间间隔
        this.framDt = currentUTC - this.lastFrameUTC;
        this.lastFrameUTC = currentUTC;
        this.lastLogicRemainTime = framTotalTime - (logicUpdateCount * this.fixedUpdateInterval);

        for (let i = SystemType.NetWork; i < SystemType.LogicBeforePhysics; i++) {
            let systems = this.systemInCyle[i];
            if (!systems) {
                continue;
            }
            for (let j = 0; j < systems.length; j++) {
                let system = systems[j];
                system.onUpdate();
                //每次update，都去更新下Entitis的数据
                this.updateEntitiesByForEach();
            }
        }

        for (let i = 0; i < logicUpdateCount; i++) {
            for (let j = SystemType.LogicBeforePhysics; j < SystemType.Render; j++) {
                let systems = this.systemInCyle[j];
                if (!systems) {
                    continue;
                }
                for (let k = 0; k < systems.length; k++) {
                    let system = systems[k];
                    system.onUpdate();
                    //每次update，都去更新下Entitis的数据
                    this.updateEntitiesByForEach();
                }
            }
        }

        for (let i = SystemType.Render; i < SystemType.END; i++) {
            let systems = this.systemInCyle[i];
            if (!systems) {
                continue;
            }
            for (let j = 0; j < systems.length; j++) {
                let system = systems[j];
                system.onUpdate();
                //每次update，都去更新下Entitis的数据
                this.updateEntitiesByForEach();
            }
        }
        this.updateNewEntitiesByForEach();
        //逻辑循环次数，大循环的次数
        this.logicCycleCount += logicUpdateCount;
        this.cycleCount++;
    }

    /**
     *获取这一帧需要处理的时间差
     */
    getThisFrameTime(currentTime: number): number {
        return this.lastLogicRemainTime + currentTime - this.lastFrameUTC;
    }

    updateEntitiesByForEach() {

        for (let i = 0; i < this.entitiesCommponentsDirtyInThisCyle.length; i++) {

            let entity = this.entitiesCommponentsDirtyInThisCyle[i];
            let oldBits = entity.oldBits;
            let newBits = entity.compontBits;


            this.entityByForEach.forEach((set: Set<Entity>, systemBits: number, map: Map<number, Set<Entity>>) => {
                let containOldBits = isContainSubBit(systemBits, oldBits);
                let containNewBits = isContainSubBit(systemBits, newBits);

                //保证set永远是最新的
                if (containOldBits && !containNewBits) {
                    set.delete(entity);
                } else if (!containOldBits && containNewBits) {
                    set.add(entity);
                }
            });
            entity.cancleDirty();
        }
        this.entitiesCommponentsDirtyInThisCyle.length = 0;
    }

    updateNewEntitiesByForEach() {
        for (let i = 0; i < this.newEntitiesInThisCyle.length; i++) {

            let entity = this.newEntitiesInThisCyle[i];
            let newBits = entity.compontBits;

            this.entityByForEach.forEach((set: Set<Entity>, systemBits: number, map: Map<number, Set<Entity>>) => {
                let containNewBits = isContainSubBit(systemBits, newBits);

                //保证set永远是最新的
                if (containNewBits) {
                    set.add(entity);
                }
            });
        }
        this.newEntitiesInThisCyle.length = 0;

    }

    notifyEntityComponentsDirty(entity: Entity) {
        this.entitiesCommponentsDirtyInThisCyle.push(entity);
    }


}