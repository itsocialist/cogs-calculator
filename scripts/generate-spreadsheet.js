import ExcelJS from 'exceljs';
import path from 'path';

const workbook = new ExcelJS.Workbook();
workbook.creator = 'Dawson Bros';
workbook.lastModifiedBy = 'COGS Calculator';
workbook.created = new Date();
workbook.modified = new Date();

const SHEET_NAME = 'COGS Calculator';
const worksheet = workbook.addWorksheet(SHEET_NAME, {
    views: [{ showGridLines: false, state: 'frozen', ySplit: 2 }]
});

// --- STYLES ---
const COLORS = {
    black: 'FF171717', // Neutral 900
    darkGray: 'FF262626', // Neutral 800
    lightGray: 'FFF3F4F6', // Neutral 100
    white: 'FFFFFFFF',
    gold: 'FFEAB308', // Yellow 500
    goldLight: 'FFFEFCE8', // Yellow 50
    dangerBg: 'FFFEE2E2', // Red 100
    dangerText: 'FFDC2626', // Red 600
    border: 'FFE5E7EB' // Neutral 200
};

const styles = {
    mainTitle: {
        font: { name: 'Arial', size: 16, bold: true, color: { argb: COLORS.black } },
        alignment: { vertical: 'middle', horizontal: 'left' }
    },
    header: {
        font: { name: 'Arial', size: 10, bold: true, color: { argb: COLORS.white } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.black } },
        alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
        border: { top: { style: 'thin' }, bottom: { style: 'thin' } }
    },
    sectionTitle: {
        font: { name: 'Arial', size: 11, bold: true, color: { argb: COLORS.black } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.lightGray } },
        alignment: { vertical: 'middle', horizontal: 'left', indent: 1 },
        border: { top: { style: 'medium' }, bottom: { style: 'thin', color: { argb: COLORS.gold } } }
    },
    data: {
        font: { name: 'Arial', size: 10, color: { argb: COLORS.darkGray } },
        alignment: { vertical: 'middle', horizontal: 'left' },
        border: { bottom: { style: 'hair', color: { argb: COLORS.border } } }
    },
    number: {
        font: { name: 'Arial', size: 10, color: { argb: COLORS.darkGray } },
        alignment: { vertical: 'middle', horizontal: 'right' },
        border: { bottom: { style: 'hair', color: { argb: COLORS.border } } }
    },
    total: {
        font: { name: 'Arial', size: 11, bold: true, color: { argb: COLORS.black } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.gold } },
        alignment: { vertical: 'middle', horizontal: 'right' },
        border: { top: { style: 'thin' }, bottom: { style: 'thin' } }
    }
};

const fmts = {
    currency: '"$"#,##0.00',
    grams: '#,##0.00" g"',
    percent: '0.0%',
    int: '#,##0'
};

// --- COLUMNS ---
worksheet.columns = [
    { header: 'Item / Category', key: 'name', width: 40 }, // A
    { header: 'Cost Input', key: 'costInput', width: 15 }, // B
    { header: 'Qty Input', key: 'qtyInput', width: 15 },   // C
    { header: '% / Spec', key: 'percent', width: 12 },     // D
    { header: 'Total Batch Cost', key: 'totalCost', width: 18 }, // E
    { header: 'Cost Per Unit', key: 'perUnit', width: 18 }, // F
    { header: '', key: 'spacer', width: 2 },               // G
    { header: 'Notes', key: 'notes', width: 40 },          // H
];

let currentRow = 1;

// 1. MAIN TITLE
worksheet.mergeCells(`A${currentRow}:H${currentRow}`);
const titleCell = worksheet.getCell(`A${currentRow}`);
titleCell.value = 'DAWSON BROS. COGS Calculator';
titleCell.font = styles.mainTitle.font;
titleCell.alignment = styles.mainTitle.alignment;
currentRow += 2;

// 2. TABLE HEADERS
const headerRow = worksheet.getRow(currentRow);
headerRow.values = ['Item / Parameter', 'Cost / Unit', 'Quantity', 'Spec / %', 'Total Batch Cost', 'Cost / Unit', '', 'Notes'];
headerRow.height = 25;
headerRow.eachCell((cell) => {
    cell.style = styles.header;
});
currentRow++;

// --- HELPERS ---
function addSection(title) {
    const row = worksheet.getRow(currentRow);
    worksheet.mergeCells(`A${currentRow}:H${currentRow}`);
    row.getCell(1).value = title.toUpperCase();
    row.getCell(1).style = styles.sectionTitle;
    row.height = 20;
    currentRow++;
}

function addDataRow(label, colB, colC, colD, note = '') {
    const row = worksheet.getRow(currentRow);
    row.getCell(1).value = label;
    row.getCell(1).style = styles.data;

    if (colB !== null) {
        row.getCell(2).value = colB;
        row.getCell(2).style = styles.number;
    }
    if (colC !== null) {
        row.getCell(3).value = colC;
        row.getCell(3).style = styles.number;
    }
    if (colD !== null) {
        row.getCell(4).value = colD;
        row.getCell(4).style = styles.number;
    }

    // Empty data cells styling
    [2, 3, 4, 5, 6].forEach(idx => {
        if (!row.getCell(idx).value) row.getCell(idx).style = styles.number;
    });

    row.getCell(8).value = note;
    row.getCell(8).style = styles.data;

    return currentRow++;
}

