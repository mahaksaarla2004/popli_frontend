const fs = require('fs');
const file = 'node_modules/react-native-css-interop/dist/runtime/native/render-component.js';
let content = fs.readFileSync(file, 'utf8');
content = content.replace('function stringify(object) {', 'function stringify(object) { return "suppressed"; ');
fs.writeFileSync(file, content);
console.log('Patched');
