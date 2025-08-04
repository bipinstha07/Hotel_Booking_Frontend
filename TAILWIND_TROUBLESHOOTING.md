# Tailwind CSS Troubleshooting Guide

## Common Issues and Solutions

### 1. **Tailwind Classes Not Working**

**Symptoms:**
- Tailwind classes are not applied
- Styles look unstyled
- Console shows no errors

**Solutions:**

#### Check CSS Import
Make sure `globals.css` is imported in your layout:

```tsx
// app/layout.tsx
import './globals.css'
```

#### Verify Tailwind Directives
Ensure these are at the top of `globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

#### Check Content Paths
Verify your `tailwind.config.ts` includes all your files:

```ts
content: [
  "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  "./components/**/*.{js,ts,jsx,tsx,mdx}",
  "./app/**/*.{js,ts,jsx,tsx,mdx}",
  "*.{js,ts,jsx,tsx,mdx}"
],
```

### 2. **Development Server Issues**

**Solutions:**

#### Clear Cache and Restart
```bash
rm -rf .next
npm run dev
```

#### Check for Build Errors
```bash
npm run build
```

#### Verify Dependencies
```bash
npm install tailwindcss postcss autoprefixer
```

### 3. **Specific Class Issues**

#### Custom Classes Not Working
- Check if classes are in the content paths
- Verify class names are correct
- Try purging and rebuilding

#### Responsive Classes Not Working
- Ensure proper breakpoint syntax: `md:text-lg`
- Check for conflicting styles

#### Dynamic Classes Not Working
- Use `clsx` or `tailwind-merge` for dynamic classes
- Avoid string concatenation for class names

### 4. **Testing Tailwind**

Visit `/tailwind-test` to see if Tailwind is working:

- Colors should be applied
- Spacing should work
- Typography should be styled
- Grid and Flexbox should work

### 5. **Common Fixes**

#### Update PostCSS Config
```js
// postcss.config.mjs
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

#### Check Package Versions
```json
{
  "tailwindcss": "^3.4.17",
  "postcss": "^8.5",
  "autoprefixer": "^10.4.20"
}
```

#### Verify TypeScript Config
```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### 6. **Debug Steps**

1. **Check Browser DevTools**
   - Look for CSS being loaded
   - Check for any console errors

2. **Verify File Structure**
   ```
   app/
   ├── globals.css
   ├── layout.tsx
   └── page.tsx
   ```

3. **Test with Simple Classes**
   ```tsx
   <div className="bg-red-500 text-white p-4">
     Test
   </div>
   ```

4. **Check for Conflicts**
   - Remove any conflicting CSS
   - Check for CSS reset conflicts

### 7. **If Still Not Working**

1. **Reinstall Dependencies**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Reset Tailwind Config**
   ```bash
   npx tailwindcss init -p
   ```

3. **Check for Next.js Issues**
   - Update Next.js to latest version
   - Check for known issues on GitHub

### 8. **Working Example**

If Tailwind is working, you should see:
- Colored backgrounds
- Proper spacing
- Responsive design
- Typography styles

Visit `/tailwind-test` to verify everything is working correctly. 