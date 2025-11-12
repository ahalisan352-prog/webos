class MemoryManager {
    constructor() {
        this.memoryBlocks = new Map();
        this.nextBlockId = 1;
        this.totalMemory = 1024 * 1024 * 10;
        this.usedMemory = 0;
    }

    async initialize() {
        if (!localStorage.getItem('webos_memory')) {
            localStorage.setItem('webos_memory', JSON.stringify({}));
        }
        console.log("✅ مدیریت حافظه initialized");
    }

    allocate(size, processId, description = '') {
        if (this.usedMemory + size > this.totalMemory) {
            throw new Error("حافظه کافی نیست");
        }

        const blockId = this.nextBlockId++;
        const block = {
            id: blockId,
            size: size,
            processId: processId,
            description: description,
            data: null,
            createdAt: Date.now()
        };

        this.memoryBlocks.set(blockId, block);
        this.usedMemory += size;
        return blockId;
    }

    deallocate(blockId) {
        const block = this.memoryBlocks.get(blockId);
        if (block) {
            this.usedMemory -= block.size;
            this.memoryBlocks.delete(blockId);
            return true;
        }
        return false;
    }

    getStats() {
        return {
            total: this.totalMemory,
            used: this.usedMemory,
            free: this.totalMemory - this.usedMemory,
            blocks: this.memoryBlocks.size
        };
    }

    cleanupProcessMemory(processId) {
        let freed = 0;
        for (const [blockId, block] of this.memoryBlocks) {
            if (block.processId === processId) {
                this.usedMemory -= block.size;
                this.memoryBlocks.delete(blockId);
                freed += block.size;
            }
        }
        return freed;
    }
}