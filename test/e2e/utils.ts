/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable import/no-extraneous-dependencies, no-console, no-multi-assign */

import http, { Server } from 'http';
import colors from 'kleur';
import path from 'path';
import {
  Browser, chromium, ConsoleMessage, Page,
} from 'playwright-chromium';
import sirv from 'sirv';

export interface TestContext {
  browser: Browser;
  consoleMessages: ConsoleMessage[];
  page: Page;
}

// increase limit from 10
global.Error.stackTraceLimit = 100;

const PORT = process.env.PORT || 8080;
const DIST_DIR = path.join(__dirname, '../../dist');
let server: Server;

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function setup(context: TestContext): Promise<void> {
  if (server) {
    throw new Error('Server already exists, did you forget to run teardown()?');
  }

  server = http.createServer(
    sirv(DIST_DIR, {
      single: true,
      onNoMatch(req) {
        throw new Error(`No matching URL: ${req.url!}`);
      },
    }),
  );

  server.on('error', (err) => {
    if (err) throw err;
  });

  server.listen(Number(PORT));

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
  page.on('crash', (crashedPage) => {
    throw new Error(`Page crashed ${crashedPage.url()}`);
  });
  // unhandled error
  page.on('pageerror', (err) => {
    throw err;
  });
  context.consoleMessages = [];
  page.on('console', (msg) => {
    const loc = msg.location();
    console.log(
      colors.dim(
        `${loc.url}:${loc.lineNumber}:${loc.columnNumber} ${msg.type()} >>`,
      ),
      msg.text(),
    );
    context.consoleMessages.push(msg);
  });
  await page.goto(`http://localhost:${PORT}`);
}

export async function cleanupPage(context: TestContext): Promise<void> {
  if (!context.page) {
    throw new Error(
      'No browser page exists, did you forget to run renderPage()?',
    );
  }

  await context.page.close();
  // @ts-expect-error - reset for next renderPage
  context.consoleMessages = context.page = undefined;
}
