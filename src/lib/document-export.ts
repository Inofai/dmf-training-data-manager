import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Document, Paragraph, TextRun, Table, TableCell, TableRow, HeadingLevel, AlignmentType, WidthType } from "docx";
import { detectLanguage, isRTLLanguage } from "./language-utils";

export interface ExportDocument {
  id: string;
  title: string;
  status: string;
  created_at: string;
  submitter_email: string | null;
  trained: boolean;
  source_links: string[];
  original_content: string;
  qa_pairs: {
    question: string;
    answer: string;
    version: number;
    created_at: string;
  }[];
}

export const fetchDocumentsForExport = async (
  status?: string
): Promise<ExportDocument[]> => {
  try {
    let query = supabase
      .from("training_documents")
      .select(
        `
        id,
        title,
        status,
        created_at,
        submitter_email,
        trained,
        source_links,
        original_content,
        training_data (
          question,
          answer,
          version,
          created_at,
          is_current
        )
      `
      )
      .eq("training_data.is_current", true)
      .order("created_at", { ascending: false });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map((doc: any) => ({
      id: doc.id,
      title: doc.title,
      status: doc.status,
      created_at: doc.created_at,
      submitter_email: doc.submitter_email,
      trained: doc.trained,
      source_links: doc.source_links || [],
      original_content: doc.original_content,
      qa_pairs: (doc.training_data || []).map((qa: any) => ({
        question: qa.question,
        answer: qa.answer,
        version: qa.version,
        created_at: qa.created_at,
      })),
    }));
  } catch (error) {
    console.error("Error fetching documents for export:", error);
    throw error;
  }
};

