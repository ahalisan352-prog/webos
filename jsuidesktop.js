class DesktopEnvironment {
    constructor() {
        this.windows = new Map();
        this.nextWindowId = 1;
    }

    async initialize() {
        await this.createDesktop();
        await this.createTaskbar();
        console.log("✅ محیط دسکتاپ initialized");
    }

    async createDesktop() {
        const desktop = document.getElementById('desktop');
        desktop.innerHTML = '';

        desktop.style.background = `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`;

        const icons = [
            { name: 'ترمینال', app: TerminalApp, icon: '💻' }
        ];

        icons.forEach((item, index) => {
            const icon = document.createElement('div');
            icon.className = 'desktop-icon';
            icon.innerHTML = `
                <div class="icon">${item.icon}</div>
                <div class="label">${item.name}</div>
            `;
            icon.style.left = `${20 + index * 100}px`;
            icon.style.top = '20px';
            
            icon.addEventListener('dblclick', () => {
                this.launchApp(item.app);
            });

            desktop.appendChild(icon);
        });
    }

    async createTaskbar() {
        this.taskbar = document.createElement('div');
        this.taskbar.className = 'taskbar';
        this.taskbar.innerHTML = `
            <div class="start-button" id="start-button">
                🚀 WebOS
            </div>
            <div class="running-apps" id="running-apps"></div>
            <div class="system-tray" id="system-tray">
                <span class="time" id="system-time">--:--:--</span>
            </div>
        `;

        document.body.appendChild(this.taskbar);

        this.updateTime();
        setInterval(() => this.updateTime(), 1000);
    }

    updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('fa-IR');
        const timeElement = document.getElementById('system-time');
        if (timeElement) {
            timeElement.textContent = timeString;
        }
    }

    async launchApp(appClass) {
        try {
            console.log(`🚀 راه‌اندازی برنامه: ${appClass.name}`);
            const process = window.WebOS.createProcess(appClass);
            await process.start();
            this.addToTaskbar(process);
        } catch (error) {
            console.error(`❌ خطا در راه‌اندازی برنامه:`, error);
        }
    }

    addToTaskbar(process) {
        const runningApps = document.getElementById('running-apps');
        const appButton = document.createElement('div');
        appButton.className = 'taskbar-app';
        appButton.textContent = process.appClass.name;
        runningApps.appendChild(appButton);
    }
}