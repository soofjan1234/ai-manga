import Dexie, { Table } from 'dexie';
import { Character, Episode } from './store';

// 定义数据库结构
// 我们将把 store 中的大对象（图片）拆分出来存储，或者为了简化，直接将整个 store 状态持久化到 IndexedDB
// 考虑到迁移成本，我们将整个 StoryState 迁移到 IndexedDB 可能是最简单的方案，
// 但为了保持同步 API 的便利性（React state），我们最好还是保持 store.tsx 的结构，
// 但在持久化层（useEffect）使用 IndexedDB 替代 localStorage。

// 创建数据库
class MangaDatabase extends Dexie {
    // 存储完整的应用状态快照，或者分表存储
    // 为了解决 QuotaExceededError，主要是图片太大。
    // 我们定义专门的表来存图片，或者直接存整个状态对象（IndexedDB 容量很大，通常 > 1GB）

    // 这里我们选择简单方案：用一个 key-value 形式存整个状态，替代 localStorage
    keyValueStore!: Table<{ key: string; value: any }, string>;

    constructor() {
        super('MangaDatabase');
        this.version(1).stores({
            keyValueStore: 'key' // Primary key
        });
    }
}

export const db = new MangaDatabase();

// 辅助函数：保存状态
export async function saveStateToDB(key: string, state: any) {
    try {
        await db.keyValueStore.put({ key, value: state });
    } catch (error) {
        console.error("IndexedDB save failed:", error);
    }
}

// 辅助函数：加载状态
export async function loadStateFromDB(key: string): Promise<any | null> {
    try {
        const item = await db.keyValueStore.get(key);
        return item?.value || null;
    } catch (error) {
        console.error("IndexedDB load failed:", error);
        return null;
    }
}
