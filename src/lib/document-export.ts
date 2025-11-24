import { supabase } from "@/integrations/supabase/client";

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
