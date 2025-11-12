class WebOSKernel {
    constructor() {
        this.version = "1.0.0";
        this.processes = new Map();
        this.services = new Map();
        this.fileSystem = null;
        this.memoryManager = null;
        this.nextPID = 1;
        this.systemReady = false;
    }

    async initialize() {
        console.log("🚀 شروع بارگذاری هسته WebOS...");
        
        await this.initializeMemory();
        await this.initializeFileSystem();
        
        this.systemReady = true;
        console.log("✅ هسته سیستم عامل آماده است");
    }

    async initializeMemory() {
        this.memoryManager = new MemoryManager();
        await this.memoryManager.initialize();
        console.log("✅ مدیریت حافظه initialized");
    }

    async initializeFileSystem() {
        this.fileSystem = new VirtualFileSystem();
        await this.fileSystem.initialize();
        
        await this.createDefaultFileStructure();
        console.log("✅ سیستم فایل initialized");
    }

    async createDefaultFileStructure() {
        const directories = ['/home', '/etc', '/bin', '/var', '/tmp'];
        for (const dir of directories) {
            await this.fileSystem.createDirectory(dir);
        }
        
        await this.fileSystem.writeFile('/etc/version', this.version);
        await this.fileSystem.writeFile('/etc/motd', 'خوش آمدید به WebOS!');
    }

    createProcess(appClass, options = {}) {
        if (!this.systemReady) {
            throw new Error("سیستم عامل هنوز آماده نیست");
        }

        const pid = this.nextPID++;
        const process = new WebProcess(pid, appClass, options);
        
        this.processes.set(pid, process);
        console.log(`🔄 فرآیند جدید ایجاد شد: PID ${pid}`);
        
        return process;
    }

    getSystemInfo() {
        return {
            version: this.version,
            processes: this.processes.size,
            memory: this.memoryManager ? this.memoryManager.getStats() : null,
            storage: this.fileSystem ? this.fileSystem.getStats() : null
        };
    }

    async shutdown() {
        console.log("🔄 خاموش کردن سیستم...");
        
        for (const [pid, process] of this.processes) {
            process.terminate();
        }
        this.processes.clear();
        
        console.log("✅ سیستم خاموش شد");
    }
}

window.WebOS = new WebOSKernel();