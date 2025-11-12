class TerminalApp {
    constructor() {
        this.name = "ترمینال";
        this.version = "1.0.0";
        this.history = [];
        this.currentDirectory = '/home';
    }

    async main(process, options) {
        this.process = process;
        await this.createUI();
        await this.commandLoop();
        return "ترمینال بسته شد";
    }

    async createUI() {
        const terminalHTML = `
            <div class="terminal-window">
                <div class="terminal-header">
                    <span class="terminal-title">💻 ترمینال WebOS</span>
                </div>
                <div class="terminal-body">
                    <div class="output" id="terminal-output"></div>
                    <div class="input-line">
                        <span class="prompt">user@webos:~$ </span>
                        <input type="text" class="command-input" id="terminal-input">
                    </div>
                </div>
            </div>
        `;

        document.getElementById('desktop').insertAdjacentHTML('beforeend', terminalHTML);
        
        this.outputElement = document.getElementById('terminal-output');
        this.inputElement = document.getElementById('terminal-input');
        
        this.setupEventListeners();
        this.printWelcome();
    }

    setupEventListeners() {
        this.inputElement.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.executeCommand(this.inputElement.value);
                this.inputElement.value = '';
            }
        });
    }

    printWelcome() {
        this.printLine('خوش آمدید به ترمینال WebOS!');
        this.printLine('برای مشاهده دستورات موجود از "help" استفاده کنید');
        this.printLine('');
    }

    printLine(text) {
        const line = document.createElement('div');
        line.className = 'output-line';
        line.textContent = text;
        this.outputElement.appendChild(line);
        this.outputElement.scrollTop = this.outputElement.scrollHeight;
    }

    async executeCommand(command) {
        if (!command.trim()) return;
        
        this.history.push(command);
        this.printLine(`$ ${command}`);
        
        const [cmd, ...args] = command.trim().split(' ');
        
        try {
            const result = await this.handleCommand(cmd, args);
            if (result) {
                this.printLine(result);
            }
        } catch (error) {
            this.printLine(`خطا: ${error.message}`);
        }
        
        this.printLine('');
    }

    async handleCommand(command, args) {
        const commands = {
            'help': () => this.showHelp(),
            'ls': () => this.listFiles(args[0]),
            'pwd': () => this.currentDirectory,
            'echo': () => args.join(' '),
            'clear': () => this.clearScreen(),
            'date': () => new Date().toLocaleString('fa-IR'),
            'whoami': () => 'user',
            
            'cat': () => this.catFile(args[0]),
            'mkdir': () => this.createDirectory(args[0]),
            'touch': () => this.createFile(args[0]),
            'rm': () => this.deleteFile(args[0]),
            
            'ps': () => this.showProcesses(),
            'mem': () => this.showMemory()
        };

        if (commands[command]) {
            return await commands[command]();
        } else {
            return `دستور '${command}' یافت نشد. از 'help' استفاده کنید.`;
        }
    }

    async showHelp() {
        return `
دستورات موجود:

📁 فایل‌سیستم:
  ls [dir]        - نمایش محتوای دایرکتوری
  cat <file>      - نمایش محتوای فایل
  mkdir <dir>     - ایجاد دایرکتوری جدید
  touch <file>    - ایجاد فایل جدید
  rm <file>       - حذف فایل

🔧 سیستم:
  ps             - نمایش فرآیندها
  mem            - وضعیت حافظه
  date           - تاریخ و زمان
  whoami         - کاربر جاری
  clear          - پاک کردن صفحه
  help           - این راهنما
        `.trim();
    }

    async listFiles(path = this.currentDirectory) {
        try {
            const items = await window.WebOS.fileSystem.listDirectory(path);
            if (items.length === 0) {
                return 'دایرکتوری خالی است';
            }
            
            return items.map(item => {
                const icon = item.type === 'directory' ? '📁' : '📄';
                return `${icon} ${item.name}`;
            }).join('\n');
        } catch (error) {
            throw new Error(`خطا در خواندن دایرکتوری: ${error.message}`);
        }
    }

    async catFile(filename) {
        if (!filename) {
            throw new Error('نام فایل باید مشخص شود');
        }
        
        try {
            const content = await window.WebOS.fileSystem.readFile(filename);
            return content;
        } catch (error) {
            throw new Error(`خطا در خواندن فایل: ${error.message}`);
        }
    }

    async createDirectory(dirname) {
        if (!dirname) {
            throw new Error('نام دایرکتوری باید مشخص شود');
        }
        
        try {
            await window.WebOS.fileSystem.createDirectory(dirname);
            return `دایرکتوری '${dirname}' ایجاد شد`;
        } catch (error) {
            throw new Error(`خطا در ایجاد دایرکتوری: ${error.message}`);
        }
    }

    async createFile(filename) {
        if (!filename) {
            throw new Error('نام فایل باید مشخص شود');
        }
        
        try {
            await window.WebOS.fileSystem.writeFile(filename, '');
            return `فایل '${filename}' ایجاد شد`;
        } catch (error) {
            throw new Error(`خطا در ایجاد فایل: ${error.message}`);
        }
    }

    async deleteFile(filename) {
        if (!filename) {
            throw new Error('نام فایل باید مشخص شود');
        }
        
        try {
            await window.WebOS.fileSystem.deleteFile(filename);
            return `فایل '${filename}' حذف شد`;
        } catch (error) {
            throw new Error(`خطا در حذف فایل: ${error.message}`);
        }
    }

    async showProcesses() {
        const info = window.WebOS.getSystemInfo();
        return `
فرآیندهای فعال: ${info.processes}
حافظه استفاده شده: ${info.memory.used} bytes
حافظه آزاد: ${info.memory.free} bytes
        `.trim();
    }

    async showMemory() {
        const memory = window.WebOS.memoryManager.getStats();
        return `
وضعیت حافظه:
  کل حافظه: ${memory.total} bytes
  استفاده شده: ${memory.used} bytes
  آزاد: ${memory.free} bytes
        `.trim();
    }

    clearScreen() {
        this.outputElement.innerHTML = '';
        this.printWelcome();
        return '';
    }

    async commandLoop() {
        return new Promise((resolve) => {
            this.resolveCommandLoop = resolve;
        });
    }
}