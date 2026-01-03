# Zend Theme CLI - Features Summary

## 🎯 ระบบที่เพิ่มมาใหม่

### 1️⃣ Meta Schema v1.0

**ไฟล์:** `src/schema/meta.schema.ts`

ระบบ schema กลางที่ component/template ทุกอันต้องใช้:

```typescript
{
  name: string              // Required: ชื่อ component
  type: "ui" | "layout" | "template"  // Required: ประเภท
  category: "primitive" | "composite" | "section" | "page"  // Required: หมวดหมู่
  
  // Optional fields
  description?: string
  dependencies?: string[]
  slots?: string[]
  variants?: string[]
  customizable?: boolean
  overwrite?: boolean
}
```

**หลักการ:**
- `type` = CLI behavior (ลงยังไง)
- `category` = UX / mental model (จัดกลุ่ม)
- ไม่ผูก type กับ category ตายตัว (ยืดหยุ่น)

---

### 2️⃣ Validator System

**ไฟล์:** `src/schema/validate-meta.ts`

ตรวจสอบ meta.json ก่อนใช้งาน:
- ✅ ตรวจ required fields
- ✅ ตรวจ type และ category ว่าถูกต้อง
- ✅ ตรวจ array types
- ✅ Throw error ชัดเจนเมื่อ invalid

**ผลลัพธ์:** Meta ผิด = CLI fail เร็ว = UX ดี

---

### 3️⃣ Type-based Behavior System

**ไฟล์:** `src/utils/resolve-target-path.ts`

แต่ละ type มี behavior ต่างกัน:

| Type | Behavior | Target Path |
|------|----------|-------------|
| `ui` | Copy file/folder | `components/ui` หรือ `components` (ถ้า section) |
| `layout` | Copy folder | `components/layout` |
| `template` | Copy page + layout + route | `app` หรือ `src/app` |

**Smart Detection:**
- Template: หา `src/app` ก่อน แล้วค่อย `app`
- UI Section: ไปที่ `components/` แทน `components/ui`

---

### 4️⃣ Component Categories

#### 🔹 Primitive (Level 1)
- **ตัวอย่าง:** `button`, `input`, `badge`
- **ที่อยู่:** `components/ui/`
- **ลักษณะ:** ใช้ซ้ำสูง / เปลี่ยนแค่ props

#### 🔹 Composite (Level 2)
- **ตัวอย่าง:** `card`, `form`, `modal`
- **ที่อยู่:** `components/ui/`
- **ลักษณะ:** เอา primitive มาประกอบ

#### 🔹 Section (Level 3)
- **ตัวอย่าง:** `hero-section`, `pricing-section`
- **ที่อยู่:** `components/` (ไม่ใช่ `components/ui`)
- **ลักษณะ:** เป็นช่วง ๆ ของหน้า

#### 🔹 Page/Template (Level 4)
- **ตัวอย่าง:** `dashboard`, `auth-page`
- **ที่อยู่:** `app/` หรือ `src/app/`
- **ลักษณะ:** เอาไปใช้ได้ทั้งหน้า

---

### 5️⃣ Dependency System

**ไฟล์:** `src/add.ts` - `addWithDeps()`

**การทำงาน:**
1. อ่าน `meta.json` ของ component
2. ตรวจสอบ `dependencies`
3. Install dependencies ก่อน (recursive)
4. Install component เอง

**ป้องกัน:**
- ✅ Infinite loop (ใช้ `Set`)
- ✅ Duplicate install (ตรวจไฟล์ก่อน)

**ตัวอย่าง:**
```bash
zend-theme add form
# → add button (dependency)
# → add input (dependency)
# → add form
```

---

### 6️⃣ Config System

**ไฟล์:** `src/config/load-config.ts`

**Config Fields:**
```json
{
  "componentsDir": "src/components",  // ที่เก็บ component
  "style": "zend",                    // preset css/theme
  "autoDependencies": true,          // form → button auto add
  "overwrite": false                  // overwrite โดยไม่ถาม
}
```

**Behavior:**
- ถ้าไม่มี config → ใช้ defaults
- Backward compatible
- Auto-generate ตอน `init`

---

### 7️⃣ Smart Path Detection

**ไฟล์:** `src/utils/resolve-component-dir.ts`

**การทำงาน:**
1. ตรวจสอบ config `componentsDir` ก่อน
2. ถ้าไม่มี → auto-detect จาก candidates:
   - `src/components`
   - `components`
   - `app/components`
3. ใช้ directory ที่มีอยู่แล้ว

**ผลลัพธ์:** ไม่สร้างโครงสร้างซ้ำ

---

### 8️⃣ Overwrite System

**การทำงาน:**
1. ตรวจสอบ `meta.overwrite` ก่อน
2. ตรวจสอบ `config.overwrite`
3. ถ้าไม่มี → ถาม user

**Template:** Heavy confirm (เพราะมีหลายไฟล์)

---

## 📁 Template Structure

### Components (UI/Layout)
```
templates/components/
  ├─ button/
  │   ├─ index.jsx
  │   └─ meta.json
  ├─ hero-section/
  │   ├─ index.jsx
  │   └─ meta.json
  └─ form/
      ├─ index.jsx
      └─ meta.json
```

### Templates (Pages)
```
templates/templates/
  └─ dashboard/
      ├─ meta.json
      ├─ page.jsx
      └─ layout.jsx
```

---

## 🎯 Usage Examples

### Add UI Component
```bash
zend-theme add button
# → src/components/ui/button.jsx
```

### Add Section Component
```bash
zend-theme add hero-section
# → src/components/hero-section.jsx (ไม่ใช่ ui/)
```

### Add Template
```bash
zend-theme add dashboard
# → src/app/dashboard/ (page + layout)
```

### With Dependencies
```bash
zend-theme add form
# → add button (dependency)
# → add input (dependency)
# → add form
```

---

## 🔄 Flow Diagram

```
User: zend-theme add dashboard
  ↓
Load & Validate meta.json
  ↓
Check dependencies
  ↓
Install dependencies (recursive)
  ↓
Resolve target path (smart detection)
  ↓
Check if exists → Confirm overwrite
  ↓
Copy files (except meta.json)
  ↓
Success!
```

---

## ✅ Checklist

- [x] Meta Schema v1.0
- [x] Validator system
- [x] Type-based behavior
- [x] Category support (primitive/composite/section/page)
- [x] Dependency system
- [x] Config system
- [x] Smart path detection
- [x] Overwrite system
- [x] Template support
- [x] Section support

---

## 🚀 Next Steps (Future)

- [ ] Variants system (`--variant` flag)
- [ ] Slots system
- [ ] Customizable components
- [ ] Style presets
- [ ] More templates

