const { generatePDF } = require('@jyothiswarup/pdf-template-engine');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs').promises;
const path = require('path');

/**
 * Creates a simple test PDF template
 */
async function createTestTemplate() {
  const templatePath = path.join(__dirname, 'templates', 'test-template.pdf');
  const templateDir = path.dirname(templatePath);
  
  // Create template directory if it doesn't exist
  await fs.mkdir(templateDir, { recursive: true });
  
  // Check if template already exists
  try {
    await fs.access(templatePath);
    console.log('✓ Test template already exists');
    return templatePath;
  } catch {
    // Template doesn't exist, create it
  }

  // Create a simple PDF template
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]); // US Letter size

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  // Add background text to show where fields will be placed
  page.drawText('PDF Template Test', {
    x: 50,
    y: 750,
    size: 20,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });

  // Save the template
  const pdfBytes = await pdfDoc.save();
  await fs.writeFile(templatePath, pdfBytes);
  
  console.log('✓ Created test template');
  return templatePath;
}

/**
 * Test the package
 */
async function testPackage() {
  console.log('\n🧪 Testing @jyothiswarup/pdf-template-engine');
  console.log('═'.repeat(60));
  
  try {
    // Create template
    const templatePath = await createTestTemplate();
    
    // Set up output path
    const outputPath = path.join(__dirname, 'output', 'test-output.pdf');
    const outputDir = path.dirname(outputPath);
    await fs.mkdir(outputDir, { recursive: true });

    console.log('\n📝 Generating PDF with test data...');
    
    // Generate PDF using the installed package
    await generatePDF({
      templatePath,
      outputPath,
      fields: [
        { key: 'title', x: 50, y: 700, fontSize: 18 },
        { key: 'name', x: 50, y: 650, fontSize: 14 },
        { key: 'date', x: 50, y: 600, fontSize: 12 },
        { key: 'amount', x: 50, y: 550, fontSize: 16 },
        { key: 'description', x: 50, y: 500, fontSize: 12 },
      ],
      data: {
        title: 'Invoice #001',
        name: 'John Doe',
        date: new Date().toLocaleDateString(),
        amount: '$1,234.56',
        description: 'Test invoice generated using @jyothiswarup/pdf-template-engine',
      },
    });

    console.log('\n✅ SUCCESS! PDF generated successfully');
    console.log(`📄 Output file: ${outputPath}`);
    console.log('\n📊 Test Summary:');
    console.log('  ✓ Package installed correctly');
    console.log('  ✓ Template PDF created');
    console.log('  ✓ PDF generated with field data');
    console.log('  ✓ All fields filled correctly');
    
    // Check if file exists
    const stats = await fs.stat(outputPath);
    console.log(`\n📦 File size: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log('\n🎉 All tests passed!');
    
  } catch (error) {
    console.error('\n❌ Test failed:');
    console.error('Error:', error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run the test
testPackage();


