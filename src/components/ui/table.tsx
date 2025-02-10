import React, { ReactNode } from "react";

interface TableProps {
  children: ReactNode;
}

export function Table({ children }: TableProps) {
  return <table className="w-full border border-gray-200 rounded-md">{children}</table>;
}

export function TableHeader({ children }: TableProps) {
  return <thead className="bg-gray-100">{children}</thead>;
}

export function TableRow({ children }: TableProps) {
  return <tr className="border-t border-gray-200">{children}</tr>;
}

export function TableHead({ children }: TableProps) {
  return <th className="px-4 py-2 text-left text-gray-800">{children}</th>;
}

export function TableBody({ children }: TableProps) {
  return <tbody>{children}</tbody>;
}

export function TableCell({ children }: TableProps) {
  return <td className="px-4 py-2">{children}</td>;
}
