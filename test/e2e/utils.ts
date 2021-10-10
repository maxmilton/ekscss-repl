/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-console, no-multi-assign */

import getPort from 'get-port';
import http from 'http';
import colors from 'kleur';
import path from 'path';
import {
  Browser, chromium, ConsoleMessage, Page,
} from 'playwright-chromium';
import sirv from 'sirv';

export interface TestContext {
  browser: Browser;
  consoleMessages: ConsoleMessage[];
  unhandledErrors: Error[];
  page: Page;
}

// increase limit from 10
global.Error.stackTraceLimit = 100;

const DIST_DIR = path.join(__dirname, '..', '..', 'dist');
let port: number;
let server: http.Server;

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function setup(context: TestContext): Promise<void> {
  if (server) {
    throw new Error('Server already exists, did you forget to run teardown()?');
  }

  server = http.createServer(
    sirv(DIST_DIR, {
      // single: true,
      onNoMatch(req) {
        throw new Error(`No matching URL: ${req.url!}`);
      },
    }),
  );
  server.on('error', (err) => {
    if (err) throw err;
  });
  server.listen((port = await getPort()));
  context.browser = await chromium.launch();
}

export async function teardown(context: TestContext): Promise<void> {
  if (!server) {
    throw new Error('No server exists, did you forget to run setup()?');
  }

  await context.browser.close();
  server.close();
}

export async function renderPage(context: TestContext): Promise<void> {
  if (!context.browser) {
    throw new Error(
      'No browser instance exists, did you forget to run setup()?',
    );
  }
  if (context.page) {
    throw new Error(
      'Browser page already exists, did you forget to run cleanupPage()?',
    );
  }

  const page = await context.browser.newPage();
  context.page = page;
  context.unhandledErrors = [];
  context.consoleMessages = [];

  page.on('crash', (crashedPage) => {
    throw new Error(`Page crashed: ${crashedPage.url()}`);
  });
  page.on('pageerror', (err) => {
    console.error(colors.red('Page Error:'), err);
    context.unhandledErrors.push(err);
  });
  page.on('console', (msg) => {
    const loc = msg.location();
    console.log(
      colors.dim(
        `${loc.url}:${loc.lineNumber}:${loc.columnNumber} [${msg.type()}]`,
      ),
      msg.text(),
    );
    context.consoleMessages.push(msg);
  });
  // Mock trackx script with empty file
  await page.route(/^https:\/\/cdn\.jsdelivr\.net\/npm\/trackx/, (route) => {
    void route.fulfill({
      status: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: '',
    });
  });
  await page.goto(`http://localhost:${port}`);
}

export async function cleanupPage(context: TestContext): Promise<void> {
  if (!context.page) {
    throw new Error(
      'No browser page exists, did you forget to run renderPage()?',
    );
  }

  await context.page.close();
  // @ts-expect-error - reset for next renderPage
  context.unhandledErrors = context.consoleMessages = context.page = undefined;
}
