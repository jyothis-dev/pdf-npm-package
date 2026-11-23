// Generates public/sample-certificate.pdf — a blank certificate template for the demo.
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { writeFile } from 'fs/promises';

const W = 842, H = 595; // A4 landscape, points
const doc = await PDFDocument.create();
doc.setTitle('Sample certificate template');
const page = doc.addPage([W, H]);
const serif = await doc.embedFont(StandardFonts.TimesRomanBold);
const sans = await doc.embedFont(StandardFonts.Helvetica);
const sansBold = await doc.embedFont(StandardFonts.HelveticaBold);

const navy = rgb(0.11, 0.17, 0.33);
const gold = rgb(0.76, 0.6, 0.27);
const grey = rgb(0.42, 0.45, 0.5);
// helper: y measured from the top, like the builder
const T = (y) => H - y;
const center = (text, font, size, y, color) =>
  page.drawText(text, { x: (W - font.widthOfTextAtSize(text, size)) / 2, y: T(y), size, font, color });
const line = (x1, x2, y, color = navy, thickness = 1) =>
  page.drawLine({ start: { x: x1, y: T(y) }, end: { x: x2, y: T(y) }, thickness, color });

page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: rgb(0.99, 0.98, 0.96) });
page.drawRectangle({ x: 24, y: 24, width: W - 48, height: H - 48, borderColor: navy, borderWidth: 3 });
page.drawRectangle({ x: 34, y: 34, width: W - 68, height: H - 68, borderColor: gold, borderWidth: 1 });

center('YOUR ACADEMY', sansBold, 14, 90, gold);
center('Certificate of Completion', serif, 40, 145, navy);
center('THIS CERTIFIES THAT', sans, 12, 195, grey);
line(221, 621, 262);                                   // student name
center('has successfully completed the course', sans, 15, 300, navy);
line(221, 621, 360);                                   // course name

// footer: date (left) and certificate id (right)
line(110, 300, 470);
page.drawText('Date', { x: 110, y: T(488), size: 11, font: sans, color: grey });
line(542, 732, 470);
page.drawText('Certificate ID', { x: 542, y: T(488), size: 11, font: sans, color: grey });

await writeFile(new URL('../public/sample-certificate.pdf', import.meta.url), await doc.save());
console.log('wrote public/sample-certificate.pdf');
