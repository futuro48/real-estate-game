import { questionBankPSI } from './questions-psi.js';

let total = 0;
for (const region of Object.values(questionBankPSI)) {
  for (const section of Object.values(region)) {
    total += section.length;
  }
}
console.log(`Total questions: ${total}`);