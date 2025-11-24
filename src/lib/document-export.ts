import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
    
    // Document header
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text(`Document ${docIndex + 1}: ${document.title}`, 14, yPosition);
    yPosition += 7;
    
    doc.setFontSize(9);
    doc.setFont(undefined, "normal");
    doc.text(`Status: ${document.status} | Trained: ${document.trained ? "Yes" : "No"}`, 14, yPosition);
    yPosition += 5;
    doc.text(`Created: ${new Date(document.created_at).toLocaleDateString()}`, 14, yPosition);
    yPosition += 5;
    
    if (document.submitter_email) {
      doc.text(`Submitter: ${document.submitter_email}`, 14, yPosition);
      yPosition += 5;
    }
    
    if (document.source_links.length > 0) {
      doc.text(`Sources: ${document.source_links.join(", ")}`, 14, yPosition);
      yPosition += 5;
    }
    
    yPosition += 3;
    
    // Q&A Pairs
    if (document.qa_pairs.length > 0) {
      const tableData = document.qa_pairs.map((qa, index) => [
        `Q${index + 1}`,
        qa.question.substring(0, 80) + (qa.question.length > 80 ? "..." : ""),
        qa.answer.substring(0, 80) + (qa.answer.length > 80 ? "..." : ""),
        `v${qa.version}`,
      ]);
      
      autoTable(doc, {
        startY: yPosition,
        head: [["#", "Question", "Answer", "Ver"]],
        body: tableData,
        theme: "grid",
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 70 },
          2: { cellWidth: 70 },
          3: { cellWidth: 15 },
        },
        margin: { left: 14 },
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 10;
    } else {
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text("No Q&A pairs", 14, yPosition);
      doc.setTextColor(0);
      yPosition += 10;
    }
  });
  
  doc.save(filename);
};