// ==========================================
// BATCH CONFIG
// ==========================================
addSection('Batch Configuration');
const rBatchSize = addDataRow('Batch Size (kg)', null, 10, null);
worksheet.getCell(`C${rBatchSize}`).numFmt = '#,##0" kg"';

const rUnitSize = addDataRow('Unit Size (g)', null, 50, null);
worksheet.getCell(`C${rUnitSize}`).numFmt = fmts.grams;

const rLaborRate = addDataRow('Labor Rate ($/hr)', 25, null, null);
worksheet.getCell(`B${rLaborRate}`).numFmt = fmts.currency;

const rLaborHours = addDataRow('Labor Hours', null, 6, null);
worksheet.getCell(`C${rLaborHours}`).numFmt = '0.0" hrs"';

const rTargetPotency = addDataRow('Target Potency (mg)', null, 500, null);
worksheet.getCell(`C${rTargetPotency}`).numFmt = '#,##0" mg"';

const rFulfill = addDataRow('Fulfillment Cost', 2.50, null, null);
worksheet.getCell(`B${rFulfill}`).numFmt = fmts.currency;

// Units Produced Calc
const rUnits = currentRow;
const unitsRow = worksheet.getRow(currentRow);
unitsRow.getCell(1).value = 'Est. Units Produced';
unitsRow.getCell(1).style = { ...styles.data, font: { ...styles.data.font, bold: true } };
unitsRow.getCell(3).value = { formula: `FLOOR((C${rBatchSize}*1000)/C${rUnitSize}, 1)` };
unitsRow.getCell(3).style = { ...styles.number, font: { ...styles.number.font, bold: true } };
unitsRow.getCell(3).numFmt = '#,##0';
currentRow++;
currentRow++; // Spacer

// ==========================================
// ACTIVES
// ==========================================
addSection('Active Ingredients');
const activesStart = currentRow;
const actives = [
    { name: 'CBD Isolate', cost: 550, grams: 100, purity: 0.995 },
    { name: 'CBG Distillate', cost: 1200, grams: 10, purity: 0.85 },
];

actives.forEach(item => {
    const r = addDataRow(item.name, item.cost, item.grams, item.purity);
    worksheet.getCell(`B${r}`).numFmt = fmts.currency;
    worksheet.getCell(`C${r}`).numFmt = fmts.grams;
    worksheet.getCell(`D${r}`).numFmt = fmts.percent;
    // Total Cost
    const totalCell = worksheet.getCell(`E${r}`);
    totalCell.value = { formula: `(C${r}/1000)*B${r}` };
    totalCell.numFmt = fmts.currency;
    totalCell.style = styles.number;
    // Per Unit formula not strictly necessary for individual ingredients, usually sum
});
const activesEnd = currentRow - 1;
currentRow++;

// ==========================================
// INACTIVES
// ==========================================
addSection('Inactive Ingredients');
const inactivesStart = currentRow;
const inactives = [
    { name: "Organic Shea Butter", cost: 18, grams: 4000 },
    { name: "Beeswax Pellets", cost: 22, grams: 2500 },
    { name: "MCT Oil", cost: 12, grams: 3200 },
    { name: "Menthol Crystals", cost: 45, grams: 150 },
    { name: "Lavender Essential Oil", cost: 120, grams: 50 },
];
inactives.forEach(item => {
    const r = addDataRow(item.name, item.cost, item.grams, null);
    worksheet.getCell(`B${r}`).numFmt = fmts.currency;
    worksheet.getCell(`C${r}`).numFmt = fmts.grams;
    // Total Cost
    const totalCell = worksheet.getCell(`E${r}`);
    totalCell.value = { formula: `(C${r}/1000)*B${r}` };
    totalCell.numFmt = fmts.currency;
    totalCell.style = styles.number;
});
const inactivesEnd = currentRow - 1;
currentRow++;

// ==========================================
// PACKAGING
// ==========================================
addSection('Packaging');
const pkgStart = currentRow;
const packaging = [
    { name: "Amber Glass Jar (2oz)", cost: 1.15 },
    { name: "Plastic Lid (Black)", cost: 0.25 },
    { name: "Vinyl Label (Waterproof)", cost: 0.18 },
    { name: "Outer Box (Soft Touch)", cost: 0.45 },
    { name: "Tamper Seal", cost: 0.05 },
];
packaging.forEach(item => {
    const r = addDataRow(item.name, item.cost, null, null);
    worksheet.getCell(`B${r}`).numFmt = fmts.currency;
    // Total Cost = Cost * Units
    const totalCell = worksheet.getCell(`E${r}`);
    totalCell.value = { formula: `B${r}*C${rUnits}` };
    totalCell.numFmt = fmts.currency;
    totalCell.style = styles.number;
    // Per Unit
    const unitCell = worksheet.getCell(`F${r}`);
    unitCell.value = { formula: `B${r}` };
    unitCell.numFmt = fmts.currency;
    unitCell.style = styles.number;
});
const pkgEnd = currentRow - 1;
currentRow++;

