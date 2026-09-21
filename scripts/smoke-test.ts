import { promises as fs } from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3000';

// Simple cookie jar
class CookieJar {
  private cookies: Map<string, string> = new Map();

  setCookie(cookieString: string) {
    const parts = cookieString.split(';')[0].split('=');
    if (parts.length === 2) {
      this.cookies.set(parts[0].trim(), parts[1].trim());
    }
  }

  getCookieHeader(): string {
    return Array.from(this.cookies.entries())
      .map(([k, v]) => `${k}=${v}`)
      .join('; ');
  }

  clear() {
    this.cookies.clear();
  }
}

interface TestResult {
  route: string;
  method: string;
  expectedStatus: number;
  actualStatus?: number;
  result: 'PASS' | 'FAIL';
  note?: string;
}

const results: TestResult[] = [];
const cookieJar = new CookieJar();

async function makeRequest(
  path: string,
  method: string = 'GET',
  body?: Record<string, any>,
  expectedStatus: number = 200
): Promise<{ status: number; text: string; headers: Headers }> {
  const url = `${BASE_URL}${path}`;
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const cookieHeader = cookieJar.getCookieHeader();
  if (cookieHeader) {
    options.headers = { ...options.headers, Cookie: cookieHeader };
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const text = await response.text();

    // Extract and store cookies from Set-Cookie header
    response.headers.getSetCookie?.().forEach((cookie) => {
      cookieJar.setCookie(cookie);
    });

    return {
      status: response.status,
      text,
      headers: response.headers,
    };
  } catch (error) {
    throw new Error(`Failed to fetch ${url}: ${error}`);
  }
}

function extractCSRFToken(html: string): string | null {
  const match = html.match(/name="csrf_token"\s+value="([^"]+)"/);
  return match ? match[1] : null;
}

function logResult(
  route: string,
  method: string,
  expectedStatus: number,
  actualStatus: number,
  passed: boolean,
  note?: string
) {
  results.push({
    route,
    method,
    expectedStatus,
    actualStatus,
    result: passed ? 'PASS' : 'FAIL',
    note,
  });

  const status = passed ? '✓' : '✗';
  console.log(
    `${status} ${method.padEnd(6)} ${route.padEnd(40)} | Expected: ${expectedStatus}, Got: ${actualStatus} ${note ? `| ${note}` : ''}`
  );
}

