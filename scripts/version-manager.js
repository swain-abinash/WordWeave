/**
 * WordWeave App Version & Environment Manager
 * Centralizes version bumping, syncs package.json & version.json,
 * and handles DEV / UAT / PROD builds.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const VERSION_FILE = path.join(ROOT_DIR, 'version.json');
const PACKAGE_FILE = path.join(ROOT_DIR, 'package.json');

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function saveJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function getTodayString() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

function printStatus() {
  const versionData = loadJson(VERSION_FILE);
  console.log('\n======================================================');
  console.log('       WordWeave - Version & Environment Status       ');
  console.log('======================================================');
  console.log(` Version Name (SemVer) : ${versionData.versionName}`);
  console.log(` Version Code (Build)  : ${versionData.versionCode}`);
  console.log(` Last Updated          : ${versionData.buildDate}`);
  console.log('------------------------------------------------------');
  console.log(' Environment Variations:');
  console.log(`   [DEV]  : ${versionData.versionName}-dev  (Google Test Ads, Debug Logs)`);
  console.log(`   [UAT]  : ${versionData.versionName}-uat  (QA Validation, Strict Test Ads)`);
  console.log(`   [PROD] : ${versionData.versionName}      (Live AdMob Ads, Play Store Ready)`);
  console.log('------------------------------------------------------');
  console.log(' Available Commands:');
  console.log('   npm run version:patch    -> e.g. 1.0.2 -> 1.0.3  (Build: +1)');
  console.log('   npm run version:minor    -> e.g. 1.0.2 -> 1.1.0  (Build: +1)');
  console.log('   npm run version:major    -> e.g. 1.0.2 -> 2.0.0  (Build: +1)');
  console.log('   npm run build:dev        -> Build Development APK');
  console.log('   npm run build:uat        -> Build UAT QA APK');
  console.log('   npm run build:prod       -> Build Production Play Store AAB');
  console.log('======================================================\n');
}

function bump(type) {
  const v = loadJson(VERSION_FILE);
  const pkg = loadJson(PACKAGE_FILE);

  let [major, minor, patch] = [v.major, v.minor, v.patch];
  const oldVersion = v.versionName;
  const oldCode = v.versionCode;

  if (type === 'patch') {
    patch += 1;
  } else if (type === 'minor') {
    minor += 1;
    patch = 0;
  } else if (type === 'major') {
    major += 1;
    minor = 0;
    patch = 0;
  } else {
    console.error(`Unknown bump type: ${type}. Use 'patch', 'minor', or 'major'.`);
    process.exit(1);
  }

  const newVersion = `${major}.${minor}.${patch}`;
  const newCode = oldCode + 1;
  const today = getTodayString();

  v.major = major;
  v.minor = minor;
  v.patch = patch;
  v.versionName = newVersion;
  v.versionCode = newCode;
  v.buildDate = today;

  pkg.version = newVersion;

  saveJson(VERSION_FILE, v);
  saveJson(PACKAGE_FILE, pkg);

  console.log('\n Version bumped successfully!');
  console.log(`  Version Name : ${oldVersion} -> ${newVersion}`);
  console.log(`  Version Code : ${oldCode} -> ${newCode}`);
  console.log(`  Files updated: version.json, package.json\n`);
}

function setVersion(versionName, versionCode) {
  const v = loadJson(VERSION_FILE);
  const pkg = loadJson(PACKAGE_FILE);

  const parts = versionName.split('.').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    console.error('Invalid version format. Must be MAJOR.MINOR.PATCH (e.g. 1.2.0)');
    process.exit(1);
  }

  const newCode = versionCode ? parseInt(versionCode, 10) : v.versionCode + 1;
  const today = getTodayString();

  v.major = parts[0];
  v.minor = parts[1];
  v.patch = parts[2];
  v.versionName = versionName;
  v.versionCode = newCode;
  v.buildDate = today;

  pkg.version = versionName;

  saveJson(VERSION_FILE, v);
  saveJson(PACKAGE_FILE, pkg);

  console.log(`\n Version explicitly set to ${versionName} (Build ${newCode})\n`);
}

function runBuild(env) {
  const targetEnv = (env || 'prod').toUpperCase();
  const v = loadJson(VERSION_FILE);
  const versionString = targetEnv === 'PROD' ? v.versionName : `${v.versionName}-${targetEnv.toLowerCase()}`;

  console.log(`\n Starting [${targetEnv}] Build for WordWeave ${versionString} (Code: ${v.versionCode})...`);

  const androidDir = path.join(ROOT_DIR, 'android');
  const isWindows = process.platform === 'win32';
  const gradlewCmd = isWindows ? 'gradlew.bat' : './gradlew';

  let gradleTask = 'bundleRelease';
  if (targetEnv === 'DEV') {
    gradleTask = 'assembleDebug';
  } else if (targetEnv === 'UAT') {
    gradleTask = 'assembleRelease';
  }

  const fullCmd = `${gradlewCmd} ${gradleTask} -PappEnv=${targetEnv.toLowerCase()}`;
  console.log(`Executing in android/: ${fullCmd}\n`);

  try {
    execSync(fullCmd, { cwd: androidDir, stdio: 'inherit' });
    console.log(`\n [${targetEnv}] Build completed successfully!`);
    if (gradleTask.startsWith('bundle')) {
      console.log(` Artifact: android/app/build/outputs/bundle/release/app-release.aab`);
    } else if (gradleTask === 'assembleDebug') {
      console.log(` Artifact: android/app/build/outputs/apk/debug/app-debug.apk`);
    } else {
      console.log(` Artifact: android/app/build/outputs/apk/release/`);
    }
  } catch (err) {
    console.error(`\n Build failed:`, err.message);
    process.exit(1);
  }
}

// CLI Argument Handling
const args = process.argv.slice(2);
const command = (args[0] || 'status').toLowerCase();

switch (command) {
  case 'status':
    printStatus();
    break;
  case 'patch':
  case 'minor':
  case 'major':
    bump(command);
    break;
  case 'set':
    if (!args[1]) {
      console.error('Usage: node scripts/version-manager.js set <versionName> [versionCode]');
      process.exit(1);
    }
    setVersion(args[1], args[2]);
    break;
  case 'build':
    runBuild(args[1]);
    break;
  default:
    console.log(`Unknown command: ${command}`);
    printStatus();
    break;
}
