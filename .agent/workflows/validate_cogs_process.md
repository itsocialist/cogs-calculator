---
description: Validate COGS Calculator End-to-End Flow
---

# Validation Workflow

This workflow tests the core functionality of the COGS calculator, including the new Configuration features.

## 1. Setup & Configuration
- [ ] Open the application
- [ ] Go to **Config** tab
- [ ] Set **Batch Scaling** > **Measurement Type** to `Volume`
- [ ] Set **Batch Scaling** > **Volume Scale** to `fl oz`
- [ ] Set **Ingredients Manifest** > **Weight Scale** to `g`
- [ ] Set **Ingredients Manifest** > **Volume Scale** to `ml`
- [ ] Verify Batch Scaling input now shows "Batch Volume" with "fl oz" suffix

## 2. Recipe Creation
- [ ] Go to **Manufacturing** tab -> **Recipe** section
- [ ] Set **Base Unit Size** to `1`
- [ ] Set **Unit Label** to `fl oz`
- [ ] Add Active Ingredient: `CBD Isolate`
    - Cost: `$800` / kg
    - Amount: `0.5` g
- [ ] Add Active Ingredient: `THC Distillate`
    - Cost: `$3500` / kg
    - Amount: `0.05` g
- [ ] *Validation*: Check **Potency** calculation (approx 550mg total if 100% purity)
- [ ] Collapse/Close the Recipe section

## 3. Batch Configuration
- [ ] Go to **Batch Scaling** section
- [ ] Set **Batch Volume** to `50` (fl oz)
- [ ] *Validation*: Verify "Method" implies scaling from the 1 fl oz base unit to 50 fl oz batch.

## 4. Manifest Verification
- [ ] Check **Ingredients Manifest** section
- [ ] *Validation*: Verify total ingredient weights match the scale (50x the single unit amounts)
- [ ] Verify displayed units match Config settings (g for weight, ml for volume)

## 5. SKU Creation (Allocation)
- [ ] Go to **SKU Configuration** section
- [ ] Add SKU 1: "Small Bottle"
    - Size: `1` oz (approx 29.5ml or 28g depending on density - use standard conversion)
    - Qty: `10`
- [ ] Add SKU 2: "Large Bottle"
    - Size: `2` oz
    - Qty: `5`
- [ ] Add SKU 3: "Sample"
    - Size: `0.5` oz
    - Qty: `20`
- [ ] *Validation*: Check "Total Allocated" vs "Total Batch" bars. Ensure we are `Under` allocated.

## 6. Over-Allocation Test
- [ ] Add SKU 4: "Excessive SKU"
    - Size: `50` oz
    - Qty: `1`
- [ ] *Validation*: Check for "Over Allocated" warning/error state.
- [ ] Remove the excessive SKU to return to valid state.

## 7. Export & Save
- [ ] Scroll to **Ingredients Manifest** -> Click **Export Manifest** (CSV)
- [ ] Go to **Recipes** tab (if available) or use Save actions
- [ ] Click **Save Current** (if implemented) or **Download CSV** from Actions menu
- [ ] Click **Actions** -> **Print/PDF** to verify print view opens

## 8. Final Config Check
- [ ] Go back to **Config** tab
- [ ] Change **Batch Scaling** > **Volume Scale** to `L`
- [ ] Go to **Manufacturing**
- [ ] *Validation*: Verify Batch Volume now shows the converted value in Liters (approx 1.48 L for 50 fl oz).
