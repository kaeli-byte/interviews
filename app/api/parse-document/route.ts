import { NextRequest, NextResponse } from 'next/server'
import { PDFParse } from 'pdf-parse'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('file') as File

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  // Validate file type
  const validTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
  if (!validTypes.includes(file.type)) {
    return NextResponse.json(
      { error: 'Unsupported file type. Please upload a PDF or Word document.' },
      { status: 400 }
    )
  }

  try {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    let text = ''

    if (file.type === 'application/pdf') {
      const pdf = new PDFParse({ data: buffer })
      const result = await pdf.getText()
      text = result.text
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const mammoth = await import('mammoth')
      const result = await mammoth.extractRawText({ buffer })
      text = result.value
    }

    // Validate extracted text
    const isEmpty = !text || text.trim().length === 0
    const cleaned = text.replace(/[\s\n\r]+/g, '')
    const isNonsense = cleaned.length < 20

    return NextResponse.json({
      text: text || '',
      success: true,
      isEmpty: isEmpty || isNonsense
    })
  } catch (error) {
    console.error('Parse error:', error)
    return NextResponse.json(
      { error: 'Failed to parse document. The file may be encrypted or corrupted.' },
      { status: 500 }
    )
  }
}
