---
title: Terms and Conditions
---

::u-page-header
---
class: mb-4
---
#title
{{ $doc.title }}

#description
Legalese for compliance purposes.
::

## Rich Text Editing

Full formatting support with **bold**, *italic*, *underline*, ~~strikethrough~~, and \`inline code\`.

![Image Placeholder](/placeholder.jpeg)

### Code Blocks

Code blocks are supported with syntax highlighting using [Shiki](https://shiki.dev/).

```vue [example.vue]
<template>
  <UEditor v-slot="{ editor }" v-model="value" content-type="markdown">
    <UEditorToolbar :editor="editor" :items="items"/>
  </UEditor>
</template>
```

### Lists

1. Numbered lists for sequential items
2. With automatic numbering

- Bullet lists work too
  - With nested items
  - At multiple levels
- Task lists for todos
- Mark items as complete

### Tables

Insert and edit tables with row/column controls and cell selection.

| Feature  | Description           | Status |
| -------- | --------------------- | ------ |
| Tables   | Full table support    | ✅      |
| Markdown | Content serialization | ✅      |

---

## Features

### Bubble & Fixed Toolbars

Select text to see the bubble toolbar with formatting options. The fixed toolbar at the top provides quick access to common actions.

### Drag Handle

Use the drag handle on the left side of any block to reorder, duplicate, delete, or convert between block types.

### Slash Commands

Type `/` anywhere to access quick insertion commands for headings, lists, code blocks, tables, images, and more.


### Mentions & Emojis

Mention collaborators with `@` (To be announced) and add emojis with `:` syntax 🚀

---

Visit the [Nuxt UI documentation](https://ui.nuxt.com/docs/components/editor) to learn more about the Editor component.