// ==========================================
// COST SUMMARY
// ==========================================
addSection('Financial Summary');

// Potency Check
const rPotency = currentRow;
const potRow = worksheet.getRow(rPotency);
potRow.getCell(1).value = 'Actual Potency (mg)';
potRow.getCell(1).style = styles.data;
potRow.getCell(3).value = { formula: `SUMPRODUCT(C${activesStart}:C${activesEnd},D${activesStart}:D${activesEnd})*1000/C${rUnits}` };
potRow.getCell(3).style = { ...styles.number, font: { bold: true } };
potRow.getCell(3).numFmt = '#,##0.0" mg"';
// Conditional Format
worksheet.addConditionalFormatting({
    ref: `C${rPotency}`,
    rules: [{
        type: 'expression',
        formulae: [`ABS(C${rPotency}-C${rTargetPotency})>(C${rTargetPotency}*0.1)`],
        style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: COLORS.dangerBg } }, font: { color: { argb: COLORS.dangerText }, bold: true } }
    }]
});
currentRow++;

// Helper to add summary line
function addSummaryLine(label, formulaTotal, formulaUnit, bold = false) {
    const r = worksheet.getRow(currentRow);
    r.getCell(1).value = label;
    r.getCell(1).style = styles.data;
    if (bold) r.getCell(1).font = { bold: true };

    if (formulaTotal) {
        r.getCell(5).value = { formula: formulaTotal };
        r.getCell(5).numFmt = fmts.currency;
        r.getCell(5).style = styles.number;
    }
    if (formulaUnit) {
        r.getCell(6).value = { formula: formulaUnit };
        r.getCell(6).numFmt = fmts.currency;
        r.getCell(6).style = styles.number;
        if (bold) r.getCell(6).font = { bold: true };
    }
    return currentRow++;
}

const rTotalLabor = addSummaryLine('Total Labor', `B${rLaborRate}*C${rLaborHours}`, `E${currentRow}/C${rUnits}`);
const rTotalFulfill = addSummaryLine('Fulfillment', `B${rFulfill}*C${rUnits}`, `B${rFulfill}`);
const rTotalIng = addSummaryLine('Total Ingredients', `SUM(E${activesStart}:E${activesEnd},E${inactivesStart}:E${inactivesEnd})`, `E${currentRow}/C${rUnits}`);
const rTotalPkg = addSummaryLine('Total Packaging', `SUM(E${pkgStart}:E${pkgEnd})`, `SUM(F${pkgStart}:F${pkgEnd})`);

// FINAL COGS
const rFinal = currentRow;
const finalRow = worksheet.getRow(rFinal);
finalRow.getCell(1).value = 'TOTAL COGS';
finalRow.getCell(1).style = { ...styles.total, alignment: { horizontal: 'left' } };
// Merging for visual impact
worksheet.mergeCells(`A${rFinal}:E${rFinal}`);
finalRow.getCell(6).value = { formula: `F${rTotalLabor}+F${rTotalFulfill}+F${rTotalIng}+F${rTotalPkg}` };
finalRow.getCell(6).style = styles.total;
finalRow.getCell(6).numFmt = fmts.currency;
currentRow += 2;

// ==========================================
// MARGINS
// ==========================================
addSection('Pricing Strategy');
const rWholesale = addDataRow('Wholesale Price', 25, null, null);
worksheet.getCell(`B${rWholesale}`).numFmt = fmts.currency;
addSummaryLine('Wholesale Margin ($)', null, `B${rWholesale}-F${rFinal}`, true);
const rWsPct = currentRow;
const wsPctRow = worksheet.getRow(rWsPct);
wsPctRow.getCell(1).value = 'Wholesale Margin (%)';
wsPctRow.getCell(1).style = styles.data;
wsPctRow.getCell(6).value = { formula: `(B${rWholesale}-F${rFinal})/B${rWholesale}` };
wsPctRow.getCell(6).numFmt = fmts.percent;
wsPctRow.getCell(6).style = styles.number;
currentRow++;

currentRow++;
const rMSRP = addDataRow('MSRP (DTC)', 55, null, null);
worksheet.getCell(`B${rMSRP}`).numFmt = fmts.currency;
addSummaryLine('Retail Margin ($)', null, `B${rMSRP}-F${rFinal}`, true);
const rRetPct = currentRow;
const retPctRow = worksheet.getRow(rRetPct);
retPctRow.getCell(1).value = 'Retail Margin (%)';
retPctRow.getCell(1).style = styles.data;
retPctRow.getCell(6).value = { formula: `(B${rMSRP}-F${rFinal})/B${rMSRP}` };
retPctRow.getCell(6).numFmt = fmts.percent;
retPctRow.getCell(6).style = styles.number;

// Save
const filename = 'COGS_Calculator.xlsx';
await workbook.xlsx.writeFile(filename);
console.log(`Generated premium spreadsheet: ${filename}`);