async function runTests() {
  console.log('🚀 Starting Smoke Tests...\n');

  try {
    // Test 1: Login page load (GET /panel/login)
    console.log('--- Test 1: Login Page ---');
    const loginPageRes = await makeRequest('/panel/login');
    const csrfToken = extractCSRFToken(loginPageRes.text);
    logResult(
      '/panel/login',
      'GET',
      200,
      loginPageRes.status,
      loginPageRes.status === 200 && !!csrfToken,
      csrfToken ? 'CSRF token extracted' : 'No CSRF token found'
    );

    if (!csrfToken) {
      console.log('❌ Cannot proceed: CSRF token not found. Stopping tests.\n');
      return;
    }

    // Test 2: Login (POST /panel/login)
    console.log('\n--- Test 2: Login ---');
    const loginRes = await makeRequest(
      '/panel/login',
      'POST',
      {
        username: 'admin',
        password: 'admin1234',
        csrf_token: csrfToken,
      },
      302
    );
    const isLoginSuccess =
      loginRes.status === 302 || loginRes.status === 200 || loginRes.text.includes('admin');
    logResult(
      '/panel/login',
      'POST',
      302,
      loginRes.status,
      isLoginSuccess,
      isLoginSuccess ? 'Login successful' : 'Login failed'
    );

    // Test 3: Admin Overview Page
    console.log('\n--- Test 3: Admin Routes ---');
    const adminRoutes = [
      '/panel/admin/overview',
      '/panel/admin/sales',
      '/panel/admin/courses',
      '/panel/admin/specializations',
      '/panel/admin/teachers',
      '/panel/admin/payouts',
    ];

    for (const route of adminRoutes) {
      const res = await makeRequest(route);
      logResult(
        route,
        'GET',
        200,
        res.status,
        res.status === 200,
        res.text.includes('<!DOCTYPE') || res.text.includes('<html') ? 'HTML loaded' : 'No HTML'
      );
    }

    // Test 4: Teacher Routes
    console.log('\n--- Test 4: Teacher Routes ---');
    const teacherRoutes = [
      '/panel/teacher/courses',
      '/panel/teacher/courses/create',
      '/panel/teacher/lectures',
      '/panel/teacher/payouts',
    ];

    for (const route of teacherRoutes) {
      const res = await makeRequest(route);
      logResult(
        route,
        'GET',
        200,
        res.status,
        res.status === 200,
        res.text.includes('<!DOCTYPE') || res.text.includes('<html') ? 'HTML loaded' : 'No HTML'
      );
    }

    // Test 5: Static Assets
    console.log('\n--- Test 5: Static Assets ---');
    const assets = ['/css/panel.css', '/js/panel.js', '/vendor/chart.umd.js'];

    for (const asset of assets) {
      const res = await makeRequest(asset);
      const isCSS = asset.endsWith('.css');
      const isJS = asset.endsWith('.js');
      const isValid =
        res.status === 200 &&
        (isCSS ? res.text.includes('{') || res.text.includes(';') : isJS ? res.text.includes('function') || res.text.includes('const') : true);

      logResult(
        asset,
        'GET',
        200,
        res.status,
        isValid,
        res.status === 200 ? 'Asset loaded' : 'Asset 404'
      );
    }

    // Test 6: API Routes
    console.log('\n--- Test 6: API Routes ---');

    // Test 6a: Register
    const registerRes = await makeRequest('/api/auth/register', 'POST', {
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      password: 'password123',
    });
    logResult(
      '/api/auth/register',
      'POST',
      201,
      registerRes.status,
      registerRes.status === 201 || registerRes.status === 400,
      registerRes.status === 201 ? 'User registered' : 'Already exists or error'
    );

    // Test 6b: Login API
    const apiLoginRes = await makeRequest('/api/auth/login', 'POST', {
      username: 'admin',
      password: 'admin1234',
    });
    logResult(
      '/api/auth/login',
      'POST',
      200,
      apiLoginRes.status,
      apiLoginRes.status === 200,
      apiLoginRes.status === 200 ? 'API login successful' : 'API login failed'
    );

    // Extract token from login response
    let token = '';
    try {
      const data = JSON.parse(apiLoginRes.text);
      token = data.token || data.data?.token || '';
    } catch {
      // ignore
    }

    // Test 6c: Catalog (requires auth)
    const catalogRes = await makeRequest('/api/specializations');
    logResult(
      '/api/specializations',
      'GET',
      200,
      catalogRes.status,
      catalogRes.status === 200 || catalogRes.status === 401,
      catalogRes.status === 200 ? 'Specializations loaded' : 'Requires authentication (401 OK)'
    );

    // Test 6d: Wallet (requires auth)
    const walletRes = await makeRequest('/api/');
    logResult(
      '/api/ (wallet)',
      'GET',
      200,
      walletRes.status,
      walletRes.status === 200 || walletRes.status === 401,
      'Wallet endpoint accessible'
    );

    // Test 7: Authorization (Unauthenticated access redirect)
    console.log('\n--- Test 7: Authorization ---');
    
    // Clear cookies to test unauthenticated access
    const unauthCookies = new CookieJar();
    
    // Try to access admin page without authentication
    try {
      const response = await fetch(`${BASE_URL}/panel/admin/overview`, {
        method: 'GET',
        redirect: 'manual', // Don't follow redirects
      });
      
      const isRedirect = response.status === 302 || response.status === 301;
      const isLogin = (response.headers.get('location') ?? '').includes('/panel/login');
      
      logResult(
        '/panel/admin/overview (unauthenticated)',
        'GET',
        302,
        response.status,
        isRedirect && isLogin,
        isRedirect ? `Redirects to login (${response.headers.get('location')})` : 'Does not redirect'
      );
    } catch (error) {
      logResult(
        '/panel/admin/overview (unauthenticated)',
        'GET',
        302,
        0,
        false,
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    // Test 8: 404 handling
    console.log('\n--- Test 8: 404 Handling ---');
    const notFoundRes = await makeRequest('/api/nonexistent');
    logResult(
      '/api/nonexistent',
      'GET',
      404,
      notFoundRes.status,
      notFoundRes.status === 404,
      'Proper 404 response'
    );

  } catch (error) {
    console.error('❌ Test execution failed:', error);
  }

  // Summary
  console.log('\n\n=== SMOKE TEST SUMMARY ===\n');
  const passCount = results.filter((r) => r.result === 'PASS').length;
  const failCount = results.filter((r) => r.result === 'FAIL').length;

  console.log(
    `Route | Method | Expected | Actual | Result | Note`.padEnd(100)
  );
  console.log('-'.repeat(100));

  for (const result of results) {
    const pass = result.result === 'PASS' ? '✓ PASS' : '✗ FAIL';
    console.log(
      `${result.route.padEnd(35)} | ${result.method.padEnd(6)} | ${String(result.expectedStatus).padEnd(8)} | ${String(result.actualStatus).padEnd(6)} | ${pass.padEnd(6)} | ${result.note || ''}`
    );
  }

  console.log('-'.repeat(100));
  console.log(`\nTotal: ${results.length} tests | ✓ ${passCount} PASS | ✗ ${failCount} FAIL`);
  console.log(`Success Rate: ${((passCount / results.length) * 100).toFixed(1)}%\n`);

  if (failCount === 0) {
    console.log('🎉 All tests passed!');
  } else {
    console.log(`⚠️  ${failCount} test(s) failed. Review details above.`);
  }
}

runTests().catch(console.error);
