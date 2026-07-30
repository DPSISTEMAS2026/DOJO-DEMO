import fs from 'fs';

function printDirs(dir) {
    try {
        if (!fs.existsSync(dir)) {
            console.log(`Directory ${dir} does not exist.`);
            return;
        }
        console.log(`\nFolders in ${dir}:`);
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = dir + '/' + file;
            try {
                const stat = fs.statSync(fullPath);
                if (stat.isDirectory()) {
                    console.log(`  [DIR] ${file}`);
                }
            } catch(e) {}
        }
    } catch(e) {
        console.log(`Error reading ${dir}: ${e.message}`);
    }
}

printDirs('C:/Program Files');
printDirs('C:/Program Files (x86)');
printDirs('C:/Users/ddiaz/AppData/Local');
printDirs('C:/Users/ddiaz/AppData/Local/Programs');
