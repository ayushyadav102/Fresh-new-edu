const fs = require('fs');
let code = fs.readFileSync('src/context/ERPContext.tsx', 'utf8');

// Insert the missing imports at the top
const importsToAdd = `
import { isMockDataEnabled } from '../config/dataConfig';
import { saveStudentToCloud, saveTeacherToCloud } from '../services/cloudDbService';
import { fetchWithAuth } from '../lib/api-client';
`;

code = code.replace("import React, { createContext, useContext, useState, useEffect } from 'react';", "import React, { createContext, useContext, useState, useEffect } from 'react';\n" + importsToAdd);

fs.writeFileSync('src/context/ERPContext.tsx', code);
