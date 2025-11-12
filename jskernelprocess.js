class WebProcess {
    constructor(pid, appClass, options = {}) {
        this.pid = pid;
        this.appClass = appClass;
        this.options = options;
        this.state = 'created';
        this.memoryBlocks = [];
        this.startTime = null;
        this.endTime = null;
        this.appInstance = null;
    }

    async start() {
        if (this.state !== 'created') {
            throw new Error("فرآیند قبلاً اجرا شده است");
        }

        this.state = 'running';
        this.startTime = Date.now();
        
        console.log(`▶️ شروع فرآیند ${this.pid}`);

        try {
            this.appInstance = new this.appClass();
            const result = await this.appInstance.main(this, this.options);
            
            this.state = 'terminated';
            this.endTime = Date.now();
            
            console.log(`✅ فرآیند ${this.pid} با موفقیت پایان یافت`);
            return result;
            
        } catch (error) {
            this.state = 'terminated';
            this.endTime = Date.now();
            console.error(`❌ خطا در فرآیند ${this.pid}:`, error);
            throw error;
        }
    }

    terminate() {
        this.state = 'terminated';
        this.endTime = Date.now();
        
        if (window.WebOS.memoryManager) {
            window.WebOS.memoryManager.cleanupProcessMemory(this.pid);
        }
        
        console.log(`⏹️ فرآیند ${this.pid} terminated`);
    }
}