import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const schemaDir = join('src', 'db', 'schema');
const files = readdirSync(schemaDir).filter(f => f.endsWith('.ts') && f !== 'index.ts' && f !== 'enums.ts');

for (const file of files) {
  const filePath = join(schemaDir, file);
  let content = readFileSync(filePath, 'utf8');

  // Check if it imports sql from pg-core
  if (content.includes("sql") && content.includes("'drizzle-orm/pg-core'")) {
    // 1. Remove sql from pg-core import block
    // It might be on the same line or in a multiline import
    content = content.replace(/,\s*sql\s*}/, '}');
    content = content.replace(/{\s*sql\s*,/, '{');
    content = content.replace(/,\s*sql\s*,/, ',');
    content = content.replace(/sql\s*,/, ''); // if it was somehow first
    
    // 2. Add import { sql } from 'drizzle-orm'; at the very top
    if (!content.includes("import { sql } from 'drizzle-orm';")) {
      content = `import { sql } from 'drizzle-orm';\n` + content;
    }
    
    writeFileSync(filePath, content);
    console.log(`✅ Fixed imports in ${file}`);
  }
}