export const exportToCSV = (documents: ExportDocument[], filename: string) => {
  const rows: string[][] = [];

  // Header
  rows.push([
    "Document ID",
    "Title",
    "Status",
    "Created At",
    "Submitter Email",
    "Trained",
    "Source Links",
    "Q&A Count",
    "Question",
    "Answer",
    "QA Version",
    "QA Created At",
  ]);

  // Data rows
  documents.forEach((doc) => {
    if (doc.qa_pairs.length === 0) {
      // Document with no Q&A pairs
      rows.push([
        doc.id,
        doc.title,
        doc.status,
        doc.created_at,
        doc.submitter_email || "",
        doc.trained ? "Yes" : "No",
        doc.source_links.join("; "),
        "0",
        "",
        "",
        "",
        "",
      ]);
    } else {
      // Document with Q&A pairs
      doc.qa_pairs.forEach((qa, index) => {
        rows.push([
          index === 0 ? doc.id : "", // Only show doc info on first row
          index === 0 ? doc.title : "",
          index === 0 ? doc.status : "",
          index === 0 ? doc.created_at : "",
          index === 0 ? doc.submitter_email || "" : "",
          index === 0 ? (doc.trained ? "Yes" : "No") : "",
          index === 0 ? doc.source_links.join("; ") : "",
          index === 0 ? doc.qa_pairs.length.toString() : "",
          qa.question.replace(/"/g, '""'), // Escape quotes
          qa.answer.replace(/"/g, '""'),
          qa.version.toString(),
          qa.created_at,
        ]);
      });
    }
  });

  // Convert to CSV string
  const csvContent = rows
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  // Create and download file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToJSON = (documents: ExportDocument[], filename: string) => {
  const jsonContent = JSON.stringify(documents, null, 2);

  const blob = new Blob([jsonContent], { type: "application/json" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = (documents: ExportDocument[], filename: string) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(16);
  doc.text("Training Documents Export", 14, 15);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);
  doc.text(`Total Documents: ${documents.length}`, 14, 27);
  
  let yPosition = 35;
  
  documents.forEach((document, docIndex) => {
    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Detect if content contains RTL text
    const titleLang = detectLanguage(document.title);
    const isRTL = isRTLLanguage(titleLang);
    
    // Document header
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    const titleText = `Document ${docIndex + 1}: ${document.title}`;
    if (isRTL) {
      // For RTL, align right
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.text(titleText, pageWidth - 14, yPosition, { align: "right" });
    } else {
      doc.text(titleText, 14, yPosition);
    }
    yPosition += 7;
    
    doc.setFontSize(9);
    doc.setFont(undefined, "normal");
    const idText = `ID: ${document.id}`;
    if (isRTL) {
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.text(idText, pageWidth - 14, yPosition, { align: "right" });
    } else {
      doc.text(idText, 14, yPosition);
    }
    yPosition += 5;
    
    if (document.source_links.length > 0) {
      const sourcesText = `Sources: ${document.source_links.join(", ")}`;
      if (isRTL) {
        const pageWidth = doc.internal.pageSize.getWidth();
        doc.text(sourcesText, pageWidth - 14, yPosition, { align: "right" });
      } else {
        doc.text(sourcesText, 14, yPosition);
      }
      yPosition += 5;
    }
    
    yPosition += 3;
    
    // Q&A Pairs
    if (document.qa_pairs.length > 0) {
      const tableData = document.qa_pairs.map((qa, index) => {
        const qLang = detectLanguage(qa.question);
        const aLang = detectLanguage(qa.answer);
        return [
          `Q${index + 1}`,
          qa.question.substring(0, 100) + (qa.question.length > 100 ? "..." : ""),
          qa.answer.substring(0, 100) + (qa.answer.length > 100 ? "..." : ""),
          `v${qa.version}`,
        ];
      });
      
      autoTable(doc, {
        startY: yPosition,
        head: [["#", "Question", "Answer", "Ver"]],
        body: tableData,
        theme: "grid",
        styles: { 
          fontSize: 8, 
          cellPadding: 2,
          halign: isRTL ? 'right' : 'left',
        },
        headStyles: {
          halign: isRTL ? 'right' : 'left',
        },
        columnStyles: {
          0: { cellWidth: 15, halign: 'center' },
          1: { cellWidth: 70 },
          2: { cellWidth: 70 },
          3: { cellWidth: 15, halign: 'center' },
        },
        margin: { left: 14 },
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 10;
    } else {
      doc.setFontSize(8);
      doc.setTextColor(150);
      const noPairsText = "No Q&A pairs";
      if (isRTL) {
        const pageWidth = doc.internal.pageSize.getWidth();
        doc.text(noPairsText, pageWidth - 14, yPosition, { align: "right" });
      } else {
        doc.text(noPairsText, 14, yPosition);
      }
      doc.setTextColor(0);
      yPosition += 10;
    }
  });
  
  doc.save(filename);
};

export const exportToWord = async (documents: ExportDocument[], filename: string) => {
  const sections: any[] = [];
  
  // Title section
  const titleParagraphs = [
    new Paragraph({
      text: "Training Documents Export",
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: `Generated: ${new Date().toLocaleString()}`,
      spacing: { after: 100 },
    }),
    new Paragraph({
      text: `Total Documents: ${documents.length}`,
      spacing: { after: 400 },
    }),
  ];
  
  const documentParagraphs: any[] = [];
  
  documents.forEach((document, docIndex) => {
    // Detect RTL
    const titleLang = detectLanguage(document.title);
    const isRTL = isRTLLanguage(titleLang);
    
    // Document header
    documentParagraphs.push(
      new Paragraph({
        text: `Document ${docIndex + 1}: ${document.title}`,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
        bidirectional: isRTL,
        alignment: isRTL ? AlignmentType.RIGHT : AlignmentType.LEFT,
      })
    );
    
    documentParagraphs.push(
      new Paragraph({
        children: [
          new TextRun({ text: "ID: ", bold: true }),
          new TextRun(document.id),
        ],
        spacing: { after: 100 },
        bidirectional: isRTL,
        alignment: isRTL ? AlignmentType.RIGHT : AlignmentType.LEFT,
      })
    );
    
    if (document.source_links.length > 0) {
      documentParagraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: "Sources: ", bold: true }),
            new TextRun(document.source_links.join(", ")),
          ],
          spacing: { after: 200 },
          bidirectional: isRTL,
          alignment: isRTL ? AlignmentType.RIGHT : AlignmentType.LEFT,
        })
      );
    }
    
    // Q&A Pairs
    if (document.qa_pairs.length > 0) {
      documentParagraphs.push(
        new Paragraph({
          text: "Q&A Pairs",
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 200 },
          bidirectional: isRTL,
          alignment: isRTL ? AlignmentType.RIGHT : AlignmentType.LEFT,
        })
      );
      
      const tableRows = [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "#", bold: true })] })],
              width: { size: 10, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "Question", bold: true })] })],
              width: { size: 40, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "Answer", bold: true })] })],
              width: { size: 40, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "Version", bold: true })] })],
              width: { size: 10, type: WidthType.PERCENTAGE },
            }),
          ],
        }),
      ];
      
      document.qa_pairs.forEach((qa, index) => {
        const qLang = detectLanguage(qa.question);
        const aLang = detectLanguage(qa.answer);
        const qIsRTL = isRTLLanguage(qLang);
        const aIsRTL = isRTLLanguage(aLang);
        
        tableRows.push(
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ text: `Q${index + 1}` })],
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    text: qa.question,
                    bidirectional: qIsRTL,
                    alignment: qIsRTL ? AlignmentType.RIGHT : AlignmentType.LEFT,
                  }),
                ],
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    text: qa.answer,
                    bidirectional: aIsRTL,
                    alignment: aIsRTL ? AlignmentType.RIGHT : AlignmentType.LEFT,
                  }),
                ],
              }),
              new TableCell({
                children: [new Paragraph({ text: `v${qa.version}` })],
              }),
            ],
          })
        );
      });
      
      const table = new Table({
        rows: tableRows,
        width: { size: 100, type: WidthType.PERCENTAGE },
      });
      
      documentParagraphs.push(table);
    } else {
      documentParagraphs.push(
        new Paragraph({
          text: "No Q&A pairs",
          spacing: { after: 200 },
          bidirectional: isRTL,
          alignment: isRTL ? AlignmentType.RIGHT : AlignmentType.LEFT,
        })
      );
    }
    
    // Add spacing between documents
    documentParagraphs.push(
      new Paragraph({
        text: "",
        spacing: { after: 400 },
      })
    );
  });
  
  const doc = new Document({
    sections: [
      {
        children: [...titleParagraphs, ...documentParagraphs],
      },
    ],
  });
  
  // Generate and download
  const { Packer } = await import("docx");
  const blob = await Packer.toBlob(doc);
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
