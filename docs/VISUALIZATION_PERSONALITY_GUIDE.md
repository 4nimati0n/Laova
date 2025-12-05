# Laura's Personality-Based Visualization Guide

## Overview

This document explains how Laura's personality influences her inner visualization style, and provides a template for creating similar systems for new characters.

---

## Laura's Personality Traits

From her system prompt and character definition:

| Trait | Description |
|-------|-------------|
| **Serviable** | Helpful, attentive to needs |
| **Gentille** | Kind, warm, caring |
| **Enjouée** | Playful, cheerful, upbeat |
| **Anime Character** | Stylized, expressive, cute aesthetic |
| **French-Speaking** | Natural, conversational tone |

---

## How Personality Maps to Visual Style

### Color Palette
- **Primary**: Warm pastels (soft pinks #FFB6C1, light peach #FFDAB9)
- **Secondary**: Gentle blues (#87CEEB), soft lavender (#E6E6FA)
- **Accent**: Golden tones (#FFD700), warm white highlights

### Atmosphere
- **Dreaminess**: High (0.7) - Soft focus, ethereal glow
- **Warmth**: Warm (0.6) - Cozy, comforting feeling
- **Texture**: Watercolor-like, gentle brush strokes

### Mood
- **Optimistic**: Bright elements, uplifting imagery
- **Playful**: Whimsical elements (floating petals, sparkles)
- **Gentle**: Soft edges, no harsh contrasts

---

## Prompt Engineering Strategy

### Base Style Template
```
[visual concept], soft anime aesthetic, gentle watercolor textures, 
dreamy atmosphere, whimsical mood, warm pastel colors
```

### Style Modifiers by Setting

| Setting | Low (0-0.3) | Medium (0.4-0.6) | High (0.7-1.0) |
|---------|-------------|------------------|----------------|
| **Dreaminess** | Sharp focus | Gentle softness | Ethereal glow, bokeh |
| **Warmth** | Cool blues, lavender | Balanced pastels | Golden tones, pink accents |
| **Saturation** | Muted, subtle | Gentle colors | Vibrant, vivid |
| **Anime** | Semi-realistic | Anime-inspired | Pure manga style |

---

## Example Transformations

| Input Text | Laura's Visual Prompt |
|------------|----------------------|
| "J'aime les chats" | Fluffy cats in cozy setting, soft pastels, warm sunlight |
| "Il pleut dehors" | Gentle rain on window, warm tea, cozy interior |
| "Je suis heureuse" | Joyful scene with sparkles, bright warm colors |
| "La musique est belle" | Floating musical notes, soft glow, melodic atmosphere |

---

## Creating New Character Visualizations

### Step 1: Define Personality Traits
List 4-6 core traits that define the character's inner world.

### Step 2: Map to Visual Elements

| Trait Category | Visual Element |
|----------------|----------------|
| Emotional tone | Color palette |
| Energy level | Animation/movement |
| Aesthetic style | Art style (realistic, anime, abstracted) |
| Complexity | Composition density |

### Step 3: Create Base Style String
Combine the visual elements into a consistent style description.

### Step 4: Define Mood Modifiers
Create mappings for emotional variations while maintaining character consistency.

### Step 5: Test and Refine
Use the settings sliders to find the optimal balance for the character.

---

## Template: New Character Visualization

```typescript
// Character: [NAME]
// Personality: [TRAIT_1], [TRAIT_2], [TRAIT_3]

const CHARACTER_STYLE_BASE = `[primary aesthetic], [texture style], 
[atmosphere descriptor], [mood descriptor]`;

const CHARACTER_COLOR_PALETTE = {
    primary: '#[HEX]',
    secondary: '#[HEX]',
    accent: '#[HEX]'
};

const CHARACTER_DEFAULT_STYLE = {
    dreaminess: [0.0-1.0],
    warmth: [0.0-1.0],
    saturation: [0.0-1.0],
    styleLevel: [0.0-1.0]  // anime, realistic, abstract, etc.
};
```

---

## Files to Modify for New Characters

1. **visualizationPrompt.ts** - Update system prompt with character personality
2. **falai.ts** - Adjust `DEFAULT_VISUALIZATION_STYLE` values
3. **VisualizationSettings.tsx** - Customize slider labels if needed
