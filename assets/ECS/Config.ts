export enum ComponentType {
    Singleton = 1 << 0,
    Move = 1 << 1,
}

export enum EntityType {
    Singleton, //单例实体
    Arrow,
}

export enum SystemType {
    NetWork,
    Input,
    LogicBeforePhysics,
    Physics,
    LogicAfterPhysics,
    AfterLogicCycle,
    Backup,
    Render,
    AfterCycle,
    END,
}
