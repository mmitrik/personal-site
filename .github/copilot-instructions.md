# AI Assistant Guidelines for mmitrik.com

## 🎯 Purpose
This document provides clear guidelines for AI assistants when working on this personal website project. Follow these rules to maintain consistency and avoid repetitive corrections.

## 📁 Project Structure Guidelines

### **RULE 1: New Projects go in `/apps/` Directory**
```
✅ CORRECT: src/app/apps/my-new-project/page.js
❌ WRONG:   src/app/my-new-project/page.js
❌ WRONG:   src/components/MyNewProject.js (unless it's a reusable component)
```

**All interactive applications, games, and tools should be created as:**
- `src/app/apps/[project-name]/page.js`
- Include a `readme.md` in the project folder
- Add to the projects list in `src/app/projects/page.js`

### **RULE 2: Use Consistent File Structure**
Every new app should follow this pattern:
```
src/app/apps/[project-name]/
├── page.js          # Main component
├── readme.md        # Documentation
└── components/      # Project-specific components (if needed)
```

## 🎨 Design System - MANDATORY USAGE

### **RULE 3: Always Use Design System Classes**
```css
/* ✅ CORRECT - Use these Tailwind classes: */
bg-bg          /* Main background */
bg-surface     /* Card/section backgrounds */
text-text      /* Primary text */
text-muted     /* Secondary text */
text-accent    /* Links and highlights */
border-border  /* All borders */

/* ❌ WRONG - Don't use arbitrary colors: */
bg-white, bg-gray-100, text-gray-600, border-gray-300
```

### **RULE 4: Required Layout Structure**
Every app page MUST use this exact structure:

```javascript
export default function MyApp() {
  return (
    <main className="min-h-screen bg-bg text-text">
      <div className="max-w-4xl mx-auto p-8 pt-16">
        <Header />

        {/* Main App Section */}
        <section className="bg-surface p-10 rounded-2xl shadow-sm">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-heading font-bold text-text mb-4">
              [ICON] App Name
            </h1>
            <p className="text-muted text-lg">
              Brief description
            </p>
          </div>

          {/* App Content Here */}
          
        </section>

        {/* Info Section (Optional but Recommended) */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            <strong>[ICON] How it Works:</strong> Instructions...
          </p>
        </div>

        {/* Version Footer */}
        <footer className="mt-8 text-center">
          <p className="text-muted text-xs">App Name v1.0</p>
        </footer>
      </div>
    </main>
  )
}
```

### **RULE 5: Import Requirements**
Always include these imports for app pages:
```javascript
'use client'  // If using state or effects

import Header from '../../../components/Header'
// Other imports...
```

## 🎨 Component Styling Guidelines

### **RULE 6: Buttons**
```javascript
// ✅ Primary Button
className="bg-accent text-white px-6 py-2 rounded-lg hover:opacity-90"

// ✅ Secondary Button  
className="bg-border text-text px-6 py-2 rounded-lg hover:bg-surface"

// ✅ Disabled Button
className="bg-border text-muted px-6 py-2 rounded-lg cursor-not-allowed"
```

### **RULE 7: Input Fields**
```javascript
// ✅ Standard Input
className="w-full p-3 border border-border rounded-lg bg-surface text-text focus:ring-2 focus:ring-accent focus:border-transparent"
```

### **RULE 8: Cards/Containers**
```javascript
// ✅ Card Container
className="bg-surface rounded-lg border border-border p-4"

// ✅ Info Box
className="bg-bg rounded-lg border border-border p-6"
```

## 📋 Content Guidelines

### **RULE 9: Project Descriptions**
When adding to `src/app/projects/page.js`, use this format:
```javascript
{
  title: "App Name",
  description: "A [brief description] that [key feature]. Built with [main technologies] and [special features].",
  link: "/apps/app-name",
}
```

### **RULE 10: Emojis and Icons**
- Use emojis in titles: `🎮 Game Name`, `💬 Posts`, `🎯 Tool Name`
- Keep descriptions professional but friendly
- Include version numbers in footers

## 🔧 Technical Guidelines

### **RULE 11: State Management**
```javascript
// ✅ Use descriptive state names
const [isLoading, setIsLoading] = useState(false)
const [gameScore, setGameScore] = useState(0)

// ❌ Avoid generic names
const [data, setData] = useState()
const [state, setState] = useState()
```

### **RULE 12: Error Handling**
Always include proper error states:
```javascript
// ✅ Include loading and error states
if (loading) return <div className="text-muted">Loading...</div>
if (error) return <div className="text-red-500">Error: {error}</div>
```

### **RULE 13: Responsive Design**
Use responsive classes consistently:
```javascript
// ✅ Mobile-first responsive
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
className="text-sm md:text-base lg:text-lg"
```

## 📝 Documentation Requirements

### **RULE 14: Always Create readme.md**
Every new app needs a `readme.md` with:
- Overview and features
- Technical stack
- Usage instructions
- Future enhancement ideas

### **RULE 15: Comment Complex Logic**
```javascript
// ✅ Explain non-obvious code
// Calculate score multiplier based on combo chain
const multiplier = Math.floor(comboCount / 5) + 1

// ❌ Don't state the obvious
// Set loading to true
setLoading(true)
```

## 🚀 Deployment Considerations

### **RULE 16: Environment Variables**
- Document required environment variables
- Use `.env.local.example` for templates
- Never commit actual credentials

### **RULE 17: Build Optimization**
- Ensure components are properly optimized
- Use `'use client'` only when necessary
- Import only what you need

### **RULE 18: Lint Validation — MANDATORY**
**Always run `npm run lint` before considering any work complete.** The production build (`next build`) will fail on lint errors, so catching them locally is essential.

```bash
# ✅ Run this after every change
npm run lint
```

Common Next.js lint pitfalls to avoid:
- **Do not use `module` as a variable name** — `@next/next/no-assign-module-variable` forbids it. Use descriptive names like `gameModule`, `loadedModule`, etc.
- **Do not use `<img>` tags** — use `next/image` instead (`@next/next/no-img-element`).
- **Do not add `<link>` fonts outside of `layout.js`** — use `next/font` or the root layout (`@next/next/no-page-custom-font`).
- **Include all dependencies in React hook dependency arrays** — `react-hooks/exhaustive-deps` will warn otherwise.

```javascript
// ❌ WRONG — 'module' is reserved by Next.js
const module = await import('./something');

// ✅ CORRECT — use a descriptive name
const loadedPlugin = await import('./something');
```

## ✅ Quick Checklist for New Apps

Before submitting any new app, verify:

- [ ] Created in `src/app/apps/[name]/` directory
- [ ] Uses design system colors (bg-bg, text-text, etc.)
- [ ] Follows required layout structure with Header
- [ ] Added to projects list in `src/app/projects/page.js`
- [ ] Includes proper title with emoji
- [ ] Has info section explaining usage
- [ ] Includes version footer
- [ ] Creates `readme.md` documentation
- [ ] Uses responsive design classes
- [ ] Handles loading and error states
- [ ] Mobile-friendly interface
- [ ] **Passes `npm run lint` with no errors** (see Rule 18)

## 🔄 When Updating Existing Apps

- Maintain existing functionality
- Follow same design system rules
- Update version numbers
- Document changes in readme.md
- Test on different screen sizes

---

**Remember:** The goal is consistency and maintainability. These rules ensure every new addition fits seamlessly with the existing codebase and user experience.