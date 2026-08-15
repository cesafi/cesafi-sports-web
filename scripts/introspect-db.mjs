/**
 * Custom DB introspect script for CESAFI Sports Web
 * Uses postgres.js directly to bypass drizzle-kit's buggy introspection
 * Generates Drizzle schema files from the live Supabase DB
 */

import { config } from 'dotenv';
import postgres from 'postgres';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { ssl: 'require', max: 5 });

async function introspect() {
  console.log('🔍 Connecting to database...');

  // Get all tables in public schema
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `;

  console.log(`📋 Found ${tables.length} tables:`, tables.map(t => t.table_name).join(', '));

  // Get all columns
  const columns = await sql`
    SELECT 
      c.table_name,
      c.column_name,
      c.data_type,
      c.udt_name,
      c.is_nullable,
      c.column_default,
      c.character_maximum_length,
      c.ordinal_position,
      c.is_identity,
      c.identity_generation
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
    ORDER BY c.table_name, c.ordinal_position;
  `;

  // Get primary keys
  const primaryKeys = await sql`
    SELECT
      kcu.table_name,
      kcu.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
      ON tc.constraint_name = kcu.constraint_name
      AND tc.constraint_schema = kcu.constraint_schema
    WHERE tc.constraint_type = 'PRIMARY KEY'
    AND tc.constraint_schema = 'public';
  `;

  // Get foreign keys
  const foreignKeys = await sql`
    SELECT
      kcu.table_name,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name,
      tc.constraint_name,
      rc.delete_rule,
      rc.update_rule
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.constraint_schema = kcu.constraint_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.constraint_schema = tc.constraint_schema
    JOIN information_schema.referential_constraints rc
      ON rc.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.constraint_schema = 'public';
  `;

  // Get enums
  const enums = await sql`
    SELECT 
      t.typname AS enum_name,
      e.enumlabel AS enum_value
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
    ORDER BY t.typname, e.enumsortorder;
  `;

  await sql.end();

  // Build column map by table
  const colsByTable = {};
  for (const col of columns) {
    if (!colsByTable[col.table_name]) colsByTable[col.table_name] = [];
    colsByTable[col.table_name].push(col);
  }

  // Build PK set
  const pkSet = new Set(primaryKeys.map(pk => `${pk.table_name}.${pk.column_name}`));

  // Build FK map: table.column -> { foreignTable, foreignColumn }
  const fkMap = {};
  for (const fk of foreignKeys) {
    fkMap[`${fk.table_name}.${fk.column_name}`] = {
      foreignTable: fk.foreign_table_name,
      foreignColumn: fk.foreign_column_name,
      constraintName: fk.constraint_name,
      onDelete: fk.delete_rule,
      onUpdate: fk.update_rule
    };
  }

  // Build enum map
  const enumMap = {};
  for (const e of enums) {
    if (!enumMap[e.enum_name]) enumMap[e.enum_name] = [];
    enumMap[e.enum_name].push(e.enum_value);
  }

  console.log(`\n🎯 Generating Drizzle schema...\n`);

  const outputDir = './src/db/schema';
  mkdirSync(outputDir, { recursive: true });

  // Generate enum file first
  let enumFileContent = `import { pgEnum } from 'drizzle-orm/pg-core';\n\n`;
  const enumExports = [];
  for (const [enumName, values] of Object.entries(enumMap)) {
    const camelName = snakeToCamel(enumName) + 'Enum';
    enumExports.push(camelName);
    const valuesStr = values.map(v => `'${v}'`).join(', ');
    enumFileContent += `export const ${camelName} = pgEnum('${enumName}', [${valuesStr}]);\n`;
  }
  writeFileSync(join(outputDir, 'enums.ts'), enumFileContent);
  console.log(`✅ Generated enums.ts with ${Object.keys(enumMap).length} enums`);

  const tableFiles = [];

  // Generate one file per table
  for (const table of tables) {
    const tableName = table.table_name;
    const cols = colsByTable[tableName] || [];
    const camelTableName = snakeToCamel(tableName);
    
    const imports = new Set(['pgTable']);
    const enumImports = [];
    const columnDefs = [];

    for (const col of cols) {
      const isPK = pkSet.has(`${tableName}.${col.column_name}`);
      const fk = fkMap[`${tableName}.${col.column_name}`];
      const colDef = buildColumnDef(col, isPK, fk, imports, enumMap, enumImports);
      columnDefs.push(`  ${col.column_name}: ${colDef}`);
    }

    const importsArr = Array.from(imports);
    let fileContent = `import { ${importsArr.join(', ')} } from 'drizzle-orm/pg-core';\n`;
    
    if (enumImports.length > 0) {
      const uniqueEnumImports = [...new Set(enumImports)];
      fileContent += `import { ${uniqueEnumImports.join(', ')} } from './enums';\n`;
    }
    
    fileContent += `\nexport const ${camelTableName} = pgTable('${tableName}', {\n`;
    fileContent += columnDefs.join(',\n');
    fileContent += '\n});\n\n';
    fileContent += `export type ${capitalize(camelTableName)} = typeof ${camelTableName}.$inferSelect;\n`;
    fileContent += `export type New${capitalize(camelTableName)} = typeof ${camelTableName}.$inferInsert;\n`;

    const fileName = `${tableName.replace(/_/g, '-')}.ts`;
    writeFileSync(join(outputDir, fileName), fileContent);
    tableFiles.push({ tableName, camelTableName, fileName });
    console.log(`✅ Generated ${fileName}`);
  }

  // Generate index.ts
  let indexContent = `// Auto-generated Drizzle schema index\n// Generated from live database introspection\n\n`;
  indexContent += `export * from './enums';\n`;
  for (const { fileName, camelTableName, tableName } of tableFiles) {
    const moduleName = fileName.replace('.ts', '');
    indexContent += `export * from './${moduleName}';\n`;
  }
  writeFileSync(join(outputDir, 'index.ts'), indexContent);
  console.log(`\n✅ Generated index.ts with ${tableFiles.length} tables`);
  console.log('\n🎉 Schema generation complete!');
}

function buildColumnDef(col, isPK, fk, imports, enumMap, enumImports) {
  const { column_name, data_type, udt_name, is_nullable, column_default, is_identity } = col;
  const isNull = is_nullable === 'YES';
  const isIdentityCol = is_identity === 'YES';

  let drizzleType = '';
  let chainMethods = '';

  // Map data types
  switch (data_type) {
    case 'uuid':
      imports.add('uuid');
      drizzleType = `uuid('${column_name}')`;
      break;
    case 'text':
    case 'character varying':
    case 'varchar':
      imports.add('text');
      drizzleType = `text('${column_name}')`;
      break;
    case 'integer':
    case 'int4':
    case 'int':
      if (isIdentityCol) {
        imports.add('serial');
        drizzleType = `serial('${column_name}')`;
      } else {
        imports.add('integer');
        drizzleType = `integer('${column_name}')`;
      }
      break;
    case 'bigint':
    case 'int8':
      imports.add('bigint');
      drizzleType = `bigint('${column_name}', { mode: 'number' })`;
      break;
    case 'boolean':
    case 'bool':
      imports.add('boolean');
      drizzleType = `boolean('${column_name}')`;
      break;
    case 'timestamp with time zone':
    case 'timestamptz':
      imports.add('timestamp');
      drizzleType = `timestamp('${column_name}', { withTimezone: true, mode: 'string' })`;
      break;
    case 'timestamp without time zone':
    case 'timestamp':
      imports.add('timestamp');
      drizzleType = `timestamp('${column_name}', { mode: 'string' })`;
      break;
    case 'date':
      imports.add('date');
      drizzleType = `date('${column_name}')`;
      break;
    case 'numeric':
    case 'decimal':
      imports.add('numeric');
      drizzleType = `numeric('${column_name}')`;
      break;
    case 'real':
    case 'float4':
      imports.add('real');
      drizzleType = `real('${column_name}')`;
      break;
    case 'double precision':
    case 'float8':
      imports.add('doublePrecision');
      drizzleType = `doublePrecision('${column_name}')`;
      break;
    case 'jsonb':
      imports.add('jsonb');
      drizzleType = `jsonb('${column_name}')`;
      break;
    case 'json':
      imports.add('json');
      drizzleType = `json('${column_name}')`;
      break;
    case 'ARRAY':
      imports.add('text');
      drizzleType = `text('${column_name}').array()`;
      break;
    case 'USER-DEFINED':
      // Check if it's an enum
      if (enumMap[udt_name]) {
        const camelEnum = snakeToCamel(udt_name) + 'Enum';
        enumImports.push(camelEnum);
        drizzleType = `${camelEnum}('${column_name}')`;
      } else {
        imports.add('text');
        drizzleType = `text('${column_name}') /* USER-DEFINED: ${udt_name} */`;
      }
      break;
    default:
      imports.add('text');
      drizzleType = `text('${column_name}') /* ${data_type} */`;
  }

  // PK
  if (isPK) {
    if (isIdentityCol || data_type === 'integer' || data_type === 'int4') {
      chainMethods += '.primaryKey()';
    } else {
      chainMethods += '.primaryKey()';
    }
  }

  // Default values
  if (column_default) {
    if (column_default === 'now()' || column_default === 'CURRENT_TIMESTAMP') {
      imports.add('sql');
      chainMethods += '.defaultNow()';
    } else if (column_default === 'gen_random_uuid()') {
      imports.add('sql');
      chainMethods += `.default(sql\`gen_random_uuid()\`)`;
    } else if (column_default === 'true') {
      chainMethods += '.default(true)';
    } else if (column_default === 'false') {
      chainMethods += '.default(false)';
    } else if (!isNaN(Number(column_default))) {
      chainMethods += `.default(${column_default})`;
    } else if (column_default.startsWith("'") && column_default.endsWith("'::text")) {
      const val = column_default.replace(/^'/, '').replace(/'::text$/, '');
      chainMethods += `.default('${val}')`;
    } else if (column_default.includes("'::")) {
      const val = column_default.replace(/^'/, '').replace(/'::.*$/, '');
      chainMethods += `.default('${val}')`;
    }
  }

  // Nullable
  if (!isNull && !isPK && !isIdentityCol && !column_default?.includes('gen_random_uuid')) {
    chainMethods += '.notNull()';
  }

  return drizzleType + chainMethods;
}

function snakeToCamel(str) {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

introspect().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
