class WebOSBootloader {
    static async boot() {
        console.log("🖥️ شروع فرآیند بوت WebOS...");
        this.showBootScreen();
        
        try {
            await this.loadKernel();
            await this.initializeServices();
            await this.startUserInterface();
            this.hideBootScreen();
            console.log("🎉 WebOS با موفقیت بوت شد!");
        } catch (error) {
            console.error("❌ خطا در فرآیند بوت:", error);
            this.showBootError(error);
        }
    }

    static showBootScreen() {
        const bootScreen = document.getElementById('boot-screen');
        bootScreen.classList.remove('hidden');
        
        const messages = [
            "در حال بارگذاری هسته...",
            "مقداردهی اولیه مدیریت حافظه...", 
            "راه‌اندازی سیستم فایل...",
            "آماده‌سازی رابط کاربری..."
        ];

        let currentMessage = 0;
        const messageElement = bootScreen.querySelector('.boot-message');
        const progressBar = bootScreen.querySelector('.boot-bar');

        const interval = setInterval(() => {
            if (currentMessage < messages.length) {
                messageElement.textContent = messages[currentMessage];
                progressBar.style.width = `${((currentMessage + 1) / messages.length) * 100}%`;
                currentMessage++;
            } else {
                clearInterval(interval);
            }
        }, 800);
    }

    static hideBootScreen() {
        setTimeout(() => {
            const bootScreen = document.getElementById('boot-screen');
            const desktop = document.getElementById('desktop');
            
            bootScreen.classList.add('hidden');
            desktop.classList.remove('hidden');
        }, 1000);
    }

    static async loadKernel() {
        this.updateBootMessage("بارگذاری هسته سیستم...");
        await window.WebOS.initialize();
        this.updateBootMessage("هسته با موفقیت بارگذاری شد");
    }

    static async initializeServices() {
        this.updateBootMessage("راه‌اندازی سرویس‌های سیستم...");
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.updateBootMessage("سرویس‌های سیستم آماده هستند");
    }

    static async startUserInterface() {
        this.updateBootMessage("راه‌اندازی محیط دسکتاپ...");
        window.Desktop = new DesktopEnvironment();
        await window.Desktop.initialize();
        this.updateBootMessage("محیط دسکتاپ آماده است");
    }

    static updateBootMessage(message) {
        const messageElement = document.querySelector('.boot-message');
        if (messageElement) {
            messageElement.textContent = message;
        }
    }

    static showBootError(error) {
        const bootScreen = document.getElementById('boot-screen');
        bootScreen.innerHTML = `
            <div class="boot-error">
                <div class="error-icon">❌</div>
                <h2>خطا در بوت سیستم</h2>
                <p>${error.message}</p>
                <button onclick="location.reload()" class="retry-btn">
                    تلاش مجدد
                </button>
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    WebOSBootloader.boot();
});