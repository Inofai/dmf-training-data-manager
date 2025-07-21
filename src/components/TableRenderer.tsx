
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface TableData {
  headers: string[];
  rows: string[][];
}

interface TableRendererProps {
  content: string;
  className?: string;
}

const TableRenderer: React.FC<TableRendererProps> = ({ content, className = '' }) => {
  const parseMarkdownTable = (markdown: string): TableData | null => {
    const lines = markdown.trim().split('\n');
    if (lines.length < 3) return null;

    // Parse headers
    const headerLine = lines[0];
    const separatorLine = lines[1];
    
    // Check if it's a valid table format
    if (!separatorLine.includes('|') || !separatorLine.includes('-')) {
      return null;
    }

    const headers = headerLine
      .split('|')
      .map(cell => cell.trim())
      .filter(cell => cell.length > 0);

    // Parse rows
    const rows = lines.slice(2).map(line => 
      line
        .split('|')
        .map(cell => cell.trim())
        .filter(cell => cell.length > 0)
    ).filter(row => row.length > 0);

    return { headers, rows };
  };

  const tableData = parseMarkdownTable(content);

  if (!tableData) {
    return null;
  }

  return (
    <div className={`my-4 ${className}`}>
      <Table className="border border-gray-200 rounded-lg overflow-hidden">
        <TableHeader>
          <TableRow className="bg-gray-50">
            {tableData.headers.map((header, index) => (
              <TableHead key={index} className="font-semibold text-gray-800 border-r border-gray-200 last:border-r-0">
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {tableData.rows.map((row, rowIndex) => (
            <TableRow key={rowIndex} className="hover:bg-gray-50">
              {row.map((cell, cellIndex) => (
                <TableCell key={cellIndex} className="border-r border-gray-200 last:border-r-0">
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TableRenderer;
