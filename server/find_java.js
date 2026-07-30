import fs from 'fs';
import path from 'path';

function findFile(dir, fileName) {
    try {
        if (!fs.existsSync(dir)) return null;
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            let stat;
            try {
                stat = fs.statSync(fullPath);
            } catch (e) {
                continue;
            }
            if (stat.isDirectory()) {
                if (file.toLowerCase() === 'node_modules' || file.toLowerCase() === '.git') continue;
                const found = findFile(fullPath, fileName);
                if (found) return found;
            } else if (file.toLowerCase() === fileName.toLowerCase()) {
                return fullPath;
            }
        }
    } catch (e) {}
    return null;
}

const pathsToSearch = [
    'C:/Program Files/Oracle',
    'C:/Program Files/Java',
    'D:/',
    'E:/'
];

console.log("Searching for java.exe...");
for (const p of pathsToSearch) {
    console.log(`Checking ${p}...`);
    // limit D:/ and E:/ search depth to avoid hanging
    if (p === 'D:/' || p === 'E:/') {
        // Just search common folders on D and E
        const subdirs = ['Program Files', 'Program Files (x86)', 'Android', 'Android Studio', 'Java', 'jdk', 'jre'];
        for (const sd of subdirs) {
            const fullP = path.join(p, sd);
            if (fs.existsSync(fullP)) {
                console.log(`Checking subpath ${fullP}...`);
                const found = findFile(fullP, 'java.exe');
                if (found) {
                    console.log(`🎉 Found at: ${found}`);
                    process.exit(0);
                }
            }
        }
    } else {
        const found = findFile(p, 'java.exe');
        if (found) {
            console.log(`🎉 Found at: ${found}`);
            process.exit(0);
        }
    }
}
console.log("Not found.");
