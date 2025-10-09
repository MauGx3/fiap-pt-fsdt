import { test, expect } from '@playwright/test';

test.describe('Blog Post Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page
    await page.goto('/');
    
    // Wait for the page to be fully loaded
    await page.waitForSelector('h2:has-text("Posts")');
  });

  test('should create, view, and edit a post from the home page', async ({ page }) => {
    // Step 1: Create a new post
    await test.step('Create a new post', async () => {
      // Click on the Create Post button
      await page.click('button:has-text("Create Post")');
      
      // Wait for the form to appear
      await expect(page.locator('input[placeholder="Post title"]')).toBeVisible();
      
      // Fill in the post details
      await page.fill('input[placeholder="Post title"]', 'E2E Test Post');
      await page.fill('textarea[placeholder="Post content"]', 'This is an end-to-end test post created by Playwright.');
      await page.fill('input[placeholder="Tags (comma separated)"]', 'e2e, playwright, test');
      
      // Submit the form
      await page.click('button:has-text("Create Post")');
      
      // Wait for the success toast notification (if visible)
      // Note: The toast might appear and disappear quickly
      await page.waitForTimeout(1000);
    });

    // Step 2: View the created post
    await test.step('View the created post', async () => {
      // Check that the post is now visible in the list
      await expect(page.locator('h3:has-text("E2E Test Post")')).toBeVisible();
      await expect(page.locator('text=This is an end-to-end test post created by Playwright.')).toBeVisible();
      
      // Verify tags are displayed
      await expect(page.locator('.tag:has-text("e2e")')).toBeVisible();
      await expect(page.locator('.tag:has-text("playwright")')).toBeVisible();
      await expect(page.locator('.tag:has-text("test")')).toBeVisible();
    });

    // Step 3: Edit the created post
    await test.step('Edit the created post', async () => {
      // Find the post and click the Edit button
      const postCard = page.locator('.post:has(h3:has-text("E2E Test Post"))');
      await postCard.locator('button:has-text("Edit")').click();
      
      // Wait for the edit form to appear within the post card
      await expect(postCard.locator('input[placeholder="Post title"]')).toBeVisible();
      
      // Modify the post title and content
      await postCard.locator('input[placeholder="Post title"]').fill('E2E Test Post - Updated');
      await postCard.locator('textarea[placeholder="Post content"]').fill('This post has been updated by the E2E test.');
      await postCard.locator('input[placeholder="Tags (comma separated)"]').fill('e2e, playwright, updated');
      
      // Save the changes
      await postCard.locator('button:has-text("Save")').click();
      
      // Wait for the update to complete
      await page.waitForTimeout(1000);
      
      // Verify the updated content is displayed
      await expect(page.locator('h3:has-text("E2E Test Post - Updated")')).toBeVisible();
      await expect(page.locator('text=This post has been updated by the E2E test.')).toBeVisible();
      await expect(page.locator('.tag:has-text("updated")')).toBeVisible();
    });
  });

  test('should cancel editing a post', async ({ page }) => {
    // First create a post
    await page.click('button:has-text("Create Post")');
    await page.fill('input[placeholder="Post title"]', 'Test Post for Cancel');
    await page.fill('textarea[placeholder="Post content"]', 'This post will test the cancel functionality.');
    await page.click('button:has-text("Create Post")');
    await page.waitForTimeout(1000);
    
    // Start editing the post
    const postCard = page.locator('.post:has(h3:has-text("Test Post for Cancel"))');
    await postCard.locator('button:has-text("Edit")').click();
    
    // Modify the title but don't save
    await postCard.locator('input[placeholder="Post title"]').fill('Modified Title');
    
    // Click cancel
    await postCard.locator('button:has-text("Cancel")').click();
    
    // Verify the original content is still displayed
    await expect(page.locator('h3:has-text("Test Post for Cancel")')).toBeVisible();
    await expect(page.locator('h3:has-text("Modified Title")')).not.toBeVisible();
  });

  test('should display validation error for empty post fields', async ({ page }) => {
    // Click on the Create Post button
    await page.click('button:has-text("Create Post")');
    
    // Try to submit the form without filling any fields
    await page.click('button:has-text("Create Post")');
    
    // The form should not be submitted due to HTML5 validation
    // The create form should still be visible
    await expect(page.locator('input[placeholder="Post title"]')).toBeVisible();
  });
});
