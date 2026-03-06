import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function getAllFiles(dir: string, ext: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    if (entry === 'node_modules' || entry === '.next') continue;
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      files.push(...getAllFiles(fullPath, ext));
    } else if (fullPath.endsWith(ext)) {
      files.push(fullPath);
    }
  }
  return files;
}

const srcDir = join(process.cwd(), 'src');

describe('Security Audit', () => {
  it('no NEXT_PUBLIC_ prefix on server secrets', () => {
    const envExample = join(process.cwd(), '.env.example');
    try {
      const content = readFileSync(envExample, 'utf-8');
      const serverSecrets = ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'ANTHROPIC_API_KEY', 'SUPABASE_SERVICE_ROLE_KEY'];
      for (const secret of serverSecrets) {
        expect(content).not.toContain(`NEXT_PUBLIC_${secret}`);
      }
    } catch {
      // .env.example may not exist — that's fine
    }

    // Also check all TS/TSX files don't reference NEXT_PUBLIC_ versions of secrets
    const tsFiles = getAllFiles(srcDir, '.ts').concat(getAllFiles(srcDir, '.tsx'));
    const secretPatterns = [
      'NEXT_PUBLIC_STRIPE_SECRET_KEY',
      'NEXT_PUBLIC_STRIPE_WEBHOOK_SECRET',
      'NEXT_PUBLIC_ANTHROPIC_API_KEY',
      'NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY',
    ];
    for (const file of tsFiles) {
      const content = readFileSync(file, 'utf-8');
      for (const pattern of secretPatterns) {
        expect(content, `${file} should not contain ${pattern}`).not.toContain(pattern);
      }
    }
  });

  it('all API routes call getUser() not getSession()', () => {
    const apiDir = join(srcDir, 'app', 'api');
    const routeFiles = getAllFiles(apiDir, '.ts');

    for (const file of routeFiles) {
      const content = readFileSync(file, 'utf-8');
      // Skip webhook route — it doesn't need user auth (uses signature verification)
      if (file.includes('webhook')) continue;
      // Skip auth callback — it exchanges codes, not checking auth
      if (file.includes('callback')) continue;
      // If the route does auth at all, it should use getUser(), not getSession()
      if (content.includes('supabase.auth')) {
        expect(content, `${file} should use getUser() not getSession()`).toContain('getUser');
        expect(content, `${file} should not use getSession()`).not.toMatch(
          /supabase\.auth\.getSession\(\)/,
        );
      }
    }
  });

  it('all API routes have Zod validation', () => {
    const apiDir = join(srcDir, 'app', 'api');
    const routeFiles = getAllFiles(apiDir, '.ts').filter(
      (f) => f.endsWith('route.ts'),
    );

    for (const file of routeFiles) {
      const content = readFileSync(file, 'utf-8');
      // Webhook route uses signature verification instead of Zod
      if (file.includes('webhook')) continue;
      // Auth callback route doesn't take user input
      if (file.includes('callback')) continue;
      // Routes that accept POST requests should validate with Zod
      if (content.includes('export async function POST')) {
        expect(content, `${file} should import zod`).toContain("from 'zod'");
        expect(content, `${file} should use safeParse`).toContain('safeParse');
      }
    }
  });

  it('error responses do not contain stack traces', () => {
    const apiDir = join(srcDir, 'app', 'api');
    const routeFiles = getAllFiles(apiDir, '.ts');

    for (const file of routeFiles) {
      const content = readFileSync(file, 'utf-8');
      // Should not expose error.stack in responses
      expect(content, `${file} should not expose error.stack in responses`).not.toMatch(
        /error\.stack/,
      );
    }
  });

  it('sanitizeInput is called on user text before Claude calls', () => {
    const councilRoute = readFileSync(join(srcDir, 'app', 'api', 'council', 'route.ts'), 'utf-8');
    expect(councilRoute).toContain('sanitizeInput');
  });
});
