# Component Architecture Guide

## 🧠 Layer-based Component Model

zend-theme ใช้ **Layer-based Component Model** ที่ scalable และรองรับการเติบโตในอนาคต

---

## 📊 Architecture Layers

### 🔹 Level 1: Primitive (ของเล็ก ปรับง่าย)

**ใช้ซ้ำสูง / เปลี่ยนแค่ props**

**ตัวอย่าง:**
- `button`
- `input`
- `badge`
- `icon`

**Meta:**
```json
{
  "name": "button",
  "type": "ui",
  "category": "primitive",
  "dependencies": []
}
```

---

### 🔹 Level 2: Composite (ประกอบ)

**เอา primitive มาประกอบ**

**ตัวอย่าง:**
- `card`
- `modal`
- `navbar`
- `form`

**Meta:**
```json
{
  "name": "card",
  "type": "ui",
  "category": "composite",
  "dependencies": ["button", "badge"]
}
```

---

### 🔹 Level 3: Section (เป็นช่วง ๆ ของหน้า)

**เอา composite มาจัด layout**

**ตัวอย่าง:**
- `hero-section`
- `pricing-section`
- `stats-section`

**Meta:**
```json
{
  "name": "hero-section",
  "type": "layout",
  "category": "section",
  "dependencies": ["button", "card"]
}
```

---

### 🔹 Level 4: Page / Template

**เอาไปใช้ได้ทั้งหน้า**

**ตัวอย่าง:**
- `dashboard`
- `auth-page`
- `landing-page`

**Meta:**
```json
{
  "name": "dashboard",
  "type": "template",
  "category": "page",
  "dependencies": ["navbar", "card", "table"],
  "overwrite": false
}
```

---

## 📋 Component Meta Schema

### Core Fields (Required)

```typescript
{
  name: string              // Component name
  dependencies?: string[]   // Array of component dependencies
}
```

### Extended Fields (Optional, Future Use)

```typescript
{
  type?: "ui" | "layout" | "template"
  category?: "primitive" | "composite" | "section" | "page"
  variants?: string[]       // e.g., ["default", "outline", "ghost"]
  customizable?: boolean   // Whether component can be customized
  slots?: string[]         // e.g., ["title", "content", "footer"]
  overwrite?: boolean      // Whether to overwrite by default
}
```

---

## 🎯 Variants System

### Card หลายแบบ

**❌ วิธีที่ไม่แนะนำ:**
```
card1/
card2/
card3/
```

**✅ วิธีที่ scalable:**
```
card/
 ├─ index.tsx        ← base
 ├─ variants.ts     ← variants
 └─ meta.json
```

**Meta:**
```json
{
  "name": "card",
  "category": "composite",
  "variants": ["default", "stats", "media"]
}
```

**CLI:**
```bash
zend-theme add card --variant stats
```

---

## 🎨 Slots System

**Slots = สัญญาว่า "ผู้ใช้แก้ตรงไหนได้บ้าง"**

**Meta:**
```json
{
  "name": "card",
  "slots": ["title", "content", "footer"]
}
```

**Usage:**
```jsx
<Card>
  <Card.Title>Revenue</Card.Title>
  <Card.Content>...</Card.Content>
  <Card.Footer>...</Card.Footer>
</Card>
```

---

## 🔄 Forward Compatibility

### ✅ Safe: Adding New Fields

เพิ่ม field ใหม่ใน `meta.json` **ไม่พัง** เพราะ:
- CLI ใช้ optional chaining (`meta.dependencies ?? []`)
- Interface รองรับ unknown fields (`[key: string]: unknown`)
- Schema ไม่ hardcode

**ตัวอย่าง:**
```json
{
  "name": "button",
  "dependencies": [],
  "variants": ["default", "outline"],  // ← เพิ่มได้เลย
  "customizable": true                  // ← เพิ่มได้เลย
}
```

### ⚠️ Breaking: Changing Field Types

เปลี่ยน type ของ field ที่มีอยู่ = **MAJOR version bump**

**ตัวอย่าง:**
```json
// ❌ Breaking change
{
  "dependencies": "button"  // เปลี่ยนจาก array เป็น string
}
```

---

## 🏗️ Template System (Future)

### Dashboard Example

**Meta:**
```json
{
  "name": "dashboard",
  "type": "template",
  "category": "page",
  "dependencies": ["sidebar", "card", "table", "chart"],
  "overwrite": false
}
```

**CLI Behavior:**
- ถ้า `type = template` → confirm หนัก
- add เป็น folder
- อาจมี route / layout

---

## 🧠 Mental Model

### 1️⃣ คุณรับผิดชอบ behavior เดิม

ถ้า user เคยพิมพ์:
```bash
zend-theme add button
```

มัน **ต้องยังทำงาน**

### 2️⃣ Version = สัญญา

เลขเวอร์ = คำสัญญากับ user

### 3️⃣ Forward Compatibility > Breaking Changes

- เพิ่ม field ใหม่ = ✅ Safe
- เปลี่ยน field type = ⚠️ MAJOR bump

---

## 📚 References

โมเดลนี้ใช้เหมือนกับ:
- shadcn/ui
- chakra-ui
- Internal design systems ของบริษัทใหญ่

