#!/usr/bin/env node

/**
 * Audits Supabase RLS policies and table schemas via the Management API.
 * Reads credentials from environment variables or .env.local.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Load env from .env.local if available
function loadEnv() {
  const envPaths = [
    path.join(process.cwd(), 'apps', 'thriving', '.env.local'),
    path.join(process.cwd(), '.env.local'),
  ];
  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      const lines = fs.readFileSync(envPath, 'utf8').split('\n');
      for (const line of lines) {
        const match = line.match(/^([^#=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          const val = match[2].trim().replace(/^["']|["']$/g, '');
          if (!process.env[key]) process.env[key] = val;
        }
      }
    }
  }
}

// Make an HTTPS request to Supabase Management API
function apiRequest(projectId, serviceKey, endpoint) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: `${projectId}.supabase.co`,
      path: `/rest/v1/${endpoint}`,
      method: 'GET',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(data);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

// Query RLS status via pg_tables
async function checkRLS(projectId, serviceKey) {
  const query =
    'rpc/exec_sql?sql=' +
    encodeURIComponent(
      "SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public'"
    );

  console.log('\n=== RLS Status Check ===');
  console.log(
    'Note: Direct SQL via REST requires an exec_sql function.'
  );
  console.log(
    'If this fails, check RLS manually in the Supabase dashboard.'
  );

  try {
    const result = await apiRequest(projectId, serviceKey, query);
    if (Array.isArray(result)) {
      for (const table of result) {
        const status = table.rowsecurity ? 'ENABLED' : 'DISABLED';
        const icon = table.rowsecurity ? '✅' : '❌';
        console.log(`${icon} ${table.tablename}: RLS ${status}`);
      }
    } else {
      console.log('Could not query pg_tables directly.');
      console.log('Response:', JSON.stringify(result).slice(0, 200));
    }
  } catch (err) {
    console.log('API request failed:', err.message);
  }
}

// List all tables via REST
async function listTables(projectId, serviceKey) {
  console.log('\n=== Table Access Check ===');
  console.log(
    'Attempting to list accessible tables via REST API...'
  );

  const tables = [
    'tasks',
    'profiles',
    'pillars',
    'categories',
    'users',
  ];

  for (const table of tables) {
    try {
      const result = await apiRequest(
        projectId,
        serviceKey,
        `${table}?limit=0`
      );
      if (Array.isArray(result)) {
        console.log(`✅ ${table}: accessible`);
      } else if (result.message) {
        console.log(`⚠️  ${table}: ${result.message}`);
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
    }
  }
}

async function main() {
  loadEnv();

  const projectId =
    process.env.SUPABASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_SUPABASE_URL?.match(
      /https:\/\/([^.]+)/
    )?.[1] ||
    'kemmvxnmlmvspfxgfvhl';

  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY;

  if (!serviceKey) {
    console.error(
      'ERROR: No service_role key found in environment.'
    );
    console.error(
      'Set SUPABASE_SERVICE_ROLE_KEY in .env.local'
    );
    process.exit(1);
  }

  console.log('Supabase Security Audit');
  console.log('=======================');
  console.log(`Project: ${projectId}`);

  await checkRLS(projectId, serviceKey);
  await listTables(projectId, serviceKey);

  console.log('\n=== Audit Complete ===');
}

main().catch((err) => {
  console.error('Audit failed:', err.message);
  process.exit(1);
});
