"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const admin = __importStar(require("firebase-admin"));
// Initialize Admin SDK - this will use GOOG_APPLICATION_CREDENTIALS or default to local emulator if configured
if (admin.apps.length === 0) {
    if (process.env.FIRESTORE_EMULATOR_HOST) {
        console.log(`[LocalRunner] Using Emulator: ${process.env.FIRESTORE_EMULATOR_HOST}`);
        admin.initializeApp({ projectId: 'demo-project' });
    }
    else {
        // Attempt to use default creds (requires successful `gcloud auth application-default login` OR `firebase login`)
        console.log(`[LocalRunner] Using Default Credentials (Production/Project)`);
        admin.initializeApp();
    }
}
const run = async () => {
    const target = process.argv[2]; // 'umf' or 'guru'
    const isManual = process.argv.includes('--manual');
    console.log(`[LocalRunner] Starting ${target || 'umf'}... (Manual Mode: ${isManual})`);
    try {
        if (target === 'guru') {
            await (0, index_1.runGuruLogic)(isManual);
        }
        else {
            // Default to umf
            await (0, index_1.runUmfLogic)(isManual);
        }
        console.log('[LocalRunner] Completed successfully.');
        process.exit(0);
    }
    catch (error) {
        console.error('[LocalRunner] Failed:', error);
        process.exit(1);
    }
};
run();
//# sourceMappingURL=run-local.js.map