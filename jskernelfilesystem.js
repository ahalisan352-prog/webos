class VirtualFileSystem {
    constructor() {
        this.files = new Map();
        this.directories = new Map();
        this.nextInode = 1;
    }

    async initialize() {
        const savedFS = localStorage.getItem('webos_filesystem');
        if (savedFS) {
            const data = JSON.parse(savedFS);
            this.files = new Map(data.files || []);
            this.directories = new Map(data.directories || []);
            this.nextInode = data.nextInode || 1;
        } else {
            this.createDirectory('/');
        }
        console.log("✅ سیستم فایل initialized");
    }

    async saveState() {
        const state = {
            files: Array.from(this.files.entries()),
            directories: Array.from(this.directories.entries()),
            nextInode: this.nextInode
        };
        localStorage.setItem('webos_filesystem', JSON.stringify(state));
    }

    generateInode() {
        return this.nextInode++;
    }

    async createDirectory(path) {
        if (this.directories.has(path)) {
            throw new Error(`دایرکتوری ${path} از قبل وجود دارد`);
        }

        const directory = {
            inode: this.generateInode(),
            path: path,
            name: path.split('/').pop() || '/',
            type: 'directory',
            created: Date.now(),
            modified: Date.now(),
            items: new Set()
        };

        this.directories.set(path, directory);
        await this.saveState();
        return directory;
    }

    async writeFile(path, content, options = {}) {
        const existingFile = this.files.get(path);
        
        const file = {
            inode: existingFile ? existingFile.inode : this.generateInode(),
            path: path,
            name: path.split('/').pop(),
            type: 'file',
            content: content,
            size: content.length,
            created: existingFile ? existingFile.created : Date.now(),
            modified: Date.now()
        };

        this.files.set(path, file);
        
        const parentPath = path.substring(0, path.lastIndexOf('/')) || '/';
        const parentDir = this.directories.get(parentPath);
        if (parentDir) {
            parentDir.items.add(path);
            parentDir.modified = Date.now();
        }

        await this.saveState();
        return file;
    }

    async readFile(path) {
        const file = this.files.get(path);
        if (!file) {
            throw new Error(`فایل ${path} یافت نشد`);
        }
        
        file.accessed = Date.now();
        await this.saveState();
        return file.content;
    }

    async listDirectory(path = '/') {
        const directory = this.directories.get(path);
        if (!directory) {
            throw new Error(`دایرکتوری ${path} یافت نشد`);
        }

        const items = [];
        
        for (const itemPath of directory.items) {
            const file = this.files.get(itemPath);
            if (file) {
                items.push(file);
            }
        }

        for (const [dirPath, dir] of this.directories) {
            if (dirPath !== '/' && dirPath.startsWith(path + '/') && 
                dirPath.split('/').length === path.split('/').length + 1) {
                items.push(dir);
            }
        }

        return items;
    }

    async deleteFile(path) {
        const file = this.files.get(path);
        if (!file) {
            throw new Error(`فایل ${path} یافت نشد`);
        }

        const parentPath = path.substring(0, path.lastIndexOf('/')) || '/';
        const parentDir = this.directories.get(parentPath);
        if (parentDir) {
            parentDir.items.delete(path);
            parentDir.modified = Date.now();
        }

        this.files.delete(path);
        await this.saveState();
        return true;
    }

    getStats() {
        return {
            totalFiles: this.files.size,
            totalDirectories: this.directories.size,
            totalSize: Array.from(this.files.values()).reduce((sum, file) => sum + file.size, 0)
        };
    }
}