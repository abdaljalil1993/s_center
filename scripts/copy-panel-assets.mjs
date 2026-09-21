import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();
const sourceViews = path.join(projectRoot, 'src', 'panel', 'views');
const targetViews = path.join(projectRoot, 'dist', 'panel', 'views');
const sourceChart = path.join(projectRoot, 'node_modules', 'chart.js', 'dist', 'chart.umd.js');
const targetChart = path.join(projectRoot, 'public', 'vendor', 'chart.umd.js');

if (!fs.existsSync(sourceViews)) {
  throw new Error(`Panel views not found at ${sourceViews}`);
}

if (!fs.existsSync(sourceChart)) {
  throw new Error(`Chart.js bundle not found at ${sourceChart}`);
}

fs.mkdirSync(path.dirname(targetViews), { recursive: true });
fs.cpSync(sourceViews, targetViews, { recursive: true });

fs.mkdirSync(path.dirname(targetChart), { recursive: true });
fs.copyFileSync(sourceChart, targetChart);