import {
    expect,
    Page,
    test
} from "@playwright/test";

const VIEWPORTS = [
    { width: 1440, height: 900 },
    { width: 1024, height: 768 },
    { width: 768, height: 900 },
    { width: 430, height: 932 },
    { width: 390, height: 844 },
    { width: 360, height: 640 }
] as const;

async function expectNoHorizontalOverflow(
    page: Page
): Promise<void> {
